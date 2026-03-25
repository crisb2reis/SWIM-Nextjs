"""
Testes de integração para os endpoints de Organização.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from api.dependencies import get_current_active_user
from main import app
from models.organization import Organization
from models.user import User

# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def clean_db(db: Session):
    db.query(Organization).delete()
    db.commit()
    yield


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_active_user] = lambda: User(
        id=1, email="admin@swim.com", is_active=True, is_superuser=True
    )
    yield
    app.dependency_overrides.pop(get_current_active_user, None)


@pytest.fixture
def org_data():
    return {
        "name": "Autoridade de Aviação Civil",
        "acronym": "AAC",
        "description": "Regulador.",
        "tipo": "PROVEDOR",
        "status": "ATIVO",
    }


# ── CREATE ────────────────────────────────────────────────────────────────────


def test_create_organization(client: TestClient, org_data):
    response = client.post("/api/v1/organizations/", data=org_data)
    assert response.status_code == 201
    json = response.json()
    assert json["name"] == org_data["name"]
    assert json["acronym"] == org_data["acronym"]
    assert json["tipo"] == "PROVEDOR"
    assert json["status"] == "ATIVO"
    assert "id" in json


def test_create_duplicate_name_fails(client: TestClient, org_data):
    client.post("/api/v1/organizations/", data=org_data)
    response = client.post("/api/v1/organizations/", data=org_data)
    assert response.status_code == 400
    assert "Já existe uma organização" in response.json()["detail"]


def test_create_empty_name_fails(client: TestClient):
    response = client.post("/api/v1/organizations/", data={"name": "   "})
    assert response.status_code == 422


# ── LIST ──────────────────────────────────────────────────────────────────────


def test_list_organizations_empty(client: TestClient):
    response = client.get("/api/v1/organizations/")
    assert response.status_code == 200
    assert response.json() == []


def test_list_organizations_with_data(client: TestClient, db: Session):
    db.add_all(
        [
            Organization(name="Org Alpha"),
            Organization(name="Org Beta"),
        ]
    )
    db.commit()
    response = client.get("/api/v1/organizations/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_organizations_search(client: TestClient, db: Session):
    db.add_all(
        [
            Organization(name="DECEA"),
            Organization(name="ANAC"),
        ]
    )
    db.commit()
    response = client.get("/api/v1/organizations/?search=dec")
    assert response.status_code == 200
    names = [o["name"] for o in response.json()]
    assert "DECEA" in names
    assert "ANAC" not in names


# ── GET BY ID ─────────────────────────────────────────────────────────────────


def test_get_organization_by_id(client: TestClient, db: Session):
    org = Organization(name="ICEA", acronym="ICEA")
    db.add(org)
    db.commit()
    db.refresh(org)

    response = client.get(f"/api/v1/organizations/{org.id}")
    assert response.status_code == 200
    assert response.json()["name"] == "ICEA"


def test_get_organization_not_found(client: TestClient):
    response = client.get("/api/v1/organizations/99999")
    assert response.status_code == 404


# ── UPDATE ────────────────────────────────────────────────────────────────────


def test_update_organization(client: TestClient, db: Session):
    org = Organization(name="Org Original", acronym="OO")
    db.add(org)
    db.commit()
    db.refresh(org)

    response = client.put(
        f"/api/v1/organizations/{org.id}",
        data={"name": "Org Atualizada", "acronym": "OA"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Org Atualizada"
    assert response.json()["acronym"] == "OA"


def test_update_to_duplicate_name_fails(client: TestClient, db: Session):
    db.add_all(
        [
            Organization(name="Org A"),
            Organization(name="Org B"),
        ]
    )
    db.commit()
    orgs = db.query(Organization).all()
    org_a, org_b = orgs[0], orgs[1]

    response = client.put(f"/api/v1/organizations/{org_b.id}", data={"name": "Org A"})
    assert response.status_code == 400


# ── DELETE ────────────────────────────────────────────────────────────────────


def test_delete_organization(client: TestClient, db: Session):
    org = Organization(name="Para Deletar")
    db.add(org)
    db.commit()
    db.refresh(org)

    response = client.delete(f"/api/v1/organizations/{org.id}")
    assert response.status_code == 204

    response_get = client.get(f"/api/v1/organizations/{org.id}")
    assert response_get.status_code == 404


def test_delete_not_found(client: TestClient):
    response = client.delete("/api/v1/organizations/99999")
    assert response.status_code == 404


# ── NOVOS CAMPOS: TIPO E STATUS ───────────────────────────────────────────────


def test_create_with_tipo_and_status(client: TestClient):
    response = client.post(
        "/api/v1/organizations/",
        data={
            "name": "Org Tipo Teste",
            "tipo": "CONSUMIDOR",
            "status": "INATIVO",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["tipo"] == "CONSUMIDOR"
    assert data["status"] == "INATIVO"


def test_update_tipo_and_status(client: TestClient, db: Session):
    from models.organization import OrganizationStatus, OrganizationTipo

    org = Organization(
        name="Org Para Update Tipo",
        tipo=OrganizationTipo.PROVEDOR,
        status=OrganizationStatus.ATIVO,
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    response = client.put(
        f"/api/v1/organizations/{org.id}",
        data={
            "tipo": "PARCEIRO",
            "status": "EM_APROVACAO",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tipo"] == "PARCEIRO"
    assert data["status"] == "EM_APROVACAO"
