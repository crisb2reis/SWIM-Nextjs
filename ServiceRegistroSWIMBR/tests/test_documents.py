"""
Testes de integração para o módulo de documentos com autenticação JWT.
"""

import crud
from core.security import create_access_token
from models.user import UserLevelAuth, UserType
from schemas.user import UserCreate


def _create_admin_and_get_headers(db):
    """Helper: cria admin no banco e retorna headers com JWT."""
    user = crud.get_user_by_username(db, "testadmin")
    if not user:
        user_in = UserCreate(
            username="testadmin",
            email="testadmin@swim.com",
            password="test12345",
            first_name="Test",
            last_name="Admin",
            user_type=UserType.admin,
            user_level_auth=UserLevelAuth.level_3,
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )
        user = crud.create_user(db, user_in)

    token = create_access_token(data={"sub": user.username})
    return {"Authorization": f"Bearer {token}"}


def test_create_document(client, db):
    headers = _create_admin_and_get_headers(db)
    response = client.post(
        "/api/v1/documents/",
        data={
            "title": "DOC-001 Manual SWIM",
            "description": "Documento de teste",
            "publish": "DECEA",
            "version": "1.0",
        },
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "DOC-001 Manual SWIM"
    assert data["publish"] == "DECEA"
    assert data["id"] is not None


def test_list_documents(client, db):
    headers = _create_admin_and_get_headers(db)
    response = client.get("/api/v1/documents/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data
    assert data["total"] >= 1


def test_get_document_by_id(client, db):
    headers = _create_admin_and_get_headers(db)
    # Cria um documento primeiro
    create_resp = client.post(
        "/api/v1/documents/",
        data={"title": "DOC-002 Procedimento"},
        headers=headers,
    )
    doc_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/documents/{doc_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == "DOC-002 Procedimento"


def test_update_document(client, db):
    headers = _create_admin_and_get_headers(db)
    create_resp = client.post(
        "/api/v1/documents/",
        data={"title": "DOC-003 Rascunho"},
        headers=headers,
    )
    doc_id = create_resp.json()["id"]

    response = client.put(
        f"/api/v1/documents/{doc_id}",
        json={"title": "DOC-003 Final", "version": "2.0"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["title"] == "DOC-003 Final"
    assert response.json()["version"] == "2.0"


def test_delete_document(client, db):
    headers = _create_admin_and_get_headers(db)
    create_resp = client.post(
        "/api/v1/documents/",
        data={"title": "DOC-TEMP para exclusão"},
        headers=headers,
    )
    doc_id = create_resp.json()["id"]

    response = client.delete(f"/api/v1/documents/{doc_id}", headers=headers)
    assert response.status_code == 204

    # Confirma que foi excluído
    get_resp = client.get(f"/api/v1/documents/{doc_id}", headers=headers)
    assert get_resp.status_code == 404


def test_document_not_found(client, db):
    headers = _create_admin_and_get_headers(db)
    response = client.get("/api/v1/documents/99999", headers=headers)
    assert response.status_code == 404


def test_filter_documents_by_title(client, db):
    headers = _create_admin_and_get_headers(db)
    # Cria documento com título único
    client.post(
        "/api/v1/documents/",
        data={"title": "SWIM-FILTRO-UNICO"},
        headers=headers,
    )
    response = client.get(
        "/api/v1/documents/?title=FILTRO-UNICO",
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("FILTRO-UNICO" in d["title"] for d in data["data"])
