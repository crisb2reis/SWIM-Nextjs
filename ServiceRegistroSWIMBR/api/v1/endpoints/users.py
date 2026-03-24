from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from schemas.user import UserCreate, UserRead, UserUpdate, OrganizationCreate, OrganizationRead
from api.dependencies import get_current_active_user, get_current_superuser
from models.user import User
import crud

router = APIRouter(prefix="/users", tags=["Usuários"])


@router.post(
    "/",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Criar usuário",
    dependencies=[Depends(get_current_superuser)],
)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user_in.username):
        raise HTTPException(status_code=400, detail="Username já cadastrado.")
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    return crud.create_user(db, user_in)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Perfil do usuário autenticado",
)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get(
    "/",
    response_model=list[UserRead],
    summary="Listar usuários",
    dependencies=[Depends(get_current_superuser)],
)
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)


@router.get(
    "/{user_id}",
    response_model=UserRead,
    summary="Buscar usuário por ID",
    dependencies=[Depends(get_current_active_user)],
)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return user


@router.put(
    "/{user_id}",
    response_model=UserRead,
    summary="Atualizar usuário",
    dependencies=[Depends(get_current_superuser)],
)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return crud.update_user(db, user, user_in)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir usuário",
    dependencies=[Depends(get_current_superuser)],
)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
