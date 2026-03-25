from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from db.session import get_db
from schemas.service import ServiceCreate, ServiceUpdate, ServiceRead
from models.service import Service
from api.dependencies import get_current_active_user

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
    query = db.query(Service)
    if search:
        query = query.filter(Service.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


# ── GET BY ID ─────────────────────────────────────────────────────────────────
@router.get("/{service_id}", response_model=ServiceRead)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
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
    existing = db.query(Service).filter(Service.name == name_stripped).first()
    if existing:
        raise HTTPException(status_code=400, detail="Já existe um serviço com este nome")

    service = Service(
        name=name_stripped,
        organization=service_in.organization,
        version=service_in.version,
        status=service_in.status,
        life_cycle=service_in.life_cycle,
        tipo=service_in.tipo,
        publish_status=service_in.publish_status,
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


# ── UPDATE ────────────────────────────────────────────────────────────────────
@router.put("/{service_id}", response_model=ServiceRead)
def update_service(
    service_id: int,
    service_in: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    if service_in.name is not None:
        name_stripped = service_in.name.strip()
        if not name_stripped:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=[{"loc": ["body", "name"], "msg": "Nome não pode ser vazio", "type": "value_error"}]
            )
        conflict = (
            db.query(Service)
            .filter(Service.name == name_stripped, Service.id != service_id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=400, detail="Já existe um serviço com este nome")
        service.name = name_stripped

    if service_in.organization is not None:
        service.organization = service_in.organization
    if service_in.version is not None:
        service.version = service_in.version
    if service_in.status is not None:
        service.status = service_in.status
    if service_in.life_cycle is not None:
        service.life_cycle = service_in.life_cycle
    if service_in.tipo is not None:
        service.tipo = service_in.tipo
    if service_in.publish_status is not None:
        service.publish_status = service_in.publish_status

    db.commit()
    db.refresh(service)
    return service


# ── DELETE ────────────────────────────────────────────────────────────────────
@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    db.delete(service)
    db.commit()
