# ServiceRegistroSWIMBR — Backend FastAPI

API REST do sistema **SWIM Registry** para o CRM **AppRegistroSWIMBR**.

## 🚀 Guia de Execução (Passo a Passo)

Siga estas etapas na ordem exata para rodar o backend localmente:

### 1. Preparar o Ambiente Python
Crie e ative o ambiente virtual para isolar as dependências.
```bash
# Criar ambiente virtual (apenas a primeira vez)
python3 -m venv .venv

# Ativar o ambiente (IMPORTANTE: use sempre 'source')
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 2. Configuração e Banco de Dados
Certifique-se de que o Docker está rodando e configure o banco.
```bash
# 1. Criar arquivo de configuração .env (se já não existir)
cp -n .env.example .env

# 2. Subir o PostgreSQL via Docker
docker-compose up -d

# 3. Rodar as migrações para criar as tabelas
alembic upgrade head
```

### 3. Iniciar o Servidor FastAPI
Com o ambiente ativado e o banco rodando:
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
