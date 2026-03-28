from datetime import datetime
from typing import Optional, Any, Dict, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models.system_log import EventType, LogSeverity

class LogChangeItem(BaseModel):
    field: str
    old_value: Any
    new_value: Any

class SystemLogBase(BaseModel):
    event_type: EventType
    severity: LogSeverity = LogSeverity.INFO
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_ip: Optional[str] = None
    user_agent: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    status_code: Optional[int] = None
    response_time_ms: Optional[int] = None
    response_time_ms: Optional[int] = None
    changes: Optional[List[LogChangeItem]] = None
    
    # Convenção: `metadata_` evita conflito de sintaxe do nome restrito do SQLAlchemy Base
    # E é roteado com o correspondente banco usando alias e populate_by_name=True.
    metadata_: Optional[Dict[str, Any]] = Field(default=None, serialization_alias="metadata")
    error_message: Optional[str] = None
    stack_trace: Optional[str] = None

class SystemLogCreate(SystemLogBase):
    pass

class SystemLogRead(SystemLogBase):
    id: UUID
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class SystemLogFilter(BaseModel):
    event_type: Optional[EventType] = None
    severity: Optional[LogSeverity] = None
    user_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    resource_type: Optional[str] = None
    search: Optional[str] = None # Busca livre em text (usada fortemente na UI/UX para procurar paths ou detalhes)
