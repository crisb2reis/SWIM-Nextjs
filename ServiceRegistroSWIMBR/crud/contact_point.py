from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException, status

from models.contact_point import ContactPoint
from schemas.contact_point import ContactPointCreate, ContactPointUpdate


def _enrich_contact(contact: Optional[ContactPoint]):
    if contact and contact.organization:
        contact.organization_name = contact.organization.name
    return contact


def get_contact_point(db: Session, id: int) -> Optional[ContactPoint]:
    contact = db.query(ContactPoint).options(joinedload(ContactPoint.organization)).filter(ContactPoint.id == id).first()
    return _enrich_contact(contact)


def get_contact_points(db: Session, skip: int = 0, limit: int = 100) -> List[ContactPoint]:
    contacts = db.query(ContactPoint).options(joinedload(ContactPoint.organization)).offset(skip).limit(limit).all()
    for c in contacts:
        _enrich_contact(c)
    return contacts


def create_contact_point(db: Session, contact_in: ContactPointCreate) -> ContactPoint:
    # Regra: não permitir duplicidade de email dentro da mesma organização
    existing = db.query(ContactPoint).filter(
        ContactPoint.email == contact_in.email,
        ContactPoint.organization_id == contact_in.organization_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um ponto de contato com este e-mail nesta organização."
        )

    db_contact = ContactPoint(
        name=contact_in.name,
        email=contact_in.email,
        role=contact_in.role,
        phone=contact_in.phone,
        organization_id=contact_in.organization_id
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


def update_contact_point(db: Session, id: int, contact_in: ContactPointUpdate) -> Optional[ContactPoint]:
    db_contact = get_contact_point(db, id)
    if not db_contact:
        return None
    
    update_data = contact_in.model_dump(exclude_unset=True)
    
    # Se mudar email ou organização, verificar duplicidade
    if "email" in update_data or "organization_id" in update_data:
        new_email = update_data.get("email", db_contact.email)
        new_org = update_data.get("organization_id", db_contact.organization_id)
        
        existing = db.query(ContactPoint).filter(
            ContactPoint.id != id,
            ContactPoint.email == new_email,
            ContactPoint.organization_id == new_org
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe outro ponto de contato com este e-mail nesta organização."
            )

    for key, value in update_data.items():
        setattr(db_contact, key, value)
    
    db_contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_contact)
    return db_contact


def delete_contact_point(db: Session, id: int) -> bool:
    db_contact = get_contact_point(db, id)
    if not db_contact:
        return False
    db.delete(db_contact)
    db.commit()
    return True
