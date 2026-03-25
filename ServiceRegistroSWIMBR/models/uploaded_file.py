from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from db.base import Base


class UploadedFile(Base):
    __tablename__ = "utilities_uploadedfile"

    id = Column(Integer, primary_key=True, index=True)
    file = Column(String(512), nullable=False)  # caminho relativo em UPLOAD_DIR
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos reversos
    # document = relationship("Document", back_populates="uploadfile", uselist=False)
