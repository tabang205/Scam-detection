"""
End-to-end API & preprocessing verification tests for AI Scam Shield.
Tests auth normalization, JWT isolation, preprocessing consistency, and word-boundary keywords.
"""

import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app import app  # noqa: E402
from database.db import Base, get_db  # noqa: E402
from services.keyword_service import extract_keywords  # noqa: E402
from services.preprocess_service import clean_text  # noqa: E402


def build_test_client(tmp_db_path: Path) -> TestClient:
    engine = create_engine(
        f"sqlite:///{tmp_db_path}",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app), engine


def test_preprocess_and_keywords():
    assert clean_text("of_the joined_telegram") == "of the joined telegram"
    assert clean_text("Click https://bit.ly/win123 now!") == "[url] click bit ly now!"
    assert clean_text("truy_cập https://qua-tang-vip.xyz ngay") == "[url] truy cập qua tang vip xyz ngay"

    # Substring false positives must not trigger on unrelated words
    assert extract_keywords("Check out my LinkedIn profile") == []
    assert extract_keywords("Clicking around the documentation") == []
    assert "tài khoản bị khóa" in extract_keywords("Cảnh báo: Tài khoản bị khóa tạm thời")


def test_auth_and_jwt_isolation(tmp_path: Path):
    client, engine = build_test_client(tmp_path / "test_auth.db")
    try:
        # Unauthenticated endpoints must return 401
        assert client.get("/api/history").status_code == 401
        assert client.get("/api/analytics").status_code == 401
        assert client.post("/api/detect", json={"message": "hello"}).status_code == 401

        # Case-insensitive email registration & login
        res = client.post(
            "/api/auth/register",
            json={"name": "Alice", "email": "  Alice@Example.COM ", "password": "Password123!"},
        )
        assert res.status_code == 200, res.text

        dup = client.post(
            "/api/auth/register",
            json={"name": "Alice2", "email": "alice@example.com", "password": "Password123!"},
        )
        assert dup.status_code == 400

        login = client.post(
            "/api/auth/login",
            json={"email": "ALICE@example.com", "password": "Password123!"},
        )
        assert login.status_code == 200
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        assert client.get("/api/history", headers=headers).status_code == 200
        assert client.get("/api/analytics", headers=headers).status_code == 200
    finally:
        app.dependency_overrides.clear()
        engine.dispose()


if __name__ == "__main__":
    import tempfile

    test_preprocess_and_keywords()
    with tempfile.TemporaryDirectory() as td:
        test_auth_and_jwt_isolation(Path(td))
    print("ALL_WORKFLOW_TESTS_PASSED")
