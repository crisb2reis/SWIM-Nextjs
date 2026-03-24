from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.docs import get_redoc_html
from fastapi.staticfiles import StaticFiles

from core.config import settings
from api.v1.router import api_router

# Importa todos os models para que o Alembic os detecte
import models  # noqa: F401

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "API REST do **ServiceRegistroSWIMBR** — backend FastAPI para o CRM de registros SWIM.\n\n"
        "Use o botão **Authorize** para autenticar via JWT (Bearer token).\n"
        "Faça login em `/api/v1/auth/login` para obter seu token."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,  # Desabilitado nativo para rodar customizado
    openapi_url="/openapi.json",
)

# --- ReDoc Customizado ---
@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
        redoc_js_url="/static/redoc.standalone.js",
    )

# --- Static files ---
import os
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---  CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Global Exception Handlers ---

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )


# --- Routers ---
app.include_router(api_router, prefix=settings.API_V1_STR)


# --- Health Check ---
@app.get("/health", tags=["Sistema"], summary="Health check")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
