"""
Upload the fine-tuned XLM-RoBERTa weights and model card to Hugging Face Hub (bangta/Scam-detection).
Requires prior authentication via `hf auth login` or `HF_TOKEN` env var with write permission.
"""

import os
import sys
from pathlib import Path

from huggingface_hub import HfApi

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT_DIR / "model" / "xlmr_scam_shield"
REPO_ID = os.getenv("HF_MODEL_REPO", "bangta/Scam-detection")
TOKEN = os.getenv("HF_TOKEN") or None

MODEL_CARD = """---
language:
- vi
- en
tags:
- scam-detection
- phishing
- text-classification
- xlm-roberta
base_model: xlm-roberta-base
metrics:
- accuracy
- f1
---

# AI Scam Shield — XLM-RoBERTa Scam & Phishing Classifier (v2)

Multilingual (`vi` / `en`) scam, spam, and phishing detector fine-tuned from `xlm-roberta-base`.

## Training Datasets
- Full 35-shard `Data_Preprocessing.zip` (~34.25M raw rows deduplicated and domain-balanced)
- `ngovanhh/vi-fraud-bench-vi`
- `tuan251209/vietnamese-sms-dataset`
- `uciml/sms-spam-collection-dataset`
- `naserabdullahalam/phishing-email-dataset`

## Evaluation Results (`threshold = 0.69`, `max_length = 128`)
- **Combined Test Set (12,878 samples)**: Accuracy `97.61%`, Precision `97.08%`, Recall `96.24%`, F1 `96.66%`, ROC-AUC `99.65%`
- **VI Fraud Bench (400 samples)**: Accuracy `98.75%`, F1 `98.75%`
- **VI SMS Test (597 samples)**: Accuracy `92.46%`, F1 `86.15%`
- **100-Sample Realistic Benchmark**: `98/100` (`98.0%`, F1 `0.9804`)

## Preprocessing Contract
Before tokenizing, normalize URLs so domain tokens are preserved:
- `https://csgt-tracuuphat.com/pay` -> `[url] csgt tracuuphat com pay`
- Underscores `_` replaced with spaces.
"""


def main() -> int:
    if not MODEL_DIR.exists() or not (MODEL_DIR / "model.safetensors").exists():
        raise FileNotFoundError(f"Model directory with model.safetensors not found at '{MODEL_DIR}'")

    api = HfApi(token=TOKEN)
    identity = api.whoami()
    sys.stdout.write(f"Authenticated as: {identity.get('name')}\n")

    api.create_repo(repo_id=REPO_ID, repo_type="model", exist_ok=True)
    api.upload_folder(
        repo_id=REPO_ID,
        repo_type="model",
        folder_path=str(MODEL_DIR),
        commit_message="Upload XLM-RoBERTa v2 weights, tokenizer, threshold (0.69), and benchmark report",
    )
    api.upload_file(
        repo_id=REPO_ID,
        repo_type="model",
        path_or_fileobj=MODEL_CARD.encode("utf-8"),
        path_in_repo="README.md",
        commit_message="Add XLM-RoBERTa v2 model card",
    )
    sys.stdout.write(f"Successfully uploaded model to https://huggingface.co/{REPO_ID}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
