# ServiceRegistroSWIMBR — Backend FastAPI

API REST do sistema **SWIM Registry** para o CRM **AppRegistroSWIMBR**.

## 🚀 Setup Rápido

### 1. Pré-requisitos
- Python 3.10+
- Docker + Docker Compose

### 2. Instalar dependências

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com sua SECRET_KEY e dados do banco
```

> **Gerar SECRET_KEY segura:**
> ```bash
> openssl rand -hex 32
> ```

### 4. Subir o banco de dados (PostgreSQL via Docker)

```bash
docker-compose up -d
```

### 5. Executar migrações (Alembic)

```bash
alembic upgrade head
```

### 6. Iniciar o servidor

```bash
uvicorn main:app --reload
```

Acesse:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🧪 Testes

```bash
pytest tests/ -v
```

---

## 📁 Estrutura

```
ServiceRegistroSWIMBR/
├── api/                    # Routers e dependências de injeção
│   ├── dependencies.py     # Auth guards (get_current_user, etc.)
│   └── v1/endpoints/       # auth.py | users.py | documents.py
├── core/                   # config.py | security.py (JWT + bcrypt)
├── crud/                   # Repository pattern (user.py | document.py)
├── db/                     # base.py (Base ORM) | session.py (get_db)
├── models/                 # ORM SQLAlchemy (user, document, registry...)
├── schemas/                # Pydantic DTOs (user, document, registry)
├── tests/                  # conftest.py | test_smoke.py
├── alembic/                # Migrações de banco
├── main.py                 # Entrypoint FastAPI
├── requirements.txt
├── docker-compose.yml
└── .env.example
```

---

## 🔐 Autenticação

A API usa **OAuth2 com JWT Bearer**. Para autenticar:

1. `POST /api/v1/auth/login` com `username` e `password` (form-data)
2. Copie o `access_token` retornado
3. Use no header: `Authorization: Bearer <token>`

No Swagger UI, clique em **Authorize** e cole o token.

---

## 📦 Módulos Disponíveis

| Módulo | Prefixo | Descrição |
|---|---|---|
| Auth | `/api/v1/auth` | Login JWT |
| Usuários | `/api/v1/users` | CRUD de usuários |
| Documentos | `/api/v1/documents` | CRUD + upload de arquivos |
