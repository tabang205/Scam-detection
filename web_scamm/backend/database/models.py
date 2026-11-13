"""
SQLAlchemy ORM models.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON

from database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Analyst")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)           # nullable for anonymous scans
    message = Column(Text, nullable=False)
    source = Column(String(50), default="Manual")       # SMS, Email, WhatsApp, Manual
    prediction = Column(String(10), nullable=False)     # "Scam" or "Safe"
    confidence = Column(Float, nullable=False)
    threat_level = Column(String(10), nullable=False)   # "High", "Medium", "Low"
    keywords = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
