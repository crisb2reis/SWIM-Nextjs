from pydantic import BaseModel
from typing import List


class OrganizationRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
