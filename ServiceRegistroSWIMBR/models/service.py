import enum
from sqlalchemy import Column, Enum, Integer, String
from db.base import Base

class ServiceStatus(str, enum.Enum):
    EM_APROVACAO = "EM_APROVACAO"
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    SUSPENSO = "SUSPENSO"

class ServiceLifeCycle(str, enum.Enum):
    PROPOSTA = "PROPOSTA"
    CANDIDATO = "CANDIDATO"
    OPERACIONAL = "OPERACIONAL"
    LEGADO = "LEGADO"
    RETIRADO = "RETIRADO"

class ServiceTipo(str, enum.Enum):
    REST = "REST"
    SOAP = "SOAP"
    FTP = "FTP"
    AMHS = "AMHS"
    OUTRO = "OUTRO"

class ServicePublishStatus(str, enum.Enum):
    PUBLICADO = "PUBLICADO"
    RASCUNHO = "RASCUNHO"
    INATIVO = "INATIVO"

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    organization = Column(String(255), nullable=True)
    version = Column(String(50), nullable=True)
    
    status = Column(
        Enum(ServiceStatus, name="servicestatus"),
        nullable=True,
        default=ServiceStatus.EM_APROVACAO,
    )
    life_cycle = Column(
        Enum(ServiceLifeCycle, name="servicelifecycle"),
        nullable=True,
        default=ServiceLifeCycle.PROPOSTA,
    )
    tipo = Column(
        Enum(ServiceTipo, name="servicetipo"),
        nullable=True,
        default=ServiceTipo.OUTRO,
    )
    publish_status = Column(
        Enum(ServicePublishStatus, name="servicepublishstatus"),
        nullable=True,
        default=ServicePublishStatus.RASCUNHO,
    )
