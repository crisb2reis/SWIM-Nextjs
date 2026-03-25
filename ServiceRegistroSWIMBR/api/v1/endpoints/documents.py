import os
import shutil
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

import crud
from api.dependencies import get_current_active_user
from core.config import settings
from db.session import get_db
from models.user import User
from schemas.document import (
    DocumentCreate,
    DocumentListResponse,
    DocumentRead,
    DocumentUpdate,
)

router = APIRouter(prefix="/documents", tags=["Documentos"])


def _save_upload(upload_file: UploadFile) -> str:
    """Salva o arquivo em UPLOAD_DIR e retorna o caminho relativo."""
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    dest = upload_path / upload_file.filename
    with dest.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return str(dest)


@router.post(
    "/",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Criar documento (com upload de arquivo opcional)",
)
def create_document(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    date_issued: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    publish: Optional[str] = Form(None),
    version: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Aceita `multipart/form-data` combinando metadados textuais e arquivo binário opcional."""
    from datetime import date as date_type

    uploadfile_id = None
    if file and file.filename:
        file_path = _save_upload(file)
        db_file = crud.create_uploaded_file(db, file_path)
        uploadfile_id = db_file.id

    parsed_date = None
    if date_issued:
        try:
            parsed_date = date_type.fromisoformat(date_issued)
        except ValueError:
            raise HTTPException(
                status_code=422, detail="date_issued inválido. Use formato YYYY-MM-DD."
            )

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


@router.get(
    "/",
    response_model=DocumentListResponse,
    summary="Listar documentos (paginado, com filtros opcionais)",
)
def list_documents(
    skip: int = 0,
    limit: int = 20,
    title: Optional[str] = None,
    publish: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    docs, total = crud.get_documents(
        db, skip=skip, limit=limit, title=title, publish=publish
    )
    return DocumentListResponse(total=total, skip=skip, limit=limit, data=docs)


@router.get(
    "/{document_id}",
    response_model=DocumentRead,
    summary="Buscar documento por ID",
)
def read_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    doc = crud.get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")
    return doc


@router.put(
    "/{document_id}",
    response_model=DocumentRead,
    summary="Atualizar metadados do documento",
)
def update_document(
    document_id: int,
    doc_in: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    doc = crud.get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")
    return crud.update_document(db, doc, doc_in)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir documento",
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    doc = crud.get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")
    crud.delete_document(db, db_doc=doc)

