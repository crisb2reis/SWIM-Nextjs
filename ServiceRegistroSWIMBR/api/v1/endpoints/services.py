from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from api.dependencies import get_current_active_user
from db.session import get_db
from schemas.service import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter(prefix="/services", tags=["services"])


# ── LIST ──────────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[ServiceRead])
def list_services(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Lista serviços com suporte a busca e paginação."""
    return crud.get_services(db, skip=skip, limit=limit, search=search)


# ── GET BY ID ─────────────────────────────────────────────────────────────────
@router.get("/{service_id}", response_model=ServiceRead)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = crud.get_service(db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return service


# ── CREATE ────────────────────────────────────────────────────────────────────
@router.post("/", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    name_stripped = service_in.name.strip()
    existing = crud.get_service_by_name(db, name=name_stripped)
    if existing:
        raise HTTPException(
            status_code=400, detail="Já existe um serviço com este nome"
        )

    return crud.create_service(db, service_in=service_in)


# ── UPDATE ────────────────────────────────────────────────────────────────────
@router.put("/{service_id}", response_model=ServiceRead)
def update_service(
    service_id: int,
    service_in: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = crud.get_service(db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    if service_in.name is not None:
        name_stripped = service_in.name.strip()
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
        conflict = crud.get_service_by_name(db, name=name_stripped)
        if conflict and conflict.id != service_id:
            raise HTTPException(
                status_code=400, detail="Já existe um serviço com este nome"
            )

    return crud.update_service(db, db_service=service, service_in=service_in)


# ── DELETE ────────────────────────────────────────────────────────────────────
@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = crud.get_service(db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    crud.delete_service(db, db_service=service)

