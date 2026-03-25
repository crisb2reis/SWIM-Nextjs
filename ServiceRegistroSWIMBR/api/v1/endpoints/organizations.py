import os
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional

from db.session import get_db
from schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationRead
from models.organization import Organization
from api.dependencies import get_current_active_user

router = APIRouter(prefix="/organizations", tags=["organizations"])

STATIC_DIR = "static/logos"
os.makedirs(STATIC_DIR, exist_ok=True)


def _save_logo(logo_file: UploadFile) -> str:
    ext = os.path.splitext(logo_file.filename or "logo.png")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(STATIC_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(logo_file.file, f)
    return f"/static/logos/{filename}"


# ── LIST ──────────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[OrganizationRead])
def list_organizations(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Lista organizações com suporte a busca e paginação."""
    query = db.query(Organization)
    if search:
        query = query.filter(Organization.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


# ── GET BY ID ─────────────────────────────────────────────────────────────────
@router.get("/{org_id}", response_model=OrganizationRead)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organização não encontrada")
    return org


# ── CREATE ────────────────────────────────────────────────────────────────────
@router.post("/", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
def create_organization(
    name: str = Form(...),
    acronym: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Cria uma nova organização. Aceita multipart/form-data para suportar upload de logo."""
    name_stripped = name.strip()
    if not name_stripped:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=[{"loc": ["body", "name"], "msg": "Nome não pode ser vazio", "type": "value_error"}]
        )

    existing = db.query(Organization).filter(Organization.name == name_stripped).first()
    if existing:
        raise HTTPException(status_code=400, detail="Já existe uma organização com este nome")

    logo_url = _save_logo(logo) if logo and logo.filename else None

    org = Organization(
        name=name_stripped,
        acronym=acronym,
        description=description,
        logo_url=logo_url,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


# ── UPDATE ────────────────────────────────────────────────────────────────────
@router.put("/{org_id}", response_model=OrganizationRead)
def update_organization(
    org_id: int,
    name: Optional[str] = Form(None),
    acronym: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organização não encontrada")

    if name is not None:
        name_stripped = name.strip()
        if not name_stripped:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=[{"loc": ["body", "name"], "msg": "Nome não pode ser vazio", "type": "value_error"}]
            )
        conflict = (
            db.query(Organization)
            .filter(Organization.name == name.strip(), Organization.id != org_id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=400, detail="Já existe uma organização com este nome")
        org.name = name.strip()

    if acronym is not None:
        org.acronym = acronym
    if description is not None:
        org.description = description
    if logo and logo.filename:
        org.logo_url = _save_logo(logo)

    db.commit()
    db.refresh(org)
    return org


# ── DELETE ────────────────────────────────────────────────────────────────────
@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organização não encontrada")
    db.delete(org)
    db.commit()

