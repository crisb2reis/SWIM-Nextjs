# TESTING — Backend (ServiceRegistroSWIMBR)

Guia rápido para executar testes de integração e utilitários do backend (pytest + TestClient).

1) Instalação

```bash
cd ServiceRegistroSWIMBR
python -m pip install --upgrade pip
pip install -r requirements.txt
```

2) Ambiente de teste

- Para rodar contra PostgreSQL em Docker (recomendado para integração real):

```bash
docker compose up -d db_test
export TEST_DB_URL="postgresql://swim_user:swim_password@localhost:5433/swim_test_db"
export ALLOW_TEST_ENDPOINTS="true"
```

- Fallback (rápido): SQLite local em `./test.db` — usado por padrão se `TEST_DB_URL` não estiver setado.

3) Rodar testes

- Rodar todos os testes:

```bash
pytest -v
```

- Rodar com cobertura limitada às pastas `crud` e `models` (via `pytest.ini`):

```bash
pytest -v --cov=crud --cov=models --cov-report=term-missing
```

4) Endpoints de teste (seed/cleanup)

- Para facilitar E2E, há endpoints protegidos por `ALLOW_TEST_ENDPOINTS=true`:

  - `POST /api/v1/test/seed` — seed minimal (superuser)
  - `POST /api/v1/test/cleanup` — limpa e recria schema

Use estes endpoints apenas em ambientes de teste controlados.

5) Contribuindo com testes

- Escreva testes de integração em `ServiceRegistroSWIMBR/tests/` seguindo os templates existentes (`test_*_integration.py`).
- Prefira fixtures (`client`, `db`) fornecidas em `tests/conftest.py`.
- Evite testes que dependam de estado externo não controlado (use seed/cleanup ou fixtures).

6) CI

- Há um workflow GitHub Actions `/.github/workflows/test-backend.yml` que executa os testes contra um serviço Postgres no CI. Ajuste variáveis se necessário.
