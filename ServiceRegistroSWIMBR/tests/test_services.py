import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from api.dependencies import get_current_active_user
from main import app
from models.service import Service, ServiceLifeCycle, ServicePublishStatus, ServiceStatus, ServiceTipo
from models.user import User
from schemas.service import ServiceCreate, ServiceUpdate


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_active_user] = lambda: User(
        id=1, email="admin@swim.com", is_active=True, is_superuser=True
    )
    yield
    app.dependency_overrides.pop(get_current_active_user, None)



def test_create_service(client: TestClient, db: Session):
    response = client.post(
        "/api/v1/services/",
        json={
            "name": "Test Service",
            "organization": "Test Org",
            "version": "1.0.0",
            "status": ServiceStatus.ATIVO,
            "life_cycle": ServiceLifeCycle.OPERACIONAL,

            "tipo": ServiceTipo.REST,
            "publish_status": ServicePublishStatus.PUBLICADO,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Service"
    assert data["organization"] == "Test Org"


def test_read_services(client: TestClient, db: Session):
    # Create a service directly first
    service = Service(
        name="List Service",
        organization="Org A",
        version="1.0",
        status=ServiceStatus.ATIVO,
        life_cycle=ServiceLifeCycle.OPERACIONAL,
        tipo=ServiceTipo.SOAP,
        publish_status=ServicePublishStatus.RASCUNHO,
    )
    db.add(service)
    db.commit()

    response = client.get("/api/v1/services/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(s["name"] == "List Service" for s in data)


def test_update_service(client: TestClient, db: Session):
    service = Service(
        name="Update Me",
        organization="Org B",
        version="1.0",
        status=ServiceStatus.ATIVO,
        life_cycle=ServiceLifeCycle.OPERACIONAL,
        tipo=ServiceTipo.FTP,
        publish_status=ServicePublishStatus.PUBLICADO,
    )
    db.add(service)
    db.commit()
    db.refresh(service)

    response = client.put(
        f"/api/v1/services/{service.id}",
        json={"name": "Updated Name", "version": "1.1.0"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["version"] == "1.1.0"


def test_delete_service(client: TestClient, db: Session):
    service = Service(
        name="Delete Me",
        organization="Org C",
        version="1.0",
        status=ServiceStatus.ATIVO,
        life_cycle=ServiceLifeCycle.OPERACIONAL,
        tipo=ServiceTipo.AMHS,
        publish_status=ServicePublishStatus.INATIVO,
    )
    db.add(service)
    db.commit()
    db.refresh(service)

    response = client.delete(f"/api/v1/services/{service.id}")
    assert response.status_code == 204

    # Verify deletion
    response = client.get(f"/api/v1/services/{service.id}")
    assert response.status_code == 404
