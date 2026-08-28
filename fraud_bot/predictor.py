"""
predictor.py
Tầng xử lý AI cho Fraud Shield Bot.
Load ScamClassifier (PhoBERT + LoRA tự xây dựng) từ merged_model.pt và thực hiện inference.
"""

import sys
from types import ModuleType
# Sửa lỗi bộ cài đặt distributed của torch trên Windows
_m = ModuleType("hf_storage")
_m.HuggingFaceStorageWriter = object
sys.modules["torch.distributed.checkpoint.hf_storage"] = _m

import re
import math
import time # Đo thời gian chạy
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoTokenizer

# ──────────────────────────────────────────────
# CONFIG & ĐỊNH NGHĨA KIẾN TRÚC MÔ HÌNH TỪ NOTEBOOK
# ──────────────────────────────────────────────
MODEL_NAME = "vinai/phobert-base"
MAX_LENGTH = 128
BEST_MODEL_PATH = "merged_model.pt" 

LABELS = {0: "✅ CLEAN", 1: "🚨 SCAM"}

class PhoBertConfig:
    vocab_size              = 64001
    hidden_size             = 768
    num_layers              = 12
    num_heads               = 12
    intermediate_size       = 3072
    max_position_embeddings = 258
    type_vocab_size         = 1
    hidden_dropout          = 0.1
    attention_dropout       = 0.1
    layer_norm_eps          = 1e-5
    pad_token_id            = 1

PBCFG = PhoBertConfig()

class PhoBertEmbeddings(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.word_emb   = nn.Embedding(c.vocab_size, c.hidden_size, padding_idx=c.pad_token_id)
        self.pos_emb    = nn.Embedding(c.max_position_embeddings, c.hidden_size)
        self.type_emb   = nn.Embedding(c.type_vocab_size, c.hidden_size)
        self.layer_norm = nn.LayerNorm(c.hidden_size, eps=c.layer_norm_eps)
        self.dropout    = nn.Dropout(c.hidden_dropout)
        self.register_buffer('pos_ids', torch.arange(c.max_position_embeddings).unsqueeze(0))

    def forward(self, input_ids, token_type_ids=None):
        B, L    = input_ids.shape
        pos     = self.pos_ids[:, :L]
        ttids   = torch.zeros_like(input_ids) if token_type_ids is None else token_type_ids
        x       = self.word_emb(input_ids) + self.pos_emb(pos) + self.type_emb(ttids)
        return self.dropout(self.layer_norm(x))

class PhoBertSelfAttention(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.num_heads = c.num_heads
        self.head_dim  = c.hidden_size // c.num_heads
        self.q         = nn.Linear(c.hidden_size, c.hidden_size)
        self.k         = nn.Linear(c.hidden_size, c.hidden_size)
        self.v         = nn.Linear(c.hidden_size, c.hidden_size)
        self.attn_drop = nn.Dropout(c.attention_dropout)

    def split_heads(self, x):
        B, L, _ = x.shape
        return x.view(B, L, self.num_heads, self.head_dim).transpose(1, 2)

    def forward(self, x, mask=None):
        Q, K, V = self.split_heads(self.q(x)), self.split_heads(self.k(x)), self.split_heads(self.v(x))
        sc      = torch.matmul(Q, K.transpose(-1, -2)) / math.sqrt(self.head_dim)
        if mask is not None:
            sc = sc + mask
        w   = self.attn_drop(torch.softmax(sc, dim=-1))
        out = torch.matmul(w, V)
        B, H, L, D = out.shape
        return out.transpose(1, 2).contiguous().view(B, L, H * D)

class PhoBertSelfOutput(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.dense      = nn.Linear(c.hidden_size, c.hidden_size)
        self.layer_norm = nn.LayerNorm(c.hidden_size, eps=c.layer_norm_eps)
        self.dropout    = nn.Dropout(c.hidden_dropout)

    def forward(self, x, residual):
        return self.layer_norm(self.dropout(self.dense(x)) + residual)

class PhoBertAttention(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.self_attn = PhoBertSelfAttention(c)
        self.output    = PhoBertSelfOutput(c)

    def forward(self, x, mask=None):
        return self.output(self.self_attn(x, mask), x)

class PhoBertIntermediate(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.dense = nn.Linear(c.hidden_size, c.intermediate_size)

    def forward(self, x):
        return F.gelu(self.dense(x))

class PhoBertLayerOutput(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.dense      = nn.Linear(c.intermediate_size, c.hidden_size)
        self.layer_norm = nn.LayerNorm(c.hidden_size, eps=c.layer_norm_eps)
        self.dropout    = nn.Dropout(c.hidden_dropout)

    def forward(self, x, residual):
        return self.layer_norm(self.dropout(self.dense(x)) + residual)

class PhoBertLayer(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.attention    = PhoBertAttention(c)
        self.intermediate = PhoBertIntermediate(c)
        self.out          = PhoBertLayerOutput(c)

    def forward(self, x, mask=None):
        a = self.attention(x, mask)
        return self.out(self.intermediate(a), a)

class PhoBertEncoder(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.layers = nn.ModuleList([PhoBertLayer(c) for _ in range(c.num_layers)])

    def forward(self, x, mask=None):
        for layer in self.layers:
            x = layer(x, mask)
        return x

class PhoBertPooler(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.dense = nn.Linear(c.hidden_size, c.hidden_size)

    def forward(self, x):
        return torch.tanh(self.dense(x[:, 0]))

class PhoBertModel(nn.Module):
    def __init__(self, cfg=PBCFG):
        super().__init__()
        self.embeddings = PhoBertEmbeddings(cfg)
        self.encoder    = PhoBertEncoder(cfg)
        self.pooler     = PhoBertPooler(cfg)

    def _extend_mask(self, mask):
        return (1.0 - mask.float().unsqueeze(1).unsqueeze(2)) * -10000.0

    def forward(self, input_ids, attention_mask=None):
        m = self._extend_mask(attention_mask) if attention_mask is not None else None
        h = self.embeddings(input_ids)
        h = self.encoder(h, m)
        return h, self.pooler(h)

class LoRALinear(nn.Module):
    def __init__(self, linear: nn.Linear, r: int, alpha: int, dropout: float = 0.0):
        super().__init__()
        self.original = linear
        self.r        = r
        self.scaling  = alpha / r
        self.merged   = False

        for p in self.original.parameters():
            p.requires_grad = False

        in_f  = linear.in_features
        out_f = linear.out_features
        self.lora_A   = nn.Parameter(torch.randn(r, in_f) / math.sqrt(r))
        self.lora_B   = nn.Parameter(torch.zeros(out_f, r))
        self.dropout  = nn.Dropout(dropout) if dropout > 0 else nn.Identity()

    def forward(self, x):
        base  = self.original(x)
        if self.merged:
            return base
        delta = F.linear(self.dropout(x), self.lora_B @ self.lora_A) * self.scaling
        return base + delta

def inject_lora(phobert: PhoBertModel, r: int, alpha: int, dropout: float):
    for i in range(PBCFG.num_layers):
        sa = phobert.encoder.layers[i].attention.self_attn
        sa.q = LoRALinear(sa.q, r, alpha, dropout)
        sa.v = LoRALinear(sa.v, r, alpha, dropout)

# ──────────────────────────────────────────────
# CẤU TRÚC SCAMCLASSIFIER CHUẨN TỪ NOTEBOOK
# ──────────────────────────────────────────────
class ScamClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        H = PBCFG.hidden_size # 768
        self.encoder = PhoBertModel()
        
        # Tiêm LoRA thủ công khớp cấu trúc huấn luyện
        inject_lora(self.encoder, r=16, alpha=32, dropout=0.1)

        # Bộ ánh xạ metadata tuần tự (3 -> 32 chiều)
        self.meta_proj = nn.Sequential(
            nn.Linear(3, 32),
            nn.ReLU(),
            nn.Linear(32, 32),
            nn.ReLU(),
        )

        # Đầu phân loại nhận 768 + 32 = 800 chiều
        self.head = nn.Sequential(
            nn.Linear(H + 32, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 2),
        )

    def forward(self, input_ids, attention_mask, metadata):
        _, cls = self.encoder(input_ids, attention_mask)
        meta   = self.meta_proj(metadata)
        return self.head(torch.cat([cls, meta], dim=-1))


# ──────────────────────────────────────────────
# TRÌNH QUẢN LÝ DỰ ĐOÁN SINGLETON
# ──────────────────────────────────────────────
class FraudPredictor:
    def __init__(self):
        self.device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = None
        self.model     = None
        self._load()

    def _load(self):
        print(f"[Predictor] Loading tokenizer từ {MODEL_NAME}...")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

        print(f"[Predictor] Khởi tạo kiến trúc ScamClassifier gốc...")
        base_model = ScamClassifier()

        print(f"[Predictor] Loading weights từ {BEST_MODEL_PATH}...")
        ckpt = torch.load(BEST_MODEL_PATH, map_location=self.device)
        
        # Hỗ trợ lấy đúng tầng dữ liệu tùy theo cách lưu của tệp checkpoint
        w = ckpt.get("model", ckpt.get("model_state", ckpt))
        
        base_model.load_state_dict(w)
        self.model = base_model.to(self.device)
        self.model.eval()
        print(f"[Predictor] ✅ Model hoàn chỉnh sẵn sàng | Device: {self.device}")

    @staticmethod
    def _has_url(text: str) -> float:
        url_pattern = re.compile(
            r"(https?://|www\.)\S+|"
            r"\b\w+\.(com|net|org|vn|io|me|co)\b",
            re.IGNORECASE
        )
        return 1.0 if url_pattern.search(text) else 0.0

    def predict(self, text: str) -> dict:
        t0 = time.perf_counter() # Ghi thời gian đầu
        if not text or not text.strip():
            return {
                "label": 0, "label_text": "✅ CLEAN",
                "confidence": 100.0, "prob_scam": 0.0, "prob_safe": 1.0,
                "has_url": False
            }

        enc = self.tokenizer(
            text,
            max_length=MAX_LENGTH,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        input_ids      = enc["input_ids"].to(self.device)
        attention_mask = enc["attention_mask"].to(self.device)

        has_url    = self._has_url(text)
        verified   = 0.0    
        n_subs_norm= 0.0    
        metadata = torch.tensor([[has_url, verified, n_subs_norm]], dtype=torch.float).to(self.device)

        with torch.no_grad():
            logits = self.model(input_ids, attention_mask, metadata)
            probs  = torch.softmax(logits, dim=1)[0]

        prob_safe = probs[0].item()
        prob_scam = probs[1].item()
        label     = 1 if prob_scam > prob_safe else 0
        confidence= max(prob_safe, prob_scam) * 100

        print(f"[Inference] {time.perf_counter() - t0:.4f}s") # In tốc độ xử lý
        return {
            "label"     : label,
            "label_text": LABELS[label],
            "confidence": round(confidence, 2),
            "prob_scam" : round(prob_scam, 4),
            "prob_safe" : round(prob_safe, 4),
            "has_url"   : bool(has_url),
        }

predictor = FraudPredictor()

def predict(text: str) -> dict:
    return predictor.predict(text)
