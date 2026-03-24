def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "naoexiste", "password": "errado"},
    )
    assert response.status_code == 401


def test_list_documents_unauthenticated(client):
    response = client.get("/api/v1/documents/")
    assert response.status_code == 401
