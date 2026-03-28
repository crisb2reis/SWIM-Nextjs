import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from api.dependencies import get_current_active_user, get_current_user
from main import app
from models.user import User, UserLevelAuth, UserType
from models.system_log import EventType, LogSeverity

@pytest.fixture(autouse=True)
def override_auth():
    admin_user = User(
        id=1, 
        email="admin@swim.com", 
        username="admin", 
        is_active=True, 
        is_superuser=True,
        is_staff=True,
        is_military=False,
        user_type=UserType.admin,
        user_level_auth=UserLevelAuth.total,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        nome="Admin Exec"
    )
    app.dependency_overrides[get_current_active_user] = lambda: admin_user
    app.dependency_overrides[get_current_user] = lambda: admin_user
    yield
    app.dependency_overrides.pop(get_current_active_user, None)
    app.dependency_overrides.pop(get_current_user, None)

def test_frontend_log_ingestion(client: TestClient, db: Session):
    log_data = {
        "event_type": EventType.API_ERROR.value,
        "severity": LogSeverity.ERROR.value,
        "error_message": "Erro frontend test",
        "action": "FRONTEND_CRASH"
    }
    # Endpoint calls background task
    response = client.post("/api/v1/logs/frontend", json=log_data)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_list_logs(client: TestClient, db: Session):
    response = client.get("/api/v1/logs")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)

def test_log_statistics(client: TestClient, db: Session):
    response = client.get("/api/v1/logs/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "events_by_type" in data
    assert "total_errors" in data
