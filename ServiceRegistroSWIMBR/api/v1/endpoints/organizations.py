import os
import shutil
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

import crud
from api.dependencies import get_current_active_user
from db.session import get_db
from models.organization import OrganizationStatus, OrganizationTipo
from schemas.organization import OrganizationCreate, OrganizationRead, OrganizationUpdate

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
    return crud.get_organizations(db, skip=skip, limit=limit, search=search)


# ── GET BY ID ─────────────────────────────────────────────────────────────────
@router.get("/{org_id}", response_model=OrganizationRead)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    org = crud.get_organization(db, org_id=org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organização não encontrada")
    return org


# ── CREATE ────────────────────────────────────────────────────────────────────
@router.post("/", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
def create_organization(
    name: str = Form(...),
    acronym: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tipo: Optional[str] = Form(None),
    org_status: Optional[str] = Form(None, alias="status"),
    logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Cria uma nova organização. Aceita multipart/form-data para suportar upload de logo."""
    name_stripped = name.strip()
    if not name_stripped:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=[
                {
                    "loc": ["body", "name"],
                    "msg": "Nome não pode ser vazio",
                    "type": "value_error",
                }
            ],
        )

    existing = crud.get_organization_by_name(db, name=name_stripped)
    if existing:
        raise HTTPException(
            status_code=400, detail="Já existe uma organização com este nome"
        )

    logo_url = _save_logo(logo) if logo and logo.filename else None

    tipo_enum = OrganizationTipo(tipo) if tipo else OrganizationTipo.OUTRO
    status_enum = (
        OrganizationStatus(org_status) if org_status else OrganizationStatus.ATIVO
    )

    org_in = OrganizationCreate(
        name=name_stripped,
        acronym=acronym,
        description=description,
        logo_url=logo_url,
        tipo=tipo_enum,
        status=status_enum,
    )
    return crud.create_organization(db, org_in=org_in)


# ── UPDATE ────────────────────────────────────────────────────────────────────
@router.put("/{org_id}", response_model=OrganizationRead)
def update_organization(
    org_id: int,
    name: Optional[str] = Form(None),
    acronym: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tipo: Optional[str] = Form(None),
    org_status: Optional[str] = Form(None, alias="status"),
    logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    org = crud.get_organization(db, org_id=org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organização não encontrada")

    logo_url = None
    if logo and logo.filename:
        logo_url = _save_logo(logo)

    # Coleta apenas os campos que foram realmente enviados no formulário
    update_data = {}
    if name is not None:
        update_data["name"] = name
    if acronym is not None:
        update_data["acronym"] = acronym
    if description is not None:
        update_data["description"] = description
    if tipo:
        update_data["tipo"] = OrganizationTipo(tipo)
    if org_status:
        update_data["status"] = OrganizationStatus(org_status)
    if logo_url:
        update_data["logo_url"] = logo_url

    org_in = OrganizationUpdate(**update_data)


    if org_in.name is not None:
        name_stripped = org_in.name.strip()
        if not name_stripped:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=[
                    {
                        "loc": ["body", "name"],
                        "msg": "Nome não pode ser vazio",
                        "type": "value_error",
                    }
                ],
            )
        conflict = crud.get_organization_by_name(db, name=name_stripped)
        if conflict and conflict.id != org_id:
            raise HTTPException(
                status_code=400, detail="Já existe uma organização com este nome"
            )

    return crud.update_organization(db, db_org=org, org_in=org_in)


# ── DELETE ────────────────────────────────────────────────────────────────────
@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    org = crud.get_organization(db, org_id=org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organização não encontrada")
    crud.delete_organization(db, db_org=org)

