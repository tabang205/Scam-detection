"""
Pre-download the fine-tuned XLM-RoBERTa model from Hugging Face Hub into model/xlmr_scam_shield/.
Useful before offline execution or building self-contained Docker images.
"""

import os
import sys
from pathlib import Path

from huggingface_hub import snapshot_download

ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_REPO = os.getenv("HF_MODEL_REPO", "bangta/Scam-detection")
TARGET_DIR = Path(os.getenv("XLMR_MODEL_DIR", str(ROOT_DIR / "model" / "xlmr_scam_shield")))
TOKEN = os.getenv("HF_TOKEN") or None


def main() -> int:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    sys.stdout.write(f"Downloading '{DEFAULT_REPO}' -> '{TARGET_DIR}'...\n")
    snapshot_download(
        repo_id=DEFAULT_REPO,
        local_dir=str(TARGET_DIR),
        token=TOKEN,
    )
    sys.stdout.write("Model download completed.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
