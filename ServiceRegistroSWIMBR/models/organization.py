from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from db.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    acronym = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)

    # Relacionamentos
    users = relationship("User", back_populates="organization")
    contact_points = relationship("ContactPoint", back_populates="organization")
