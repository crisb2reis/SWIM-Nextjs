from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from db.session import get_db
from schemas.organization import OrganizationRead
from models.organization import Organization
from api.dependencies import get_current_active_user

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/", response_model=List[OrganizationRead])
def read_organizations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """
    Lista todas as organizações para seleção (Dropdown/Autocomplete).
    """
    return db.query(Organization).all()
