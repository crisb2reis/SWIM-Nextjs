"""Template de testes para Organizations (CRUD + upload de logo)."""

import io


def test_organizations_crud(client, db):
    # Usa o superuser existente ou cria via crud
    from crud import get_user_by_username
    from core.security import create_access_token

    admin = get_user_by_username(db, "testadmin")
    if not admin:
        # rely on seed endpoint or other fixtures
        pass

    token = create_access_token(data={"sub": admin.username})
    headers = {"Authorization": f"Bearer {token}"}

    # Create (multipart/form-data with logo)
    logo = (io.BytesIO(b"fake-image-data"), "logo.png")
    data = {"name": "Org Test", "acronym": "OT"}
    resp = client.post("/api/v1/organizations/", data=data, files={"logo": logo}, headers=headers)
    assert resp.status_code in (200, 201)
    org = resp.json()
    assert org["name"] == "Org Test"

    oid = org["id"]

    # Read
    resp = client.get(f"/api/v1/organizations/{oid}", headers=headers)
    assert resp.status_code == 200

    # Update
    update = {"name": "Org Test Updated"}
    resp = client.put(f"/api/v1/organizations/{oid}", data=update, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Org Test Updated"

    # Delete
    resp = client.delete(f"/api/v1/organizations/{oid}", headers=headers)
    assert resp.status_code in (200, 204)
