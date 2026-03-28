from fastapi import APIRouter

from api.v1.endpoints import (
    auth,
    contact_points,
    documents,
    organizations,
    services,
    users,
    logs,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(documents.router)
api_router.include_router(contact_points.router)
api_router.include_router(organizations.router)
api_router.include_router(services.router)
api_router.include_router(logs.router, prefix="/logs")
