import os
from fastapi import APIRouter, HTTPException

from db.base import Base
from db.session import engine

router = APIRouter(prefix="/test", tags=["test-utils"])


def _ensure_allowed():
    if os.getenv("ALLOW_TEST_ENDPOINTS", "false").lower() != "true":
        raise HTTPException(status_code=403, detail="Test endpoints are disabled")


@router.post("/seed")
def seed():
    """Seed minimal data (superuser). Only enabled when ALLOW_TEST_ENDPOINTS=true."""
    _ensure_allowed()
    # Import here to avoid side-effects at module import time
    from scripts.seed import seed_superuser

    seed_superuser()
    return {"status": "seeded"}


@router.post("/cleanup")
def cleanup():
    """Drop and recreate all tables for a clean DB state. Only enabled when ALLOW_TEST_ENDPOINTS=true."""
    _ensure_allowed()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return {"status": "cleaned"}
