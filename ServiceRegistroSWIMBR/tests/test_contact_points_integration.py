"""Template de testes para contact points (CRUD)."""

def test_contact_points_crud(client, db):
    from crud import get_user_by_username
    from core.security import create_access_token

    admin = get_user_by_username(db, "testadmin")
    token = create_access_token(data={"sub": admin.username})
    headers = {"Authorization": f"Bearer {token}"}

    payload = {"label": "Telefone", "value": "+551199999999"}
    resp = client.post("/api/v1/contact_points/", json=payload, headers=headers)
    assert resp.status_code in (200, 201)
    cp = resp.json()
    cid = cp["id"]

    resp = client.get(f"/api/v1/contact_points/{cid}", headers=headers)
    assert resp.status_code == 200

    resp = client.put(f"/api/v1/contact_points/{cid}", json={"value": "+551100000000"}, headers=headers)
    assert resp.status_code == 200

    resp = client.delete(f"/api/v1/contact_points/{cid}", headers=headers)
    assert resp.status_code in (200, 204)
