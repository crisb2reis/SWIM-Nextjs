from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

# Importa todos os models para que o Alembic os detecte
import models  # noqa: F401
from api.v1.router import api_router
from core.config import settings
from db.session import SessionLocal
from crud.system_log import create_log
from schemas.system_log import SystemLogCreate
from models.system_log import EventType, LogSeverity
import time
import asyncio

EXCLUDED_PATHS = {
    "/docs", 
    "/openapi.json", 
    "/redoc", 
    "/health", 
    "/api/v1/logs/frontend"
}

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

# --- Static files (MUST be before routes) ---
import os

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- ReDoc Customizado ---
@app.get("/redoc", include_in_schema=False)
async def redoc_html() -> HTMLResponse:
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
        redoc_js_url="/static/redoc.standalone.js",
    )

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


# --- Global Request Logging Middleware ---
@app.middleware("http")
async def system_logging_middleware(request: Request, call_next):
    path = request.url.path
    if path in EXCLUDED_PATHS or path.startswith("/static") or request.method == "OPTIONS":
        return await call_next(request)

    start_time = time.time()
    
    try:
        response = await call_next(request)
    except Exception as e:
        process_time_ms = int((time.time() - start_time) * 1000)
        log_data = SystemLogCreate(
            event_type=EventType.API_ERROR,
            severity=LogSeverity.CRITICAL,
            user_ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            endpoint=request.url.path,
            method=request.method,
            status_code=500,
            response_time_ms=process_time_ms,
            error_message=str(e)
        )
        def save_log_error():
            db = SessionLocal()
            try:
                create_log(db, log_data)
            except Exception:
                pass
            finally:
                db.close()
        asyncio.create_task(asyncio.to_thread(save_log_error))
        raise 

    process_time_ms = int((time.time() - start_time) * 1000)

    severity = LogSeverity.INFO
    if response.status_code >= 500:
        severity = LogSeverity.ERROR
    elif response.status_code >= 400:
        severity = LogSeverity.WARNING
        
    event_type = EventType.API_RESPONSE_TIME
    if response.status_code >= 500:
        event_type = EventType.API_ERROR
    elif response.status_code == 429:
        event_type = EventType.RATE_LIMIT_EXCEEDED
    elif response.status_code == 422:
        event_type = EventType.VALIDATION_ERROR

    log_data = SystemLogCreate(
        event_type=event_type,
        severity=severity,
        user_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        endpoint=path,
        method=request.method,
        status_code=response.status_code,
        response_time_ms=process_time_ms
    )
    
    def save_log():
        db = SessionLocal()
        try:
            create_log(db, log_data)
        except Exception:
            pass
        finally:
            db.close()
            
    asyncio.create_task(asyncio.to_thread(save_log))
    return response


# --- Routers ---
app.include_router(api_router, prefix=settings.API_V1_STR)


# --- Health Check ---
@app.get("/health", tags=["Sistema"], summary="Health check")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
