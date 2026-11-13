"""
AI Scam Shield — FastAPI Application Entry Point.

Lifespan:
  - On startup: initialise database.
  - On shutdown: release resources.

CORS is configured for the Vite dev server (localhost:5173).
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from utils.config import CORS_ORIGINS, DEFAULT_DEV_SECRET_KEY, SECRET_KEY
from database.db import init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("scam_shield")


# ── Lifespan ───────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    logger.info("AI Scam Shield starting up...")
    if SECRET_KEY == DEFAULT_DEV_SECRET_KEY:
        logger.warning("Using default development SECRET_KEY; set SECRET_KEY env var in production.")
    init_db()
    logger.info("Database initialised; AI model will load lazily on first detect request.")

    yield

    logger.info("AI Scam Shield shutting down.")


# ── App ────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Scam Shield API",
    description="Real-time scam detection powered by Custom Transformer AI Model",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ───────────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "online", "service": "AI Scam Shield", "version": "1.0.0"}


# ── Register Routers ──────────────────────────────────────────────
from api.detect import router as detect_router
from api.auth import router as auth_router
from api.history import router as history_router
from api.analytics import router as analytics_router

app.include_router(detect_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(history_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
