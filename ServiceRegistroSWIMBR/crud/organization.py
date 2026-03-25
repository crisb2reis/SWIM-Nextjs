from typing import List, Optional

from sqlalchemy.orm import Session

from models.organization import Organization
from schemas.organization import OrganizationCreate, OrganizationUpdate


def get_organization(db: Session, org_id: int) -> Optional[Organization]:
    return db.query(Organization).filter(Organization.id == org_id).first()


def get_organization_by_name(db: Session, name: str) -> Optional[Organization]:
    return db.query(Organization).filter(Organization.name == name).first()


def get_organizations(
    db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None
) -> List[Organization]:
    query = db.query(Organization)
    if search:
        query = query.filter(Organization.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


def create_organization(db: Session, org_in: OrganizationCreate) -> Organization:
    db_org = Organization(
        name=org_in.name.strip(),
        acronym=org_in.acronym,
        description=org_in.description,
        logo_url=org_in.logo_url,
        tipo=org_in.tipo,
        status=org_in.status,
    )
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org


def update_organization(
    db: Session, db_org: Organization, org_in: OrganizationUpdate
) -> Organization:
    update_data = org_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] is not None:
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(db_org, field, value)

    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org


def delete_organization(db: Session, db_org: Organization) -> Organization:
    db.delete(db_org)
    db.commit()
    return db_org

