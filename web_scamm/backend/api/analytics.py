"""
Analytics API endpoint.
GET /api/analytics
"""

import json
import logging
import os
from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from api.auth import get_current_user
from database.db import get_db
from database.models import ScanHistory, User
from database.schemas import AnalyticsResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["analytics"])


def _load_model_report_metrics() -> tuple[float, float, float, float]:
    accuracy = 0.0
    f1_score = 0.0
    scan_latency = 0.0
    model_size_mb = 0.0

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    report_path = os.path.join(base_dir, "output", "system_performance_report.json")
    if not os.path.exists(report_path):
        return accuracy, f1_score, scan_latency, model_size_mb

    try:
        with open(report_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        metrics = data.get("metrics", {})
        acc_val = float(metrics.get("accuracy", 0.0))
        f1_val = float(metrics.get("f1_score", 0.0))
        accuracy = round(acc_val * 100 if 0 < acc_val <= 1.0 else acc_val, 2)
        f1_score = round(f1_val * 100 if 0 < f1_val <= 1.0 else f1_val, 2)
        scan_latency = round(float(data.get("system", {}).get("latency_per_sample_ms", 0.0)), 2)
        model_size_mb = round(float(data.get("system", {}).get("model_size_mb", 0.0)), 2)
    except Exception as exc:
        logger.warning("Failed to parse system_performance_report.json: %s", exc)

    return accuracy, f1_score, scan_latency, model_size_mb


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return user-scoped analytics aggregated from real database records."""
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=days)

    scoped = db.query(ScanHistory).filter(
        ScanHistory.user_id == current_user.id,
        ScanHistory.created_at >= since,
    )

    total = scoped.count()
    scams = scoped.filter(ScanHistory.prediction == "Scam").count()
    avg_conf_row = scoped.with_entities(func.avg(ScanHistory.confidence)).scalar()
    avg_confidence = round(float(avg_conf_row), 2) if avg_conf_row else 0.0

    scam_ratio = (scams / total) if total > 0 else 0.0
    if scam_ratio >= 0.4:
        threat_level = "High"
    elif scam_ratio >= 0.15:
        threat_level = "Medium"
    else:
        threat_level = "Low"

    records = scoped.order_by(desc(ScanHistory.created_at)).all()

    # Daily trend across the selected window (capped cleanly for chart readability)
    bucket_days = min(days, 14)
    day_buckets: dict[str, int] = {}
    daily_labels: list[str] = []
    for offset in range(bucket_days - 1, -1, -1):
        day_dt = (now - timedelta(days=offset)).date()
        key = day_dt.isoformat()
        day_buckets[key] = 0
        daily_labels.append(day_dt.strftime("%d/%m"))

    # 6 x 4-hour buckets for the past 24 hours
    hourly_data = [0] * 6
    hourly_labels = ["20h trước", "16h trước", "12h trước", "8h trước", "4h trước", "Hiện tại"]

    keyword_counter: Counter[str] = Counter()
    recent_threats: list[dict] = []

    for rec in records:
        created_utc = _to_utc(rec.created_at)
        date_key = created_utc.date().isoformat()
        if date_key in day_buckets:
            day_buckets[date_key] += 1

        hours_ago = (now - created_utc).total_seconds() / 3600.0
        if 0 <= hours_ago <= 24:
            bucket_idx = max(0, min(5, 5 - int(hours_ago // 4)))
            hourly_data[bucket_idx] += 1

        if rec.prediction == "Scam":
            for kw in rec.keywords or []:
                keyword_counter[str(kw)] += 1
            if len(recent_threats) < 8:
                recent_threats.append({
                    "id": rec.id,
                    "source": rec.source,
                    "message": rec.message,
                    "threat_level": rec.threat_level,
                    "confidence": rec.confidence,
                    "created_at": created_utc.isoformat(),
                })

    max_kw_count = max(keyword_counter.values(), default=0)
    keyword_stats = [
        {
            "keyword": kw,
            "count": count,
            "percentage": round((count / max_kw_count) * 100) if max_kw_count else 0,
        }
        for kw, count in keyword_counter.most_common(6)
    ]

    accuracy, f1_score, scan_latency, model_size_mb = _load_model_report_metrics()

    return AnalyticsResponse(
        total_scanned=total,
        scams_detected=scams,
        avg_confidence=avg_confidence,
        threat_level=threat_level,
        accuracy=accuracy,
        scan_latency=scan_latency,
        f1_score=f1_score,
        model_size_mb=model_size_mb,
        trend_data=list(day_buckets.values()),
        daily_labels=daily_labels,
        hourly_data=hourly_data,
        hourly_labels=hourly_labels,
        keyword_stats=keyword_stats,
        recent_threats=recent_threats,
    )
