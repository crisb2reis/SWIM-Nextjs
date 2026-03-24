"""
Testes de integração para autenticação e rotas de usuários.
"""
from schemas.user import UserCreate
from models.user import UserType, UserLevelAuth
from core.security import create_access_token
import crud


def test_create_user_and_login(client, db):
    """Cria superuser via CRUD, faz login via endpoint, valida token."""
    user = crud.get_user_by_username(db, "logintest")
    if not user:
        user_in = UserCreate(
            username="logintest",
            email="login@swim.com",
            password="senhaforte123",
            user_type=UserType.admin,
            user_level_auth=UserLevelAuth.level_3,
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )
        user = crud.create_user(db, user_in)

    # Login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "logintest", "password": "senhaforte123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Usa o token para acessar /users/me
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    me_resp = client.get("/api/v1/users/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "logintest"


def test_list_users_requires_superuser(client, db):
    """Valida que listar usuários exige superusuário."""
    # Cria um user não-super
    user = crud.get_user_by_username(db, "normaluser")
    if not user:
        user_in = UserCreate(
            username="normaluser",
            email="normal@swim.com",
            password="senhafraca1",
            user_type=UserType.viewer,
            user_level_auth=UserLevelAuth.level_1,
            is_active=True,
            is_staff=False,
            is_superuser=False,
        )
        user = crud.create_user(db, user_in)

    token = create_access_token(data={"sub": user.username})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/users/", headers=headers)
    assert response.status_code == 403


def test_get_user_me_unauthenticated(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
