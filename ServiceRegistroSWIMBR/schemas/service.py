from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional

from models.service import (
    ServiceStatus,
    ServiceLifeCycle,
    ServiceTipo,
    ServicePublishStatus,
)


class ServiceBase(BaseModel):
    name: str
    organization: Optional[str] = None
    version: Optional[str] = None
    status: Optional[ServiceStatus] = ServiceStatus.EM_APROVACAO
    life_cycle: Optional[ServiceLifeCycle] = ServiceLifeCycle.PROPOSTA
    tipo: Optional[ServiceTipo] = ServiceTipo.OUTRO
    publish_status: Optional[ServicePublishStatus] = ServicePublishStatus.RASCUNHO

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Nome não pode ser vazio")
        return v.strip()


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    version: Optional[str] = None
    status: Optional[ServiceStatus] = None
    life_cycle: Optional[ServiceLifeCycle] = None
    tipo: Optional[ServiceTipo] = None
    publish_status: Optional[ServicePublishStatus] = None


class ServiceRead(ServiceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
