from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ContactPointBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr
    role: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=30)
    organization_id: int


class ContactPointCreate(ContactPointBase):
    pass


class ContactPointUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=30)
    organization_id: Optional[int] = None


class ContactPointRead(ContactPointBase):
    id: int
    created_at: datetime
    updated_at: datetime
    organization_name: Optional[str] = None

    class Config:
        from_attributes = True
