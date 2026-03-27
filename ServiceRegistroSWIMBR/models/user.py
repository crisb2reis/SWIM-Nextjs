import enum
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from db.base import Base


class UserType(str, enum.Enum):
    admin = "admin"
    gestor = "gestor"
    usuario = "usuario"


class UserLevelAuth(str, enum.Enum):
    total = "total"
    parcial = "parcial"
    restrita = "restrita"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    username = Column(String(150), unique=True, nullable=False, index=True)
    email = Column(String(254), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    nome = Column(String(200), nullable=False)
    phone_number = Column(String(30), nullable=True)

    user_type = Column(SAEnum(UserType), default=UserType.usuario, nullable=False)
    user_level_auth = Column(
        SAEnum(UserLevelAuth), default=UserLevelAuth.restrita, nullable=False
    )

    is_active = Column(Boolean, default=True)
    is_staff = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    is_military = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    organization = relationship("Organization", back_populates="users")
