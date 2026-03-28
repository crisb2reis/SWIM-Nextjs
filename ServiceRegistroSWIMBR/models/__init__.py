# Importa todos os models para que o Alembic e o Base os reconheça
from .contact_point import ContactPoint
from .document import Document
from .organization import Organization
from .registry import GeographicalExtent, Policy, SecurityMechanism
from .service import Service
from .uploaded_file import UploadedFile
from .user import User
from .system_log import SystemLog

__all__ = [
    "Organization",
    "User",
    "UploadedFile",
    "Document",
    "ContactPoint",
    "GeographicalExtent",
    "Policy",
    "SecurityMechanism",
    "Service",
    "SystemLog",
]
