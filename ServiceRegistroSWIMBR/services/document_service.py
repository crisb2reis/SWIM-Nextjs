"""
Serviço de documentos: regras de negócio que orquestram CRUD + upload.
"""
import os
import shutil
from pathlib import Path
from typing import Optional

from fastapi import UploadFile
from sqlalchemy.orm import Session

from core.config import settings
from models.document import Document
from models.uploaded_file import UploadedFile as UploadedFileModel
from schemas.document import DocumentCreate, DocumentUpdate
import crud


def handle_file_upload(db: Session, file: UploadFile) -> UploadedFileModel:
    """Salva arquivo em disco e cria registro na tabela utilities_uploadedfile."""
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)

    dest = upload_path / file.filename
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return crud.create_uploaded_file(db, str(dest))


def create_document_with_file(
    db: Session,
    title: str,
    description: Optional[str],
    date_issued: Optional[str],
    location: Optional[str],
    publish: Optional[str],
    version: Optional[str],
    file: Optional[UploadFile] = None,
) -> Document:
    """
    Orquestra a criação de um documento:
    1. Faz upload do arquivo (se fornecido)
    2. Cria o registro do documento
    """
    from datetime import date as date_type

    uploadfile_id = None
    if file and file.filename:
        db_file = handle_file_upload(db, file)
        uploadfile_id = db_file.id

    parsed_date = None
    if date_issued:
        parsed_date = date_type.fromisoformat(date_issued)

    doc_in = DocumentCreate(
        title=title,
        description=description,
        date_issued=parsed_date,
        location=location,
        publish=publish,
        version=version,
        uploadfile_id=uploadfile_id,
    )
    return crud.create_document(db, doc_in)


def remove_document_and_file(db: Session, document_id: int) -> Optional[Document]:
    """
    Remove documento e seu arquivo físico associado (se existir).
    """
    doc = crud.get_document(db, document_id)
    if not doc:
        return None

    # Remove o arquivo físico
    if doc.uploadfile_id:
        uploaded = crud.get_uploaded_file(db, doc.uploadfile_id)
        if uploaded and os.path.exists(uploaded.file):
            os.remove(uploaded.file)
        crud.delete_uploaded_file(db, doc.uploadfile_id)

    return crud.delete_document(db, document_id)
