"""
Scam Detection API endpoint.
POST /api/detect
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.auth import get_current_user
from database.db import get_db
from database.models import ScanHistory, User
from database.schemas import DetectRequest, DetectResponse
from services.detect_service import detect

logger = logging.getLogger(__name__)
router = APIRouter(tags=["detect"])


@router.post("/detect", response_model=DetectResponse)
def detect_scam(
    request: DetectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyse a text message using the trained AI model and persist scan history."""
    text = request.message.strip()
    if not text:
        return {
            "prediction": "Safe",
            "confidence": 100.0,
            "threat_level": "Low",
            "keywords": [],
        }

    try:
        result = detect(text)
    except Exception as exc:
        logger.error("Model inference failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=503,
            detail=f"AI model inference failed: {exc}",
        )

    source = (request.source or "Manual").strip()[:50] or "Manual"
    try:
        scan_record = ScanHistory(
            user_id=current_user.id,
            message=text[:2000],
            source=source,
            prediction=result["prediction"],
            confidence=result["confidence"],
            threat_level=result["threat_level"],
            keywords=result["keywords"],
        )
        db.add(scan_record)
        db.commit()
    except Exception as exc:
        logger.warning("Failed to persist scan history for user %s: %s", current_user.id, exc)
        db.rollback()

    return result
