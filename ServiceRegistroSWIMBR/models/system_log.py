import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Index, Integer, JSON, Uuid, Text
from sqlalchemy import Enum as SAEnum

from db.base import Base

class EventType(str, enum.Enum):
    # Auditoria
    RESOURCE_CREATE = "RESOURCE_CREATE"
    RESOURCE_UPDATE = "RESOURCE_UPDATE"
    RESOURCE_DELETE = "RESOURCE_DELETE"
    BULK_OPERATIONS = "BULK_OPERATIONS"
    # Auth
    AUTH_SIGNUP = "AUTH_SIGNUP"
    AUTH_LOGIN = "AUTH_LOGIN"
    AUTH_LOGOUT = "AUTH_LOGOUT"
    AUTH_PASSWORD_CHANGE = "AUTH_PASSWORD_CHANGE"
    AUTH_PASSWORD_RESET = "AUTH_PASSWORD_RESET"
    AUTH_TOKEN_REFRESH = "AUTH_TOKEN_REFRESH"
    AUTH_PERMISSION_DENIED = "AUTH_PERMISSION_DENIED"
    # Sistema
    API_ERROR = "API_ERROR"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    FILE_UPLOAD = "FILE_UPLOAD"
    FILE_DOWNLOAD = "FILE_DOWNLOAD"
    EXPORT_DATA = "EXPORT_DATA"
    IMPORT_DATA = "IMPORT_DATA"
    # Metricas
    SLOW_QUERY = "SLOW_QUERY"
    HIGH_MEMORY_USAGE = "HIGH_MEMORY_USAGE"
    API_RESPONSE_TIME = "API_RESPONSE_TIME"

class LogSeverity(str, enum.Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    event_type = Column(SAEnum(EventType), nullable=False, index=True)
    severity = Column(SAEnum(LogSeverity), default=LogSeverity.INFO, nullable=False)
    
    # Contexto do Usuario
    user_id = Column(String(50), nullable=True, index=True)
    user_email = Column(String(254), nullable=True)
    user_ip = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Contexto da Operacao
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    action = Column(String(50), nullable=True)
    
    # Detalhes Tecnicos
    endpoint = Column(String(255), nullable=True)
    method = Column(String(10), nullable=True)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    
    # Payload
    changes = Column(JSON, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True) # Nome reserved "metadata"
    error_message = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)

    __table_args__ = (
        Index("ix_system_logs_timestamp_event_type", "timestamp", "event_type"),
        Index("ix_system_logs_user_id_timestamp", "user_id", "timestamp"),
    )
