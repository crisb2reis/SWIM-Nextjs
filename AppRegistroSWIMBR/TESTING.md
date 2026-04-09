# Testing Guide - Swim Next.js

## Visão Geral

Este documento descreve as práticas de testes, configurações e convenções utilizadas no projeto Swim Next.js.

---

## Quick Start

```bash
# Instalar dependências
npm install

# Executar testes em modo watch
npm run test

# Executar testes uma vez (CI/CD)
npm run test -- --run

# Executar com UI visual
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage

# Verificar tipos TypeScript
npm run type-check
```

---

## Configuração

### Framework
- **Vitest** v4.1.2 - Framework de testes
- **@testing-library/react** v16.3.2 - Testes de componentes React
- **jsdom** - Ambiente de teste (DOM simulado)

### Arquivos de Configuração

| Arquivo | Descrição |
|---------|-----------|
| `vitest.config.ts` | Configuração principal do Vitest |
| `setupTests.ts` | Mocks globais e configurações |

### Estrutura de Testes

```
src/
├── features/
│   ├── logs/
│   │   ├── services/
│   │   │   └── __tests__/
│   │   │       └── logService.test.ts
│   │   └── hooks/
│   │       └── __tests__/
│   │           └── useLogQuery.test.ts
│   └── [feature]/
│       ├── components/__tests__/
│       ├── services/__tests__/
│       └── hooks/__tests__/
└── components/
    └── common/
        └── __tests__/
            └── FormField.test.tsx
```

**Convenções:**
- Arquivos de teste: `*.test.ts` ou `*.test.tsx`
- Localização: `__tests__/` (diretório co-localizado)
- Padrão de nomenclatura: `{nome}.test.tsx`

---

## Como Escrever Testes

### 1. Testes de Serviço (API)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myService } from '../myService';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/lib/axios';

const mockApi = vi.mocked(api);

describe('myService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve buscar dados da API', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    mockApi.get.mockResolvedValue({ data: mockData });

    const result = await myService.getData();

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/endpoint');
    expect(result).toEqual(mockData);
  });
});
```

### 2. Testes de Hooks

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSWR from 'swr';
import { useMyHook } from '../useMyHook';

vi.mock('swr');
vi.mock('../services/myService', () => ({
  myService: {
    getData: vi.fn(),
  },
}));

describe('useMyHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar dados do SWR', () => {
    const mockData = [{ id: 1 }];
    vi.mocked(useSWR).mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => useMyHook());

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
  });
});
```

### 3. Testes de Componentes

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

vi.mock('react-hook-form', () => ({
  Controller: ({ render }: any) => render({ 
    field: { name: 'test', value: '', onChange: vi.fn(), onBlur: vi.fn() } 
  }),
}));

describe('MyComponent', () => {
  it('deve renderizar label', () => {
    render(
      <MyComponent
        control={{} as any}
        label="Test Label"
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });
});
```

---

## Mocks Disponíveis

### setupTests.ts

O arquivo `setupTests.ts` já inclui mocks para:

| Módulo | Descrição |
|--------|-----------|
| `next-intl` | Mock de useTranslations |
| `next/navigation` | Mock de useRouter, usePathname, useSearchParams |
| `@/lib/axios` | Mock completo do cliente HTTP |

### Adicionando Novos Mocks

No `setupTests.ts` ou no topo do arquivo de teste:

```typescript
// Mock de módulo
vi.mock('meu-modulo', () => ({
  minhaFuncao: vi.fn(),
}));

// Mock de localStorage
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
});
```

---

## Cobertura de Código

### Executar Cobertura

```bash
npm run test:coverage
```

### Relatórios

O comando gera relatórios em:
- `coverage/lcov.info` - Formato LCOV (para SonarQube)
- `coverage/coverage-summary.json` - JSON resumido
- `coverage/index.html` - Relatório HTML interativo

### Configuração SonarQube

O projeto está configurado para enviar dados de cobertura para SonarQube:

```properties
# sonar-project.properties
sonar.typescript.lcov.reportPaths=coverage/lcov.info
```

---

## Troubleshooting

### "Cannot find module"

Verifique se o caminho de importação está correto. O projeto usa alias `@/` para `src/`.

### "Invalid hook call"

Ao testar componentes com hooks (react-hook-form):
1. Use o mock do Controller conforme exemplo acima
2. Ou envolv o componente num Provider

### Testes falham aleatoriamente (flaky)

Soluções:
- Use `beforeEach` com `vi.clearAllMocks()`
- Evite timeouts em testes
- Use `waitFor` para asserções async

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run test` | Executa testes em modo watch |
| `npm run test:ui` | Abre interface visual dos testes |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run type-check` | Valida tipos TypeScript |

---

## Boas Práticas

1. **Nomeie os testes de forma descritiva**
   - ✅ `deve retornar erro quando API falha`
   - ❌ `deve funcionar`

2. **Um teste, uma responsabilidade**
   - Evite múltiplas asserções independentes

3. **Use beforeEach para resetar estados**
   - Limpe mocks entre testes

4. **Teste casos de erro**
   - Não apenas o "happy path"

5. **Mantenha testes rápidos**
   - Idealmente < 100ms por teste
# TESTING — Frontend (AppRegistroSWIMBR)

Este documento descreve como executar e escrever testes para o frontend (Vitest + React Testing Library + Cypress).

1) Instalação

```bash
cd AppRegistroSWIMBR
npm install
```

2) Rodar testes unitários / componentes (Vitest)

- Rodar todos os testes:

```bash
npm run test
```

- Rodar com cobertura:

```bash
npm run test:coverage
```

- Abrir interface do Vitest:

```bash
npm run test:ui
```

3) Estrutura e convenções

- Coloque testes de componentes em `src/**/__tests__/` ou `src/**/__tests__/*`.
- Use React Testing Library (`@testing-library/react`) e `user-event` para interações.
- Importe factories a partir de `src/tests/factories.ts` (exposto globalmente em `setupTests.ts`).
- Mockeie chamadas HTTP usando o mock global de `@/lib/axios` ou `vi.mock()` específico por teste.

4) E2E (Cypress)

- Pré-requisitos: backend em execução (`uvicorn main:app`) e DB seed.
- Abrir UI do Cypress:

```bash
npm run cypress:open
```

- Rodar E2E headless (CI):

```bash
npm run cypress:run
```

5) Boas práticas

- Escreva testes pequenos e determinísticos.
- Favor testes de integração do hook+component em vez de testar implementações internas.
- Use factories para gerar dados previsíveis.
