import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from api.dependencies import get_current_active_user
from main import app
from models.contact_point import ContactPoint
from models.organization import Organization
from models.user import User


@pytest.fixture(autouse=True)
def clean_db(db: Session):
    # Limpa as tabelas antes de cada teste para evitar conflitos de unicidade
    db.query(ContactPoint).delete()
    db.query(Organization).delete()
    db.commit()
    yield


@pytest.fixture(autouse=True)
def override_auth():
    # Mock do usuário atual para ignorar autenticação real durante os testes
    app.dependency_overrides[get_current_active_user] = lambda: User(
        id=1, email="admin@swim.com", is_active=True, is_superuser=True
    )
    yield
    app.dependency_overrides.pop(get_current_active_user, None)


@pytest.fixture
def test_org(db: Session):
    org = Organization(name="Org Teste")
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


def test_create_contact_point(client: TestClient, test_org: Organization):
    response = client.post(
        "/api/v1/contact-points/",
        json={
            "name": "João Silva",
            "email": "joao@teste.com",
            "role": "Gerente",
            "phone": "11999999999",
            "organization_id": test_org.id,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "João Silva"
    assert data["email"] == "joao@teste.com"
    assert data["organization_id"] == test_org.id
    assert "organization_name" in data


def test_create_duplicate_email_same_org(client: TestClient, test_org: Organization):
    # Criar o primeiro
    client.post(
        "/api/v1/contact-points/",
        json={
            "name": "João Silva",
            "email": "joao@teste.com",
            "organization_id": test_org.id,
        },
    )
    # Tenta criar o segundo com mesmo email na mesma org
    response = client.post(
        "/api/v1/contact-points/",
        json={
            "name": "Outro João",
            "email": "joao@teste.com",
            "organization_id": test_org.id,
        },
    )
    assert response.status_code == 400
    assert "Já existe um ponto de contato" in response.json()["detail"]


def test_read_contact_points(client: TestClient, test_org: Organization):
    response = client.get("/api/v1/contact-points/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_contact_point(client: TestClient, test_org: Organization, db: Session):
    # Criar um contato via DB para testar update
    contact = ContactPoint(
        name="Old Name", email="old@test.com", organization_id=test_org.id
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    response = client.put(
        f"/api/v1/contact-points/{contact.id}", json={"name": "New Name"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"


def test_delete_contact_point(client: TestClient, test_org: Organization, db: Session):
    contact = ContactPoint(
        name="To be deleted", email="del@test.com", organization_id=test_org.id
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    response = client.delete(f"/api/v1/contact-points/{contact.id}")
    assert response.status_code == 204

    # Verificar se sumiu
    response_get = client.get(f"/api/v1/contact-points/{contact.id}")
    assert response_get.status_code == 404
