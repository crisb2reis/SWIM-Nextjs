import enum

from sqlalchemy import Column, Enum, Integer, String, Text
from sqlalchemy.orm import relationship

from db.base import Base


class OrganizationTipo(str, enum.Enum):
    PROVEDOR = "PROVEDOR"
    CONSUMIDOR = "CONSUMIDOR"
    PARCEIRO = "PARCEIRO"
    OUTRO = "OUTRO"


class OrganizationStatus(str, enum.Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    EM_APROVACAO = "EM_APROVACAO"


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    acronym = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    tipo = Column(
        Enum(OrganizationTipo, name="organizationtipo"),
        nullable=True,
        default=OrganizationTipo.OUTRO,
    )
    status = Column(
        Enum(OrganizationStatus, name="organizationstatus"),
        nullable=True,
        default=OrganizationStatus.ATIVO,
    )

    # Relacionamentos
    users = relationship("User", back_populates="organization")
    contact_points = relationship("ContactPoint", back_populates="organization")
