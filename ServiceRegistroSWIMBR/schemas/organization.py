from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from models.organization import OrganizationStatus, OrganizationTipo


class OrganizationBase(BaseModel):
    name: str
    acronym: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    tipo: Optional[OrganizationTipo] = OrganizationTipo.OUTRO
    status: Optional[OrganizationStatus] = OrganizationStatus.ATIVO

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Nome não pode ser vazio")
        return v.strip()


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    acronym: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    tipo: Optional[OrganizationTipo] = None
    status: Optional[OrganizationStatus] = None


class OrganizationRead(OrganizationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
