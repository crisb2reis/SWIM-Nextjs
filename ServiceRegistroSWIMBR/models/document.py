from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from db.base import Base


class Document(Base):
    __tablename__ = "utilities_document"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    date_issued = Column(Date, nullable=True)
    location = Column(String(512), nullable=True)
    publish = Column(String(255), nullable=True)   # nome do publicador / organização
    version = Column(String(50), nullable=True)

    uploadfile_id = Column(Integer, ForeignKey("utilities_uploadedfile.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    uploadfile = relationship("UploadedFile")
