# Plano de Implantação — Grafana no Projeto SWIM

> **CRM SWIM** · Next.js + FastAPI + PostgreSQL · Observabilidade em 3 Fases

---

## Índice

1. [Contexto e Justificativa](#1-contexto-e-justificativa)
2. [Limitações da Solução Atual](#2-limitações-da-solução-atual)
3. [Valor do Grafana para o SWIM](#3-valor-do-grafana-para-o-swim)
4. [Roadmap de Implantação](#4-roadmap-de-implantação)
   - [Fase 1 — Dashboards no PostgreSQL](#fase-1--dashboards-no-postgresql-semanas-12)
   - [Fase 2 — Métricas de Infraestrutura](#fase-2--métricas-de-infraestrutura-semanas-35)
   - [Fase 3 — Centralização com Loki](#fase-3--centralização-com-loki-mês-2)
5. [Checklist de Implantação — Fase 1](#5-checklist-de-implantação--fase-1)
6. [Configuração](#6-configuração)
   - [docker-compose.yml](#61-bloco-para-docker-composeyml)
   - [Queries para os Dashboards](#62-queries-para-os-dashboards)
7. [Alertas Recomendados](#7-alertas-recomendados)
8. [Recomendação Final](#8-recomendação-final)

---

## 1. Contexto e Justificativa

O projeto SWIM utiliza atualmente uma infraestrutura de logging sob demanda:

- **Backend:** salva eventos na tabela `system_logs` (PostgreSQL · container `swim_postgres`).
- **Frontend:** possui a tela `LogTable.tsx` para consulta direta de registros.
- **Uso atual:** auditoria manual de ações de usuários e depuração de erros pontuais.

Embora funcional para o estágio inicial, essa abordagem não atende às necessidades de um ambiente de produção com usuários externos, requisitos de conformidade ou SLAs de estabilidade da API.

---

## 2. Limitações da Solução Atual

| Limitação | Impacto |
|-----------|---------|
| **Falta de agregação** | Não é possível visualizar tendências (ex: "os erros aumentaram na última hora?") |
| **Ausência de alertas** | O sistema depende de alguém olhar a tela para descobrir que algo quebrou |
| **Performance** | Consultas complexas (`COUNT`/`GROUP BY`) diretamente no banco de produção podem causar lentidão |
| **Visibilidade de infra** | CPU, memória e latência de rede/API não são monitoradas de forma visual |

---

## 3. Valor do Grafana para o SWIM

### Observabilidade de negócio e UX

Com os campos `event_type` e `metadata` já existentes na tabela `system_logs`, o Grafana pode gerar:

- **Mapa de calor de erros** — identificar quais módulos (Usuários, Contatos, Documentos) geram mais `VALIDATION_ERROR` ou `API_ERROR`.
- **Taxa de sucesso de login** — monitorar eventos `AUTH_LOGIN` vs `AUTH_PERMISSION_DENIED` para detectar ataques.
- **Adoção de funcionalidades** — ver quais `resource_type` são mais acessados por tipo de usuário.

### Monitoramento de performance

O campo `response_time_ms` no modelo `SystemLog` permite visualizar:

- **Percentis de latência (P95, P99)** — garantir que 99% das requisições respondam em tempo aceitável.
- **Gargalos de endpoint** — identificar APIs que ficaram lentas após um deploy específico.

### Alertas automáticos

- **Slack / Discord / Email** — notificar a equipe técnica instantaneamente se a taxa de erros `CRITICAL` ultrapassar um limite.
- **Detecção de inatividade** — alertar se o sistema parar de receber logs (indicativo de queda total).

---

## 4. Roadmap de Implantação

```
Semana 1–2          Semana 3–5          Mês 2+
──────────          ──────────          ──────
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   FASE 1    │ ──► │   FASE 2    │ ──► │   FASE 3    │
│ Dashboards  │     │  Métricas   │     │    Loki      │
│ PostgreSQL  │     │   de Infra  │     │ (Scale-up)  │
└─────────────┘     └─────────────┘     └─────────────┘
Custo: zero         Node Exporter +     Migração de
código novo         Prometheus          logs textuais
```

---

### Fase 1 — Dashboards no PostgreSQL (Semanas 1–2)

**Objetivo:** adicionar o Grafana via Docker sem alterar nenhuma linha do código existente. Conectar diretamente à tabela `system_logs` usando o plugin nativo do PostgreSQL.

**Vantagem:** custo zero de mudança no código; ganho imediato de visualização e alertas.

#### Passos

1. Adicionar o container Grafana ao `docker-compose.yml` do backend
2. Criar usuário read-only no PostgreSQL para o Grafana
3. Configurar datasource PostgreSQL no Grafana (host: `db:5432`, database: `swim_db`)
4. Criar dashboard de **mapa de calor de erros** por `event_type`
5. Criar dashboard de **autenticação** (`AUTH_LOGIN` vs `AUTH_PERMISSION_DENIED`)
6. Criar painel de **latência de API** (P95/P99) usando `response_time_ms`
7. Configurar alerta básico por email para eventos com `severity = 'CRITICAL'`

---

### Fase 2 — Métricas de Infraestrutura (Semanas 3–5)

**Objetivo:** monitorar a saúde do servidor sem depender do banco de dados.

**Componentes a adicionar:** Node Exporter + Prometheus (containers adicionais no compose).

#### Passos

1. Adicionar container **Node Exporter** — CPU, RAM, disco, processos
2. Adicionar container **Prometheus** — scraping de métricas a cada 15s, retenção de 30 dias
3. Expor métricas da FastAPI via `/metrics` usando `prometheus-fastapi-instrumentator`
4. Configurar datasource Prometheus no Grafana
5. Criar dashboard de **saúde do servidor**
6. Configurar alertas de infra: disco > 80%, RAM > 90%, CPU sustentada > 85% por 5 min

---

### Fase 3 — Centralização com Loki (Mês 2+)

**Objetivo:** migrar logs textuais para o Grafana Loki, desafogando o PostgreSQL e habilitando retenção de longo prazo com baixo custo.

**Gatilho:** crescimento de usuários externos ou necessidade de retenção de logs por mais de 30 dias.

#### Passos

1. Adicionar container **Grafana Loki** — indexação por labels, retenção configurável (90–365 dias)
2. Configurar **Promtail** (ou SDK da FastAPI) para envio de logs ao Loki
3. Explorar correlação **Prometheus ↔ Loki** na mesma tela do Grafana
4. Definir separação: logs de auditoria de negócio permanecem no Postgres; logs de debug migram para o Loki

---

## 5. Checklist de Implantação — Fase 1

### Pré-requisitos

- [ ] Docker Compose disponível no servidor (`docker compose version` ≥ 2.x)
- [ ] Container `swim_postgres` em execução (`docker compose ps`)
- [ ] Usuário read-only criado no PostgreSQL para o Grafana
- [ ] Porta 3001 disponível no firewall (usamos 3001 pois 3000 é o Next.js)

### Instalação

- [ ] Bloco do Grafana adicionado ao `docker-compose.yml`
- [ ] Container Grafana subido e acessível (`docker compose up -d grafana`)
- [ ] Login efetuado com as credenciais padrão:
    - **Usuário:** `admin`
    - **Senha:** `swim_grafana_2025`
- [ ] Senha admin alterada no primeiro acesso (Recomendado)
- [ ] Datasource PostgreSQL configurado e testado no Grafana

### Dashboards

- [ ] Dashboard de visão geral de erros (agrupamento por `event_type` e hora)
- [ ] Dashboard de autenticação (`AUTH_LOGIN` vs `AUTH_PERMISSION_DENIED` com janela de 1 min)
- [ ] Painel de latência de API (P95/P99 por endpoint)

### Alertas

- [ ] Canal de notificação configurado (email ou Slack) em `Alerting → Contact Points`
- [ ] Alerta de `severity = CRITICAL` ativado e testado

---

## 6. Configuração

### 6.1 Bloco para `docker-compose.yml`

Adicionar dentro do bloco `services:` do `ServiceRegistroSWIMBR/docker-compose.yml` existente.

> ⚠️ **Porta 3001** — usamos 3001 no host pois a porta 3000 já é ocupada pelo frontend Next.js.

```yaml
  grafana:
    image: grafana/grafana:11.4.0
    container_name: swim_grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-swim_grafana_2025}
      GF_USERS_ALLOW_SIGN_UP: "false"
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      db:
        condition: service_healthy

volumes:
  grafana_data:
```

> **Dica de segurança:** adicione `GRAFANA_PASSWORD=sua_senha_segura` ao arquivo `.env` do backend. O `.env` já está no `.gitignore`.

---

### 6.2 Queries para os Dashboards

> ⚠️ **Atenção às diferenças da tabela real** versus o plano original:
> - Coluna de data/hora: `timestamp` (não `created_at`)
> - Coluna de nível: `severity` (não `level`)
> - Tipos de evento auth: `AUTH_LOGIN`, `AUTH_PERMISSION_DENIED` (não `LOGIN_SUCCESS`/`LOGIN_FAIL`)

#### Criação do usuário read-only no PostgreSQL

```sql
CREATE USER grafana_ro WITH PASSWORD 'grafana_ro_senha_2025';
GRANT CONNECT ON DATABASE swim_db TO grafana_ro;
GRANT USAGE ON SCHEMA public TO grafana_ro;
GRANT SELECT ON system_logs TO grafana_ro;
```

#### Query: Erros por hora

Usar no painel de **Time Series**. Retorna contagem de erros agrupada por tipo nas últimas horas selecionadas.

```sql
SELECT
  date_trunc('hour', timestamp) AS time,
  event_type,
  COUNT(*) AS total
FROM system_logs
WHERE
  timestamp >= $__timeFrom()
  AND timestamp <= $__timeTo()
  AND severity IN ('ERROR', 'CRITICAL')
GROUP BY 1, 2
ORDER BY 1 ASC
```

#### Query: Taxa de autenticação (1 minuto)

Usar no painel de **Stat** com alerta. Detecta picos de falha de autenticação.

```sql
SELECT
  date_trunc('minute', timestamp) AS time,
  event_type,
  COUNT(*) AS total
FROM system_logs
WHERE
  timestamp >= $__timeFrom()
  AND timestamp <= $__timeTo()
  AND event_type IN ('AUTH_LOGIN', 'AUTH_PERMISSION_DENIED', 'AUTH_LOGOUT')
GROUP BY 1, 2
ORDER BY 1 ASC
```

#### Query: Latência P95/P99 por endpoint

Usar no painel de **Table** ou **Bar Chart**. Identifica os endpoints mais lentos.

```sql
SELECT
  endpoint,
  method,
  ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time_ms)) AS p95_ms,
  ROUND(percentile_cont(0.99) WITHIN GROUP (ORDER BY response_time_ms)) AS p99_ms,
  COUNT(*) AS total_requests
FROM system_logs
WHERE
  timestamp >= $__timeFrom()
  AND response_time_ms IS NOT NULL
GROUP BY endpoint, method
ORDER BY p99_ms DESC
LIMIT 20
```

#### Query: Volume geral de eventos (adoção de funcionalidades)

Usar no painel de **Pie Chart** ou **Bar Gauge**.

```sql
SELECT
  event_type,
  resource_type,
  COUNT(*) AS total
FROM system_logs
WHERE
  timestamp >= $__timeFrom()
  AND timestamp <= $__timeTo()
GROUP BY event_type, resource_type
ORDER BY total DESC
LIMIT 15
```

#### Query: Eventos SLOW_QUERY acima do limiar

Usar no painel de **Table** para identificar queries lentas registradas automaticamente.

```sql
SELECT
  timestamp AS time,
  endpoint,
  method,
  response_time_ms,
  user_email,
  status_code
FROM system_logs
WHERE
  timestamp >= $__timeFrom()
  AND timestamp <= $__timeTo()
  AND event_type = 'SLOW_QUERY'
ORDER BY response_time_ms DESC
LIMIT 50
```

---

## 7. Alertas Recomendados

### 🔴 Críticos — notificar imediatamente

| Alerta | Condição | Canal |
|--------|----------|-------|
| **Taxa de erros CRITICAL elevada** | `COUNT(*) WHERE severity = 'CRITICAL'` nos últimos 5 min > 10 | Email + Slack |
| **Sistema parou de registrar logs** | Nenhum evento em `system_logs` nos últimos 10 min durante horário de pico | Email + Slack |
| **Tentativas de login suspeitas** | `AUTH_PERMISSION_DENIED` > 20 em 1 minuto por usuário | Email + Slack |

### 🟡 Avisos — monitorar com atenção

| Alerta | Condição | Canal |
|--------|----------|-------|
| **Latência P99 elevada** | P99 de `response_time_ms` > 3000ms por mais de 5 minutos consecutivos | Email |
| **Pico de erros de validação** | `VALIDATION_ERROR` > 50 em 15 min | Email |
| **Slow queries acumulando** | `SLOW_QUERY` > 10 em 5 min | Email |

### 🟢 Informativos — acompanhamento diário

| Alerta | Condição | Canal |
|--------|----------|-------|
| **Relatório diário de adoção** | Resumo por `resource_type` dos eventos mais frequentes | Email (08h) |

---

## 8. Recomendação Final

> **Recomendamos a implantação imediata da Fase 1.**

O projeto SWIM já possui uma estrutura de logs madura o suficiente para alimentar dashboards valiosos. A Fase 1 pode ser executada em **1 a 2 dias de trabalho** sem alterar nenhuma linha do código da aplicação — apenas adicionando o container Grafana e configurando as queries.

**A implantação é indispensável se:**

- O sistema for aberto para usuários externos
- Houver requisitos de conformidade ou auditoria rígidos
- A estabilidade da API for crítica para o negócio

**As Fases 2 e 3 devem ser priorizadas quando:**

- O volume de usuários crescer e as queries de agregação começarem a impactar o banco de produção (Fase 2)
- Houver necessidade de retenção de logs por mais de 30 dias ou análise de logs textuais em larga escala (Fase 3)

---

*Documento gerado para o projeto SWIM · Revisado: 2025-04 · Fase 1 imediata recomendada*
