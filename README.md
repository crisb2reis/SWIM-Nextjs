Você é um arquiteto de software sênior especializado em sistemas de auditoria e logging.
Preciso que você projete e implemente um sistema completo de Gerenciamento de Logs e 
Eventos para uma aplicação fullstack (Next.js + FastAPI + PostgreSQL).

# CONTEXTO DO PROJETO

- **Frontend**: Next.js 14 (App Router), TypeScript, Material UI, next-intl
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **Arquitetura**: Clean Architecture com separação clara de camadas
- **Estrutura atual**: # Projeto SWIM - Sistema de Registro (CRM)

Este repositório contém o sistema completo de registro da SWIM, composto por um frontend moderno em Next.js e um backend robusto em FastAPI. Este documento fornece uma visão geral da estrutura de pastas e arquivos para auxiliar no desenvolvimento da funcionalidade de **Gerenciamento de Logs e Eventos do Sistema**.

---

## 🏗 Estrutura de Pastas de Alto Nível

```text
.
├── AppRegistroSWIMBR/       # Frontend (Next.js 14 / App Router)
├── ServiceRegistroSWIMBR/   # Backend (FastAPI / PostgreSQL)
├── README.md                # Este arquivo
└── static/                  # Arquivos estáticos compartilhados
```

---

## 🎨 Frontend (AppRegistroSWIMBR)

O frontend utiliza Next.js com TypeScript, Material UI (MUI) para componentes, e `next-intl` para internacionalização.

### Estrutura `src/`

- **`app/[locale]/`**: Contém as rotas da aplicação (App Router).
  - `layout.tsx`: Layout raiz com provedores (Context, Theme, Auth).
  - `page.tsx`: Landing page ou Dashboard principal.
  - `utility/`: Módulos de utilidade (Ex: `/users/manage` para gestão de usuários).
- **`components/`**: Componentes reutilizáveis.
  - `common/`: Componentes genéricos (Botões, Tabela padrão, Diálogos de formulário).
    - `BaseFormDialog.tsx`: Base para todos os diálogos de CRUD.
    - `DeleteConfirmDialog.tsx`: Confirmação de exclusão padronizada.
- **`features/`**: Lógica de negócio organizada por domínio (Padrão recomendado).
  - `users/`: Componentes, hooks e serviços específicos de usuários.
    - `components/UserTable.tsx`: Tabela de listagem de usuários.
    - `hooks/useUserMutations.ts`: Gerencia Create/Update/Delete de usuários com feedback.
    - `services/user.service.ts`: Chamadas de API via Axios.
  - `organizations/`, `documents/`, `contacts/`: Outros domínios do sistema.
- **`lib/`**: Utilitários e configurações compartilhadas.
  - **`logger.ts`**: Utilitário de log atual. Alvo central para expansão do sistema de eventos.
  - `axios.ts`: Configuração da instância de API com interceptores (Ideal para logar erros de rede).
- **`messages/`**: Arquivos JSON de tradução (PT, EN, ES). Todas as mensagens de log visíveis ao usuário devem estar aqui.

---

## ⚙️ Backend (ServiceRegistroSWIMBR)

O backend segue os princípios de Clean Architecture adaptados para FastAPI.

### Estrutura Principal

- **`main.py`**: Ponto de entrada da aplicação. Onde as exceções globais e middlewares de logging podem ser injetados.
- **`api/v1/`**: Definição das rotas e endpoints.
  - `router.py`: Agrupador de rotas.
  - `endpoints/`: Arquivos Python com as rotas de cada módulo (Ex: `users.py`, `documents.py`).
- **`core/`**: Configurações centrais do sistema.
  - `config.py`: Variáveis de ambiente e segredos.
  - `security.py`: Tokens JWT e hashing de senhas.
- **`crud/`**: Camada de persistência (Create, Read, Update, Delete).
  - `user.py`, `organization.py`, etc. É o local ideal para disparar **eventos de auditoria** (ex: "usuário X alterou registro Y").
- **`models/`**: Definições das tabelas do banco de dados (SQLAlchemy).
  - Onde deve ser criado o model de `SystemLog` ou `AuditEvent`.
- **`schemas/`**: Esquemas de validação (Pydantic).
  - Onde devem ser definidos os contratos de entrada/saída para os logs.
- **`db/`**: Sessão do banco de dados e configuração do motor SQL.
- **`alembic/`**: Gerenciamento de migrações de banco de dados.

---

## 🪵 Roadmap: Gerenciamento de Logs e Eventos

Para implementar a funcionalidade de logs, considere os seguintes pontos de integração:

1.  **Auditoria de Banco (Backend/CRUD)**:
    - Adicionar um decorator ou utilitário na camada `crud/` para registrar toda alteração feita em registros sensíveis.
2.  **Logs de Acesso (Backend/Middleware)**:
    - Implementar um Middleware no FastAPI (`main.py`) para logar quem acessou qual endpoint e o tempo de resposta.
3.  **Logs de Erro Frontend (lib/logger.ts)**:
    - Expandir `lib/logger.ts` para que, em produção, erros capturados via `error()` sejam enviados para um endpoint de log no backend.
4.  **Interface de Visualização (Frontend/Features)**:
    - Criar `src/features/logs/` com uma tabela para que administradores possam visualizar e filtrar os eventos do sistema.

---

## 🚀 Como Executar

Consulte o arquivo [ServiceRegistroSWIMBR_Plano_Arquitetura.md](./ServiceRegistroSWIMBR_Plano_Arquitetura.md) para detalhes de instalação do ambiente de desenvolvimento.


# REQUISITOS FUNCIONAIS

## 1. TIPOS DE EVENTOS A REGISTRAR

### Auditoria de Dados (Prioridade Alta)
- [ ] CREATE: Criação de novos registros (usuários, organizações, documentos, contatos)
- [ ] UPDATE: Modificações em registros existentes (incluir campo alterado, valor anterior e novo)
- [ ] DELETE: Exclusões lógicas ou físicas
- [ ] BULK_OPERATIONS: Operações em lote

### Autenticação e Autorização (Prioridade Alta)
- [ ] LOGIN_SUCCESS / LOGIN_FAILURE
- [ ] LOGOUT
- [ ] PASSWORD_CHANGE / PASSWORD_RESET
- [ ] TOKEN_REFRESH
- [ ] PERMISSION_DENIED (tentativas de acesso não autorizado)

### Eventos de Sistema (Prioridade Média)
- [ ] API_ERROR: Erros 500, exceções não tratadas
- [ ] VALIDATION_ERROR: Falhas de validação de dados
- [ ] RATE_LIMIT_EXCEEDED: Limite de requisições atingido
- [ ] FILE_UPLOAD / FILE_DOWNLOAD
- [ ] EXPORT_DATA / IMPORT_DATA

### Métricas de Performance (Prioridade Baixa)
- [ ] SLOW_QUERY: Queries com tempo > threshold
- [ ] HIGH_MEMORY_USAGE
- [ ] API_RESPONSE_TIME

## 2. ESTRUTURA DE DADOS DO LOG

Cada evento deve conter **no mínimo**:
```typescript
{
  id: string;                    // UUID
  timestamp: DateTime;           // ISO 8601
  event_type: EventType;         // Enum dos tipos acima
  severity: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  
  // Contexto do Usuário
  user_id?: string;
  user_email?: string;
  user_ip: string;
  user_agent?: string;
  
  // Contexto da Operação
  resource_type?: string;        // 'user', 'organization', 'document'
  resource_id?: string;
  action: string;                // 'create', 'update', 'delete', 'view'
  
  // Detalhes Técnicos
  endpoint?: string;             // '/api/v1/users'
  method?: string;               // 'POST', 'GET', 'PUT', 'DELETE'
  status_code?: number;
  response_time_ms?: number;
  
  // Payload de Dados
  changes?: {
    field: string;
    old_value: any;
    new_value: any;
  }[];
  metadata?: Record<string, any>;
  error_message?: string;
  stack_trace?: string;
}
```

## 3. ARQUITETURA BACKEND

Implemente seguindo estas diretrizes:

### A. Model de Banco de Dados (`models/system_log.py`)
- Tabela `system_logs` com índices otimizados (timestamp, user_id, event_type)
- Particionamento por data (se aplicável)
- Política de retenção (ex: 90 dias para INFO, 1 ano para CRITICAL)

### B. Schema Pydantic (`schemas/system_log.py`)
- `SystemLogCreate`: Validação de entrada
- `SystemLogResponse`: Resposta da API
- `SystemLogFilter`: Filtros de busca

### C. CRUD Operations (`crud/system_log.py`)
- `create_log()`: Inserção assíncrona
- `get_logs()`: Busca com paginação e filtros
- `get_log_statistics()`: Agregações (eventos por tipo, usuários mais ativos)

### D. Middleware de Logging (`main.py`)
```python
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Capturar request_id, tempo de resposta, status code
    # Logar automaticamente todas as requisições
```

### E. Decorator de Auditoria (`core/audit.py`)
```python
def audit_log(event_type: EventType, resource_type: str):
    """Decorator para logar automaticamente operações CRUD"""
    # Aplicar em funções CRUD sensíveis
```

### F. Endpoints de API (`api/v1/endpoints/logs.py`)
- `GET /api/v1/logs`: Listar logs (admin only)
- `GET /api/v1/logs/statistics`: Dashboard de métricas
- `GET /api/v1/logs/export`: Exportar logs (CSV/JSON)

## 4. ARQUITETURA FRONTEND

### A. Service Layer (`features/logs/services/log.service.ts`)
```typescript
export const logService = {
  getLogs: (filters: LogFilter, pagination: Pagination) => Promise<LogPage>;
  getStatistics: (dateRange: DateRange) => Promise<LogStatistics>;
  exportLogs: (filters: LogFilter, format: 'csv' | 'json') => Promise<Blob>;
}
```

### B. Components (`features/logs/components/`)
- `LogTable.tsx`: Tabela com filtros avançados (data, tipo, usuário, severidade)
- `LogDetailDialog.tsx`: Modal com detalhes completos do evento
- `LogStatisticsPanel.tsx`: Cards com métricas (total eventos, erros, usuários ativos)
- `LogFilters.tsx`: Barra de filtros com autocomplete

### C. Hooks (`features/logs/hooks/`)
- `useLogQuery.ts`: React Query para buscar logs
- `useLogFilters.ts`: Gerenciamento de estado dos filtros

### D. Página de Administração (`app/[locale]/admin/logs/page.tsx`)
- Rota protegida (apenas admin)
- Layout com tabela + estatísticas

### E. Logger Frontend (`lib/logger.ts`)
Expandir o utilitário atual:
```typescript
class Logger {
  // Modo desenvolvimento: console.log
  // Modo produção: enviar para backend via POST /api/v1/logs/frontend
  
  error(message: string, error: Error, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
}
```

## 5. CASOS DE USO PRÁTICOS

Implemente exemplos concretos:

1. **Auditoria de Usuário**: Ao atualizar um usuário via `crud/user.py`, 
   logar quais campos foram alterados
   
2. **Tentativa de Login Falha**: Capturar no endpoint de auth e logar com IP

3. **Erro de Frontend**: Ao capturar erro no boundary, enviar para backend com stack trace

4. **Operação em Lote**: Ao deletar múltiplos registros, criar um único log agregado

## 6. SEGURANÇA E PRIVACIDADE

- [ ] Não logar senhas, tokens ou dados sensíveis (LGPD/GDPR compliant)
- [ ] Implementar hash ou mascaramento de PII (emails parciais: j***@example.com)
- [ ] Controle de acesso: apenas admins visualizam logs
- [ ] Rate limiting no endpoint de logs

## 7. PERFORMANCE

- [ ] Índices compostos no banco (timestamp + event_type)
- [ ] Paginação obrigatória (máx 100 registros por página)
- [ ] Cache de estatísticas (Redis - opcional)
- [ ] Inserção assíncrona de logs (não bloquear request principal)

## 8. INTERNACIONALIZAÇÃO

- [ ] Mensagens de log em `messages/pt.json`, `en.json`, `es.json`
- [ ] Tipos de evento traduzidos na UI

# ENTREGÁVEIS ESPERADOS

Para cada componente, forneça:

1. **Código completo** com comentários explicativos
2. **Migration Alembic** para criar a tabela de logs
3. **Testes unitários** (pelo menos para CRUD de logs)
4. **Documentação** de como usar o sistema (README.md)
5. **Exemplo de integração** em um CRUD existente (ex: users)

# ORDEM DE IMPLEMENTAÇÃO SUGERIDA

1. Backend: Model + Schema + CRUD básico
2. Backend: Migration + testes de inserção
3. Backend: Middleware de logging automático
4. Backend: Endpoints de API
5. Frontend: Service layer + hooks
6. Frontend: Componentes de visualização
7. Integração: Aplicar auditoria em 1-2 CRUDs existentes
8. Testes e refinamento