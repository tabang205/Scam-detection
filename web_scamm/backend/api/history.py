"""
Scan History API endpoint.
GET /api/history
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from api.auth import get_current_user
from database.db import get_db
from database.models import ScanHistory, User
from database.schemas import HistoryItem, HistoryResponse

router = APIRouter(tags=["history"])


@router.get("/history", response_model=HistoryResponse)
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=500),
    filter: str = Query("all"),
    search: str | None = Query(None),
    sort: str = Query("newest"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return paginated scan history scoped to the authenticated user."""
    base_query = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id)

    scam_total = base_query.filter(ScanHistory.prediction == "Scam").count()
    safe_total = base_query.filter(ScanHistory.prediction == "Safe").count()

    query = base_query
    if filter == "scam":
        query = query.filter(ScanHistory.prediction == "Scam")
    elif filter == "safe":
        query = query.filter(ScanHistory.prediction == "Safe")

    if search:
        query = query.filter(ScanHistory.message.ilike(f"%{search.strip()}%"))

    if sort == "oldest":
        order_col = asc(ScanHistory.created_at)
    elif sort == "confidence":
        order_col = desc(ScanHistory.confidence)
    else:
        order_col = desc(ScanHistory.created_at)

    total = query.count()
    items = (
        query
        .order_by(order_col, desc(ScanHistory.id))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return HistoryResponse(
        items=[HistoryItem.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit,
        scam_total=scam_total,
        safe_total=safe_total,
    )
