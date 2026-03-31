"""Template de testes para Services (CRUD)."""

def test_services_crud(client, db):
    from crud import get_user_by_username
    from core.security import create_access_token

    admin = get_user_by_username(db, "testadmin")
    token = create_access_token(data={"sub": admin.username})
    headers = {"Authorization": f"Bearer {token}"}

    payload = {"name": "Service Test", "description": "desc"}
    resp = client.post("/api/v1/services/", json=payload, headers=headers)
    assert resp.status_code in (200, 201)
    svc = resp.json()
    sid = svc["id"]

    resp = client.get(f"/api/v1/services/{sid}", headers=headers)
    assert resp.status_code == 200

    resp = client.put(f"/api/v1/services/{sid}", json={"description": "new"}, headers=headers)
    assert resp.status_code == 200

    resp = client.delete(f"/api/v1/services/{sid}", headers=headers)
    assert resp.status_code in (200, 204)
