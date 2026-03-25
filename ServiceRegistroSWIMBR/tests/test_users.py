import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from datetime import datetime
from api.dependencies import get_current_active_user
from main import app
from models.user import User, UserLevelAuth, UserType
from schemas.user import UserCreate, UserUpdate


@pytest.fixture(autouse=True)
def override_auth():
    # Simula um superuser por padrão para poder criar/listar usuários
    # Incluímos timestamps para evitar ValidationErrors da schema UserRead
    app.dependency_overrides[get_current_active_user] = lambda: User(
        id=1, 
        email="admin@swim.com", 
        username="admin", 
        is_active=True, 
        is_superuser=True,
        is_staff=True,
        is_military=False,
        user_type=UserType.admin,
        user_level_auth=UserLevelAuth.level_3,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    yield
    app.dependency_overrides.pop(get_current_active_user, None)


def test_create_user(client: TestClient, db: Session):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "strongpassword123",
        "first_name": "Test",
        "last_name": "User",
        "user_type": "viewer",
        "user_level_auth": "level_1"
    }
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data


def test_list_users(client: TestClient, db: Session):
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_me(client: TestClient):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == "admin@swim.com"


def test_update_user(client: TestClient, db: Session):
    # Criar um usuário primeiro
    user_data = {
        "username": "toupdate",
        "email": "update@example.com",
        "password": "oldpassword",
        "user_type": "viewer",
        "user_level_auth": "level_1"
    }
    create_res = client.post("/api/v1/users/", json=user_data)
    # No caso de erro na resposta de criação, isso lançará erro descritivo
    assert create_res.status_code == 201, create_res.text
    user_id = create_res.json()["id"]

    # Atualizar
    update_data = {"first_name": "UpdatedName", "password": "newpassword123"}
    response = client.put(f"/api/v1/users/{user_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["first_name"] == "UpdatedName"


def test_delete_user(client: TestClient, db: Session):
    user_data = {
        "username": "todelete",
        "email": "delete@example.com",
        "password": "password",
        "user_type": "viewer",
        "user_level_auth": "level_1"
    }
    create_res = client.post("/api/v1/users/", json=user_data)
    assert create_res.status_code == 201
    user_id = create_res.json()["id"]

    response = client.delete(f"/api/v1/users/{user_id}")
    assert response.status_code == 204

    # Verificar se foi deletado
    get_res = client.get(f"/api/v1/users/{user_id}")
    assert get_res.status_code == 404

