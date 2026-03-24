from sqlalchemy.orm import Session
from typing import Optional

from models.document import Document
from models.uploaded_file import UploadedFile
from schemas.document import DocumentCreate, DocumentUpdate


# --- UploadedFile CRUD ---

def create_uploaded_file(db: Session, file_path: str) -> UploadedFile:
    db_file = UploadedFile(file=file_path)
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def get_uploaded_file(db: Session, file_id: int) -> Optional[UploadedFile]:
    return db.query(UploadedFile).filter(UploadedFile.id == file_id).first()


def delete_uploaded_file(db: Session, file_id: int) -> Optional[UploadedFile]:
    f = get_uploaded_file(db, file_id)
    if f:
        db.delete(f)
        db.commit()
    return f


# --- Document CRUD ---

def get_document(db: Session, doc_id: int) -> Optional[Document]:
    return db.query(Document).filter(Document.id == doc_id).first()


def get_documents(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    title: Optional[str] = None,
    publish: Optional[str] = None,
) -> tuple[list[Document], int]:
    query = db.query(Document)
    if title:
        query = query.filter(Document.title.ilike(f"%{title}%"))
    if publish:
        query = query.filter(Document.publish.ilike(f"%{publish}%"))
    total = query.count()
    results = query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    return results, total


def create_document(db: Session, doc: DocumentCreate) -> Document:
    db_doc = Document(**doc.model_dump())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


def update_document(db: Session, db_doc: Document, doc_in: DocumentUpdate) -> Document:
    update_data = doc_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_doc, field, value)
    db.commit()
    db.refresh(db_doc)
    return db_doc


def delete_document(db: Session, doc_id: int) -> Optional[Document]:
    doc = get_document(db, doc_id)
    if doc:
        db.delete(doc)
        db.commit()
    return doc
