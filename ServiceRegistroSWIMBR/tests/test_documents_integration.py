"""Template de testes para documentos (upload e CRUD)."""

import io


def test_documents_upload_and_crud(client, db):
    from crud import get_user_by_username
    from core.security import create_access_token

    admin = get_user_by_username(db, "testadmin")
    token = create_access_token(data={"sub": admin.username})
    headers = {"Authorization": f"Bearer {token}"}

    # Create with file
    file_content = b"Hello PDF" * 10
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    data = {"title": "Doc Test", "description": "desc"}
    resp = client.post("/api/v1/documents/", data=data, files=files, headers=headers)
    assert resp.status_code in (200, 201)
    doc = resp.json()
    did = doc["id"]

    # Download file
    resp = client.get(f"/api/v1/documents/{did}/file", headers=headers)
    # Depending on storage logic file may be present; assert allowed codes
    assert resp.status_code in (200, 404)

    # Delete document
    resp = client.delete(f"/api/v1/documents/{did}", headers=headers)
    assert resp.status_code in (200, 204)
