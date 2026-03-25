from typing import List, Optional

from sqlalchemy.orm import Session

from models.service import Service
from schemas.service import ServiceCreate, ServiceUpdate


def get_service(db: Session, service_id: int) -> Optional[Service]:
    return db.query(Service).filter(Service.id == service_id).first()


def get_service_by_name(db: Session, name: str) -> Optional[Service]:
    return db.query(Service).filter(Service.name == name).first()


def get_services(
    db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None
) -> List[Service]:
    query = db.query(Service)
    if search:
        query = query.filter(Service.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


def create_service(db: Session, service_in: ServiceCreate) -> Service:
    name_stripped = service_in.name.strip()
    db_service = Service(
        name=name_stripped,
        organization=service_in.organization,
        version=service_in.version,
        status=service_in.status,
        life_cycle=service_in.life_cycle,
        tipo=service_in.tipo,
        publish_status=service_in.publish_status,
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def update_service(
    db: Session, db_service: Service, service_in: ServiceUpdate
) -> Service:
    update_data = service_in.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] is not None:
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        if value is not None:
            setattr(db_service, field, value)

    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def delete_service(db: Session, db_service: Service) -> Service:
    db.delete(db_service)
    db.commit()
    return db_service
