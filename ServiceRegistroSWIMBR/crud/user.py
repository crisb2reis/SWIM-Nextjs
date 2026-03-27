from typing import Optional

from sqlalchemy.orm import Session

from core.security import get_password_hash
from models.user import User
from schemas.user import UserCreate, UserUpdate

# --- User CRUD ---



def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate) -> User:
    obj_in_data = user_in.model_dump()
    password = obj_in_data.pop("password")
    
    # Se o username não estiver explicitamente diferente do email, usamos o email como username
    if not obj_in_data.get("username"):
        obj_in_data["username"] = obj_in_data["email"]

    db_user = User(**obj_in_data, hashed_password=get_password_hash(password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        password = update_data.pop("password")
        db_user.hashed_password = get_password_hash(password)

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, db_user: User) -> None:
    db.delete(db_user)
    db.commit()



def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    from core.security import verify_password

    user = get_user_by_username(db, username)
    if not user:
        user = get_user_by_email(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
