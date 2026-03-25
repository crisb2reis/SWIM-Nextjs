# Importa todos os models para que o Alembic e o Base os reconheça
from models.contact_point import ContactPoint
from models.document import Document
from models.organization import Organization
from models.registry import GeographicalExtent, Policy, SecurityMechanism
from models.service import Service
from models.uploaded_file import UploadedFile
from models.user import User

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
