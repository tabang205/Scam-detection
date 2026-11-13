"""
Application configuration.
Centralises all paths, secrets, and settings.
"""

import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent          # backend/
PROJECT_ROOT = BASE_DIR.parent                              # web_scamm/
MODEL_DIR = PROJECT_ROOT / "model"
XLMR_MODEL_DIR = Path(os.getenv("XLMR_MODEL_DIR", str(MODEL_DIR / "xlmr_scam_shield")))
HF_MODEL_REPO = os.getenv("HF_MODEL_REPO", "bangta/Scam-detection")
HF_TOKEN = os.getenv("HF_TOKEN") or None
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'scamshield.db'}")


# ── Security ───────────────────────────────────────────────────────
DEFAULT_DEV_SECRET_KEY = "scam-shield-dev-secret-key-change-in-prod"
SECRET_KEY = os.getenv("SECRET_KEY", DEFAULT_DEV_SECRET_KEY)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ── AI Model ───────────────────────────────────────────────────────
MODEL_MAX_LENGTH = 128          # Matches XLM-RoBERTa training sequence length
NUM_LABELS = 2                  # Binary: Scam / Safe
LABEL_MAP = {0: "Safe", 1: "Scam"}

# ── CORS ───────────────────────────────────────────────────────────
CORS_ORIGINS = [
    "http://localhost:5173",    # Vite dev server
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
