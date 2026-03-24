from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from db.base import Base


class GeographicalExtent(Base):
    __tablename__ = "registry_geographicalextent"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    geometry = Column(Text, nullable=True)   # WKT ou GeoJSON string
    profile_id = Column(Integer, nullable=True)
    source_id = Column(Integer, nullable=True)
    created_on = Column(DateTime, default=datetime.utcnow)
    updated_on = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Policy(Base):
    __tablename__ = "registry_policy"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    profile_id = Column(Integer, nullable=True)
    source_id = Column(Integer, nullable=True)
    created_on = Column(DateTime, default=datetime.utcnow)
    updated_on = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SecurityMechanism(Base):
    __tablename__ = "registry_securitymechanism"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, nullable=True)
    profile_id = Column(Integer, nullable=True)
    protocol_id = Column(Integer, nullable=True)
    created_on = Column(DateTime, default=datetime.utcnow)
    updated_on = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
