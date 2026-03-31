"""Templates de testes de integração para Users (CRUD).

Estes testes são templates/boilerplate: adapte payloads e asserts conforme o modelo de dados.
"""

import crud
from models.user import UserLevelAuth, UserType
from schemas.user import UserCreate


def make_superuser(db):
    user = crud.get_user_by_username(db, "testadmin")
    if not user:
        user_in = UserCreate(
            username="testadmin",
            email="admin@test.local",
            password="adminpass",
            user_type=UserType.admin,
            user_level_auth=UserLevelAuth.level_3,
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )
        user = crud.create_user(db, user_in)
        db.commit()
    return user


def test_users_crud_flow(client, db):
    admin = make_superuser(db)

    # Login via token creation helper (faster than form-post)
    from core.security import create_access_token

    token = create_access_token(data={"sub": admin.username})
    headers = {"Authorization": f"Bearer {token}"}

    # Create user
    payload = {
        "username": "u_crud",
        "email": "u_crud@test.local",
        "password": "pwd12345",
        "user_type": "viewer",
        "user_level_auth": "level_1",
        "is_active": True,
        "is_staff": False,
        "is_superuser": False,
    }
    resp = client.post("/api/v1/users/", json=payload, headers=headers)
    assert resp.status_code in (200, 201)
    created = resp.json()
    assert "id" in created

    uid = created["id"]

    # Read
    resp = client.get(f"/api/v1/users/{uid}", headers=headers)
    assert resp.status_code == 200

    # Update
    update = {"email": "updated@test.local"}
    resp = client.put(f"/api/v1/users/{uid}", json=update, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "updated@test.local"

    # Delete
    resp = client.delete(f"/api/v1/users/{uid}", headers=headers)
    assert resp.status_code in (200, 204)
