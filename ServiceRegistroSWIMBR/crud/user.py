from sqlalchemy.orm import Session
from typing import Optional

from models.user import User
from models.organization import Organization
from schemas.user import UserCreate, UserUpdate, OrganizationCreate
from core.security import get_password_hash


# --- Organization CRUD ---

def get_organization(db: Session, org_id: int) -> Optional[Organization]:
    return db.query(Organization).filter(Organization.id == org_id).first()


def get_organization_by_name(db: Session, name: str) -> Optional[Organization]:
    return db.query(Organization).filter(Organization.name == name).first()


def get_organizations(db: Session, skip: int = 0, limit: int = 100) -> list[Organization]:
    return db.query(Organization).offset(skip).limit(limit).all()


def create_organization(db: Session, org: OrganizationCreate) -> Organization:
    db_org = Organization(name=org.name)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org


# --- User CRUD ---

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        user_type=user.user_type,
        user_level_auth=user.user_level_auth,
        is_active=user.is_active,
        is_staff=user.is_staff,
        is_superuser=user.is_superuser,
        is_military=user.is_military,
        organization_id=user.organization_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> Optional[User]:
    user = get_user(db, user_id)
    if user:
        db.delete(user)
        db.commit()
    return user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    from core.security import verify_password
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
