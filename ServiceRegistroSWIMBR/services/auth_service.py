"""
Serviço de autenticação e gestão de usuários: regras de negócio.
"""
from typing import Optional

from sqlalchemy.orm import Session

from models.user import User
from schemas.user import UserCreate
from core.security import create_access_token, verify_password, get_password_hash
import crud


def register_user(db: Session, user_in: UserCreate) -> User:
    """
    Registra um novo usuário com validações de duplicidade.
    Levanta ValueError se username ou email já existirem.
    """
    if crud.get_user_by_username(db, user_in.username):
        raise ValueError("Username já cadastrado.")
    if crud.get_user_by_email(db, user_in.email):
        raise ValueError("E-mail já cadastrado.")
    return crud.create_user(db, user_in)


def authenticate_and_generate_token(
    db: Session, username: str, password: str
) -> Optional[str]:
    """
    Autentica o usuário e retorna o token JWT, ou None se inválido.
    """
    user = crud.authenticate_user(db, username, password)
    if not user or not user.is_active:
        return None
    return create_access_token(data={"sub": user.username})
