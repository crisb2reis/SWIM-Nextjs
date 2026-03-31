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
