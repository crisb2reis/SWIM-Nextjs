# Testing Guide - Swim Next.js

Este documento descreve as práticas de testes, configurações e convenções utilizadas no projeto Swim Next.js (Vitest + React Testing Library + Cypress).

---

## 1) Instalação

```bash
cd AppRegistroSWIMBR
npm install
```

---

## 2) Rodar testes unitários / componentes (Vitest)

- **Rodar todos os testes (modo watch):**
  ```bash
  npm run test
  ```

- **Rodar testes uma vez (CI/CD):**
  ```bash
  npm run test -- --run
  ```

- **Rodar com interface visual (UI):**
  ```bash
  npm run test:ui
  ```

- **Gerar relatório de cobertura:**
  ```bash
  npm run test:coverage
  ```

- **Verificar tipos TypeScript:**
  ```bash
  npm run type-check
  ```

---

## 3) Visão Geral e Configuração

### Frameworks e Ferramentas
- **Vitest**: Framework de testes principal.
- **@testing-library/react**: Testes de componentes focados no comportamento do usuário.
- **jsdom**: Ambiente de teste (DOM simulado).
- **Cypress**: Testes End-to-End (E2E).

### Arquivos de Configuração
| Arquivo | Descrição |
|---------|-----------|
| `vitest.config.ts` | Configuração principal do Vitest |
| `setupTests.ts` | Mocks globais e configurações de ambiente |
| `cypress.config.ts` | Configuração do Cypress |

---

## 4) Estrutura e Convenções

Coloque os arquivos de teste preferencialmente em diretórios `__tests__/` co-localizados com o código.

```
src/
├── features/
│   ├── [feature]/
│   │   ├── components/__tests__/
│   │   ├── services/__tests__/
│   │   └── hooks/__tests__/
```

**Convenções:**
- Arquivos de teste: `*.test.ts` ou `*.test.tsx`
- Nomeie os testes de forma descritiva (ex: `deve retornar erro quando API falha`).
- Use factories (em `src/tests/factories.ts`) para gerar dados previsíveis.

---

## 5) End-to-End (Cypress)

- **Pré-requisitos:** Backend em execução e banco de dados configurado.
- **Abrir UI do Cypress:**
  ```bash
  npm run cypress:open
  ```
- **Rodar E2E headless (CI):**
  ```bash
  npm run cypress:run
  ```

---

## 6) Boas Práticas

1. **Um teste, uma responsabilidade**: Evite múltiplas asserções independentes no mesmo `it`.
2. **Resetar estados**: Use `beforeEach` com `vi.clearAllMocks()` ou `vi.resetAllMocks()`.
3. **Casos de Erro**: Teste não apenas o "caminho feliz", mas também como o sistema reage a falhas da API.
4. **Rapidez**: Mantenha testes de unidade/componente rápidos (< 100ms por teste idealmente).
5. **Mocks**: Utilize os mocks globais definidos em `setupTests.ts` (next-intl, next-navigation, axios).
