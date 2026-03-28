import datetime
import time
from collections import defaultdict
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.dependencies import get_current_active_user, get_db
from db.session import SessionLocal
from crud.system_log import get_logs, get_log_statistics, count_logs, create_log
from schemas.system_log import SystemLogRead, SystemLogFilter, SystemLogCreate
from models.user import User
from models.system_log import EventType, LogSeverity

router = APIRouter()

# --- Common Dependencies & Utilities ---
def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores.")
    return current_user

class GenericStatusResponse(BaseModel):
    status: str

# Basic In-Memory Rate Limiting
_rate_limit_store = defaultdict(list)

def check_rate_limit(request: Request, limit: int = 10, window_sec: int = 60):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    _rate_limit_store[client_ip] = [ts for ts in _rate_limit_store[client_ip] if now - ts < window_sec]
    if len(_rate_limit_store[client_ip]) >= limit:
        raise HTTPException(status_code=429, detail="Too Many Requests")
    _rate_limit_store[client_ip].append(now)

def _save_frontend_log(log_in: SystemLogCreate):
    db = SessionLocal()
    try:
        create_log(db, log_in)
    except Exception:
        pass
    finally:
        db.close()

@router.get("", response_model=Any)
def read_logs(
    filters: SystemLogFilter = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> Any:
    """Busca eventos de sistema paginados."""
    logs = get_logs(db, skip=skip, limit=limit, filters=filters)
    total = count_logs(db, filters=filters)
    
    logs_parsed = [SystemLogRead.model_validate(log).model_dump(mode="json") for log in logs]
    return {"total": total, "items": logs_parsed}

@router.get("/statistics", response_model=Any)
def read_log_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Dashboard de métricas dos logs."""
    stats = get_log_statistics(db)
    return stats

@router.post("/frontend", response_model=GenericStatusResponse)
def create_frontend_log(
    log_in: SystemLogCreate,
    request: Request,
    background_tasks: BackgroundTasks,
) -> GenericStatusResponse:
    """Endpoint público segregado de ingressão de falhas advindas pelo Frontend"""
    check_rate_limit(request, limit=20, window_sec=60) # Permite 20 reports por minuto de IP
    
    log_in.user_ip = request.client.host if request.client else log_in.user_ip
    log_in.user_agent = request.headers.get("user-agent") or log_in.user_agent
    
    background_tasks.add_task(_save_frontend_log, log_in)
    return GenericStatusResponse(status="ok")
