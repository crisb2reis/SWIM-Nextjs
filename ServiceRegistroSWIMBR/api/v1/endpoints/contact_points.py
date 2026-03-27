from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from api.dependencies import get_current_active_user
from db.session import get_db
from models.user import User
from schemas.contact_point import (
    ContactPointCreate,
    ContactPointRead,
    ContactPointUpdate,
)

router = APIRouter(prefix="/contact-points", tags=["contact-points"])


@router.get("/", response_model=List[ContactPointRead])
def read_contact_points(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
):
    """
    Lista todos os pontos de contato.
    """
    contacts = crud.get_contact_points(db, skip=skip, limit=limit)
    return contacts


@router.get("/{id}", response_model=ContactPointRead)
def read_contact_point(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Obtém um ponto de contato pelo ID.
    """
    contact = crud.get_contact_point(db, id=id)
    if not contact:
        raise HTTPException(status_code=404, detail="Ponto de contato não encontrado")
    return contact


@router.post("/", response_model=ContactPointRead, status_code=status.HTTP_201_CREATED)
def create_contact_point(
    *,
    db: Session = Depends(get_db),
    contact_in: ContactPointCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Cria um novo ponto de contato.
    """
    return crud.create_contact_point(db=db, contact_in=contact_in)


@router.put("/{id}", response_model=ContactPointRead)
def update_contact_point(
    *,
    db: Session = Depends(get_db),
    id: int,
    contact_in: ContactPointUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Atualiza um ponto de contato existente.
    """
    contact = crud.update_contact_point(db=db, id=id, contact_in=contact_in)
    if not contact:
        raise HTTPException(status_code=404, detail="Ponto de contato não encontrado")
    return contact


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_point(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_active_user),
):
    """
    Exclui um ponto de contato.
    """
    success = crud.delete_contact_point(db=db, id=id)
    if not success:
        raise HTTPException(status_code=404, detail="Ponto de contato não encontrado")
    return None
