from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from models.user import UserLevelAuth, UserType

# --- Organization ---


class OrganizationBase(BaseModel):
    name: str = Field(..., max_length=255)


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationRead(OrganizationBase):
    id: int

    model_config = {"from_attributes": True}


# --- User ---


class UserBase(BaseModel):
    username: str = Field(..., max_length=150)
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    user_type: UserType = UserType.viewer
    user_level_auth: UserLevelAuth = UserLevelAuth.level_1
    is_active: bool = True
    is_staff: bool = False
    is_superuser: bool = False
    is_military: bool = False
    organization_id: Optional[int] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    user_type: Optional[UserType] = None
    user_level_auth: Optional[UserLevelAuth] = None
    is_active: Optional[bool] = None
    is_staff: Optional[bool] = None
    organization_id: Optional[int] = None


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    organization: Optional[OrganizationRead] = None

    model_config = {"from_attributes": True}


# --- Token ---


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
