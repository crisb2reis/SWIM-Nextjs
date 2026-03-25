import enum
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from db.base import Base


class UserType(str, enum.Enum):
    admin = "admin"
    operator = "operator"
    viewer = "viewer"


class UserLevelAuth(str, enum.Enum):
    level_1 = "level_1"
    level_2 = "level_2"
    level_3 = "level_3"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    username = Column(String(150), unique=True, nullable=False, index=True)
    email = Column(String(254), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone_number = Column(String(30), nullable=True)

    user_type = Column(SAEnum(UserType), default=UserType.viewer, nullable=False)
    user_level_auth = Column(
        SAEnum(UserLevelAuth), default=UserLevelAuth.level_1, nullable=False
    )

    is_active = Column(Boolean, default=True)
    is_staff = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    is_military = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    organization = relationship("Organization", back_populates="users")
