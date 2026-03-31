import os


def test_seed_and_cleanup_endpoints(client, monkeypatch):
    # Habilita endpoints de teste temporariamente
    monkeypatch.setenv("ALLOW_TEST_ENDPOINTS", "true")

    resp = client.post("/api/v1/test/seed")
    assert resp.status_code == 200
    assert resp.json().get("status") == "seeded"

    resp2 = client.post("/api/v1/test/cleanup")
    assert resp2.status_code == 200
    assert resp2.json().get("status") == "cleaned"
