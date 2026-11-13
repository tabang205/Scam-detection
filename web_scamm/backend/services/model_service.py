"""
AI Model inference service.
Loads the fine-tuned XLM-RoBERTa classifier and calibrated decision threshold.
"""

import json
import logging
import threading
from pathlib import Path
from typing import Tuple

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from utils.config import HF_MODEL_REPO, HF_TOKEN, MODEL_MAX_LENGTH, XLMR_MODEL_DIR

logger = logging.getLogger("scam_shield.model")

_lock = threading.Lock()
_model = None
_tokenizer = None
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_threshold = 0.5


def _load_threshold(model_dir: Path) -> float:
    threshold_path = model_dir / "threshold.json"
    if not threshold_path.exists():
        return 0.5
    try:
        with open(threshold_path, "r", encoding="utf-8") as f:
            return float(json.load(f).get("threshold", 0.5))
    except (OSError, ValueError, TypeError) as exc:
        logger.warning("Failed to read threshold.json, falling back to 0.5: %s", exc)
        return 0.5


def _has_local_weights(model_dir: Path) -> bool:
    has_config = (model_dir / "config.json").exists()
    has_weights = (model_dir / "model.safetensors").exists() or (model_dir / "pytorch_model.bin").exists()
    return has_config and has_weights


def _ensure_model_dir(model_dir: Path) -> Path:
    """Return a ready local model directory, downloading from Hugging Face Hub if absent."""
    if _has_local_weights(model_dir):
        return model_dir

    if not HF_MODEL_REPO:
        raise FileNotFoundError(
            f"Trained XLM-RoBERTa model not found at '{model_dir}' and HF_MODEL_REPO is empty."
        )

    from huggingface_hub import snapshot_download

    logger.info("Local weights missing at %s; downloading from Hugging Face Hub '%s'...", model_dir, HF_MODEL_REPO)
    model_dir.mkdir(parents=True, exist_ok=True)
    snapshot_download(
        repo_id=HF_MODEL_REPO,
        local_dir=str(model_dir),
        token=HF_TOKEN,
    )
    if not _has_local_weights(model_dir):
        raise FileNotFoundError(
            f"Downloaded repo '{HF_MODEL_REPO}' into '{model_dir}', but config.json or weights are still missing."
        )
    return model_dir


def _load_model() -> None:
    """Lazy-load the XLM-RoBERTa model and tokenizer in a thread-safe way."""
    global _model, _tokenizer, _threshold
    if _model is not None:
        return

    with _lock:
        if _model is not None:
            return

        model_dir = _ensure_model_dir(Path(XLMR_MODEL_DIR))

        logger.info("Loading XLM-RoBERTa model from %s on %s", model_dir, _device)
        tokenizer = AutoTokenizer.from_pretrained(str(model_dir))
        load_dtype = torch.float16 if _device.type == "cuda" else torch.float32
        model = AutoModelForSequenceClassification.from_pretrained(
            str(model_dir),
            torch_dtype=load_dtype,
        )
        model.to(_device)
        model.eval()

        _threshold = _load_threshold(model_dir)
        _tokenizer = tokenizer
        _model = model
        logger.info("Model loaded (threshold=%.4f, device=%s)", _threshold, _device)


def get_threshold() -> float:
    """Return the currently loaded classification threshold."""
    _load_model()
    return _threshold


def predict(cleaned_text: str) -> Tuple[int, float]:
    """Run inference on normalized text and return (pred_class, class_confidence)."""
    _load_model()

    encoded = _tokenizer(
        cleaned_text,
        max_length=MODEL_MAX_LENGTH,
        padding=True,
        truncation=True,
        return_tensors="pt",
    )
    input_ids = encoded["input_ids"].to(_device)
    attention_mask = encoded["attention_mask"].to(_device)

    with torch.no_grad():
        outputs = _model(input_ids=input_ids, attention_mask=attention_mask)
        probs = torch.softmax(outputs.logits.float(), dim=-1)
        scam_prob = float(probs[0, 1].item())

    pred_class = 1 if scam_prob >= _threshold else 0
    confidence = scam_prob if pred_class == 1 else (1.0 - scam_prob)
    return pred_class, confidence
