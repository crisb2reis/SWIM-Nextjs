import functools
from typing import Any, Callable, List, Optional
from sqlalchemy.orm import Session
from models.system_log import EventType, LogSeverity
from schemas.system_log import SystemLogCreate, LogChangeItem
from crud.system_log import create_log

def audit_log(event_type: EventType, resource_type: str):
    """
    Decorator para auditar automaticamente operações CRUD de gravação.
    Captura o estado anterior do objeto para gerar diff em caso de UPDATE.
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Tenta encontrar a sessão do banco nos argumentos
            db = kwargs.get("db") or next((arg for arg in args if isinstance(arg, Session)), None)
            
            # Se for UPDATE, tentamos capturar o estado ATUAL do objeto antes da modificação
            old_data = None
            if event_type == EventType.RESOURCE_UPDATE:
                try:
                    # Convenção: O objeto a ser atualizado costuma ser o 2º argumento ou 'db_user'/'db_obj'
                    target = args[1] if len(args) > 1 else (kwargs.get("db_user") or kwargs.get("db_obj"))
                    if target and hasattr(target, "__table__"):
                        old_data = {c.name: getattr(target, c.name) for c in target.__table__.columns}
                except Exception:
                    pass

            # Executa a operação
            result = func(*args, **kwargs)
            
            # Persistência do Log de Auditoria
            if db:
                try:
                    # Se result é o objeto persistido, extraímos metadados
                    resource_id = str(getattr(result, "id", None)) if result else None
                    changes = None
                    
                    # Se tínhamos estado anterior, calculamos o Diff com o estado resultante
                    if old_data and result:
                        new_data = {c.name: getattr(result, c.name) for c in result.__table__.columns}
                        changes = generate_diff(old_data, new_data)

                    log_data = SystemLogCreate(
                        event_type=event_type,
                        severity=LogSeverity.INFO,
                        resource_type=resource_type,
                        resource_id=resource_id,
                        action=func.__name__,
                        changes=changes
                    )
                    # Usamos autocommit=True por padrão no create_log para garantir que o log
                    # seja salvo mesmo se a transação do CRUD for revertida externamente (opcional)
                    create_log(db, log_data)
                except Exception as e:
                    import logging
                    logging.error(f"Audit log failed for {func.__name__}: {e}")
            
            return result
        return wrapper
    return decorator

def generate_diff(old_dict: dict, new_dict: dict) -> List[LogChangeItem]:
    """Extrai campos alterados ignorando senhas e campos sensíveis por padrão."""
    changes = []
    sensitive_fields = {"hashed_password", "password", "token", "secret"}
    
    for key, new_val in new_dict.items():
        if key in sensitive_fields:
            continue
            
        if key in old_dict:
            old_val = old_dict[key]
            if old_val != new_val:
                changes.append(
                    LogChangeItem(
                        field=key,
                        old_value=str(old_val) if old_val is not None else None,
                        new_value=str(new_val) if new_val is not None else None
                    )
                )
    return changes
