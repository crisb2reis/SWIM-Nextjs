from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class UploadedFileRead(BaseModel):
    id: int
    file: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# --- Document ---


class DocumentBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    date_issued: Optional[date] = None
    location: Optional[str] = None
    publish: Optional[str] = None
    version: Optional[str] = None


class DocumentCreate(DocumentBase):
    uploadfile_id: Optional[int] = None


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date_issued: Optional[date] = None
    location: Optional[str] = None
    publish: Optional[str] = None
    version: Optional[str] = None
    uploadfile_id: Optional[int] = None


class DocumentRead(DocumentBase):
    id: int
    uploadfile_id: Optional[int] = None
    uploadfile: Optional[UploadedFileRead] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    data: list[DocumentRead]
