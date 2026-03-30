
import os
import shutil
import uuid
import mimetypes
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
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

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.xlsx', '.jpg', '.png'}


def validate_upload(file: UploadFile):
    """Valida o tamanho e a extensão do arquivo."""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de arquivo não permitido: {ext}"
        )

    # Verifica o tamanho do arquivo
    file.file.seek(0, 2)  # Move para o fim
    size = file.file.tell()
    file.file.seek(0)      # Volta para o início

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo excede o limite de 10MB."
        )


def _save_upload(upload_file: UploadFile) -> tuple[str, str]:
    """Salva o arquivo de forma segura com nome único e retorna o caminho e nome original."""
    file_ext = Path(upload_file.filename).suffix
    unique_name = f"{uuid.uuid4()}{file_ext}"

    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)

    dest = upload_path / unique_name
    dest = dest.resolve()
    
    # Prevenção simples contra Path Traversal
    if not dest.is_relative_to(upload_path.resolve()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de arquivo inválido"
        )

    try:
        with dest.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()

    return str(dest), upload_file.filename


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
    file_path = None
    try:
        if file and file.filename:
            validate_upload(file)
            file_path, original_name = _save_upload(file)
            db_file = crud.create_uploaded_file(db, file_path, original_name)

        doc = crud.create_document(
            db,
            DocumentCreate(
                title=title,
                description=description,
                date_issued=date_issued,
                location=location,
                publish=publish,
                version=version,
                uploadfile_id=db_file.id if file and file.filename else None,
            ),
        )
        db.commit()
        return doc

    except Exception as e:
        db.rollback()
        # Remove o arquivo físico se a transação do banco falhar
        if file_path and Path(file_path).exists():
            Path(file_path).unlink()
        
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar documento: {str(e)}"
        )


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

    file_path = None
    if doc.uploadfile and doc.uploadfile.file:
        file_path = Path(doc.uploadfile.file)

    crud.delete_document(db, db_doc=doc)

    # Limpeza do arquivo físico após deleção bem sucedida no banco
    if file_path and file_path.exists():
        try:
            file_path.unlink()
        except OSError as e:
            print(f"Erro ao remover arquivo físico: {e}")


@router.get(
    "/{document_id}/file",
    summary="Baixar arquivo do documento",
)
def download_document_file(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    doc = crud.get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")

    if not doc.uploadfile or not doc.uploadfile.file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Este documento não possui arquivo associado."
        )

    file_path = Path(doc.uploadfile.file)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo físico não encontrado no servidor."
        )

    # Recupera o nome original ou usa o nome do arquivo único
    original_name = getattr(doc.uploadfile, 'name', None) or file_path.name
    
    # Detecta o tipo MIME
    media_type, _ = mimetypes.guess_type(str(file_path))
    if not media_type:
        media_type = "application/octet-stream"

    return FileResponse(
        path=file_path,
        filename=original_name,
        media_type=media_type
    )
