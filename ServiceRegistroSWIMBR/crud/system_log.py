import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from uuid import UUID

from models.system_log import SystemLog, LogSeverity
from schemas.system_log import SystemLogCreate, SystemLogFilter

def create_log(db: Session, log_in: SystemLogCreate, autocommit: bool = True) -> SystemLog:
    obj_in_data = log_in.model_dump(exclude_unset=True)
    # se veio metadata_, renomeia pra propriedade associada aa coluna no banco
    if "metadata_" in obj_in_data:
        obj_in_data["metadata_"] = obj_in_data.pop("metadata_")

    db_log = SystemLog(**obj_in_data)
    db.add(db_log)
    if autocommit:
        db.commit()
        db.refresh(db_log)
    else:
        db.flush()
    return db_log

def _apply_filters(query, filters: Optional[SystemLogFilter]):
    if filters:
        if filters.event_type:
            query = query.filter(SystemLog.event_type == filters.event_type)
        if filters.severity:
            query = query.filter(SystemLog.severity == filters.severity)
        if filters.user_id:
            query = query.filter(SystemLog.user_id == filters.user_id)
        if filters.resource_type:
            query = query.filter(SystemLog.resource_type == filters.resource_type)
        if filters.start_date:
            query = query.filter(SystemLog.timestamp >= filters.start_date)
        if filters.end_date:
            query = query.filter(SystemLog.timestamp <= filters.end_date)
        if filters.search:
            search_clause = f"%{filters.search}%"
            query = query.filter(
                or_(
                    SystemLog.error_message.ilike(search_clause),
                    SystemLog.endpoint.ilike(search_clause),
                    SystemLog.resource_id.ilike(search_clause)
                )
            )
    return query

def get_logs(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    filters: Optional[SystemLogFilter] = None
) -> List[SystemLog]:
    query = db.query(SystemLog)
    query = _apply_filters(query, filters)
    return query.order_by(SystemLog.timestamp.desc()).offset(skip).limit(limit).all()

def count_logs(db: Session, filters: Optional[SystemLogFilter] = None) -> int:
    query = db.query(SystemLog)
    query = _apply_filters(query, filters)
    return query.count()

def get_log_statistics(db: Session) -> Dict[str, Any]:
    """Retorna estatísticas formatadas conforme esperado pela UI."""
    now = datetime.datetime.now(datetime.timezone.utc)
    one_day_ago = now - datetime.timedelta(days=1)
    
    # Total de Logs
    total_logs = db.query(func.count(SystemLog.id)).scalar() or 0
    
    # Erros nas últimas 24h
    error_count_24h = db.query(func.count(SystemLog.id)).filter(
        SystemLog.severity.in_([LogSeverity.ERROR, LogSeverity.CRITICAL]),
        SystemLog.timestamp >= one_day_ago
    ).scalar() or 0
    
    # Latência Média de API nas últimas 24h
    avg_response_time = db.query(func.avg(SystemLog.response_time_ms)).filter(
        SystemLog.response_time_ms.isnot(None),
        SystemLog.timestamp >= one_day_ago
    ).scalar() or 0.0
    
    return {
        "total_logs": total_logs,
        "error_count_24h": error_count_24h,
        "avg_response_time": float(avg_response_time)
    }
