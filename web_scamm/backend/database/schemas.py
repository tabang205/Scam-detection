"""
Pydantic v2 schemas for request/response validation.
"""

from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, field_serializer


# ── Auth ───────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Detect ─────────────────────────────────────────────────────────
class DetectRequest(BaseModel):
    message: str
    source: str = "Manual"


class DetectResponse(BaseModel):
    prediction: str
    confidence: float
    threat_level: str
    keywords: list[str]


# ── History ────────────────────────────────────────────────────────
class HistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    source: str
    prediction: str
    confidence: float
    threat_level: str
    keywords: list[str]
    created_at: datetime

    @field_serializer("created_at")
    def serialize_datetime(self, dt: datetime) -> str:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc).isoformat()
        return dt.isoformat()


class HistoryResponse(BaseModel):
    items: list[HistoryItem]
    total: int
    page: int
    limit: int
    scam_total: int = 0
    safe_total: int = 0


# ── Analytics ──────────────────────────────────────────────────────
class AnalyticsResponse(BaseModel):
    total_scanned: int
    scams_detected: int
    avg_confidence: float
    threat_level: str
    accuracy: float
    scan_latency: float = 0.0
    f1_score: float = 0.0
    model_size_mb: float = 0.0
    trend_data: list[int] = []
    daily_labels: list[str] = []
    hourly_data: list[int] = []
    hourly_labels: list[str] = []
    keyword_stats: list[dict] = []
    recent_threats: list[dict] = []
