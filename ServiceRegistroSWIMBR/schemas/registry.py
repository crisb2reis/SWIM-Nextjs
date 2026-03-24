from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RegistryBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    created_on: Optional[datetime] = None
    updated_on: Optional[datetime] = None

    model_config = {"from_attributes": True}


# GeographicalExtent

class GeographicalExtentCreate(RegistryBase):
    geometry: Optional[str] = None
    profile_id: Optional[int] = None
    source_id: Optional[int] = None


class GeographicalExtentRead(GeographicalExtentCreate):
    id: int


# Policy

class PolicyCreate(RegistryBase):
    profile_id: Optional[int] = None
    source_id: Optional[int] = None


class PolicyRead(PolicyCreate):
    id: int


# SecurityMechanism

class SecurityMechanismCreate(RegistryBase):
    category_id: Optional[int] = None
    profile_id: Optional[int] = None
    protocol_id: Optional[int] = None


class SecurityMechanismRead(SecurityMechanismCreate):
    id: int
