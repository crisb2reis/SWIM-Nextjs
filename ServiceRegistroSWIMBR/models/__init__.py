# Importa todos os models para que o Alembic e o Base os reconheça
from models.organization import Organization
from models.user import User
from models.uploaded_file import UploadedFile
from models.document import Document
from models.contact_point import ContactPoint
from models.registry import GeographicalExtent, Policy, SecurityMechanism
from models.service import Service

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
]
