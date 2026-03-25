from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional


class OrganizationBase(BaseModel):
    name: str
    acronym: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

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


class OrganizationRead(OrganizationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
