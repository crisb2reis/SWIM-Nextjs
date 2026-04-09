# Testes — Guia Rápido

Este arquivo descreve como executar os testes locais e a infraestrutura mínima necessária (Postgres de teste, pytest, Cypress). Use os comandos abaixo no ambiente de desenvolvimento.

## Passos rápidos para rodar testes localmente

- Iniciar Postgres de teste (diretório `ServiceRegistroSWIMBR`):

```bash
cd ServiceRegistroSWIMBR
# preferível: docker compose (moderno)
docker compose up -d db_test
# alternativo legacy:
# docker-compose up -d db_test
```

- Instalar dependências backend e rodar testes de integração (exemplo):

```bash
cd ServiceRegistroSWIMBR
python -m pip install --upgrade pip
pip install -r requirements.txt

# exportar variáveis de teste e rodar pytest contra postgres-test
export TEST_DB_URL="postgresql://swim_user:swim_password@localhost:5433/swim_test_db"
export ALLOW_TEST_ENDPOINTS="true"
pytest -v --cov=crud --cov=models --cov-report=term-missing
```

- Iniciar backend para E2E (em outro terminal):

```bash
cd ServiceRegistroSWIMBR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Preparar e rodar frontend + Cypress E2E:

```bash
cd AppRegistroSWIMBR
npm install
npm run dev          # start frontend on :3000

# em outro terminal (com backend rodando)
npm run cypress:open   # abrir interface Cypress
# ou
npm run cypress:run    # headless CI run
```

## Observações e dicas rápidas

- Se `docker compose` falhar, tente `docker-compose` ou verifique se o Docker está instalado/rodando.
- O arquivo `ServiceRegistroSWIMBR/.env.test` contém a configuração de teste; ajuste se sua máquina usa outra porta/host.
- Os endpoints de teste (`/api/v1/test/seed` e `/api/v1/test/cleanup`) só funcionam quando `ALLOW_TEST_ENDPOINTS=true`.
- Para **execução rápida local** mantenha o fallback SQLite; para validação pré-merge use Postgres em CI.

## Checklist de itens restantes

- [ ] Expandir testes backend de integração (auth, users, organizations, documents, services, contact_points)
- [ ] Escrever/expandir testes frontend (componentes, hooks)
- [ ] Adicionar factories e helpers em `AppRegistroSWIMBR/setupTests.ts`
- [ ] Adicionar workflow CI frontend (Vitest + Cypress)
- [ ] Documentar convenções completas em `TESTING.md` para frontend/backend

---

Se quiser, posso criar templates de testes para backend (CRUD + auth) ou começar a escrever os primeiros testes de componentes no frontend — me diga qual prefere que eu implemente a seguir.
