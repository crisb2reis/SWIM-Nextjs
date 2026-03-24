# Importa todos os models para que o Alembic e o Base os reconheça
from models.organization import Organization
from models.user import User
from models.uploaded_file import UploadedFile
from models.document import Document
from models.registry import GeographicalExtent, Policy, SecurityMechanism

__all__ = [
    "Organization",
    "User",
    "UploadedFile",
    "Document",
    "GeographicalExtent",
    "Policy",
    "SecurityMechanism",
]
