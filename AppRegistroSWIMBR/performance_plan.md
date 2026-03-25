# Documento de Otimização: Performance e Skilling no Next.js App Router

Este documento detalha o plano de ação de um **Desenvolvedor Sênior** para investigar e mitigar as altas latências reportadas nas rotas do projeto (ex: `GET /utility/contacts/manage` variando de 30s a 300ms).

---

## 1. Diagnóstico de Causa Raiz
As discrepâncias brutais nos logs de renderização do frontend (de 30 segundos no *cold-start* para 300ms depois) apontam para 4 possíveis cenários principais:

1.  **Cold Start do Serverless/Dev Mode:** Se a aplicação roda em ambiente de desenvolvimento (ou sob demanda Serverless/Vercel sem pre-warm), a primeira chamada invoca a compilação lenta do Webpack/Turbopack.
2.  **AuthGuard Bloqueante (Waterfall CSR):** Como a aplicação baseia sua autenticação unicamente em `localStorage` *(Client-Side)*, o servidor do Next.js só consegue entregar uma casca oca (`<CircularProgress />`). O navegador baixa dezenas de MBs de JS, hidrata o app, lê o `localStorage`, navega pro componente correto e só *então* inicia a chamada com o Backend (SWR).
3.  **Compilação Pesada de Bibliotecas Externas:** Páginas com DataGrid (`@mui/x-data-grid`) forçam o empacotamento de uma massa gigante de JS.
4.  **Backend "Frio":** Conexões ao DB ou modelos do FastAPI podem exigir reinicializações e instanciamento na primeira execução do dia.

---

## Fases do Plano de Ação Estruturado

### Fase 1: Otimização de Perfomance Percebida (UX) - Streaming e Skeletons
**Objetivo:** Eliminar o gap visual da "tela em branco" ou spinners rudimentares de página interia que amplificam a percepção de demora.

**Ações práticas:**
1.  Introduzir `loading.tsx` nativamente suportado pelo App Router nas raízes das features.
2.  Utilizar esqueletos dedicados ao Mui para mimetizar layouts.

**Exemplo de código:**
```tsx
// app/[locale]/utility/loading.tsx
import { Box, Skeleton, Card } from '@mui/material';

export default function LoadingUtility() {
  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Skeleton width="40%" height={60} />
      <Skeleton width="60%" height={30} sx={{ mb: 4 }} />
      <Card sx={{ p: 2 }}>
        {[...Array(8)].map((_, i) => <Skeleton key={i} height={50} sx={{ mb: 1 }} />)}
      </Card>
    </Box>
  );
}
```
**Ganho esperado:** O utilizador vê a estrutura e navegação da interface nos **primeiros 500ms**, mesmo que os dados demorem a se formar: o First Contentful Paint (FCP) cai drasticamente.

---

### Fase 2: Otimização de Caching Client-Side (SWR e Interactivity)
**Objetivo:** Evitar redundância de hits ao invocar a API em componentes adjacentes e utilizar staling adequado.

**Ações práticas:**
1.  Habilitar `fallbackData` para evitar spinners nos redirecionamentos entre abas ou acessos de cache back/forward.
2.  Garantir a desduplicação (`dedupingInterval`) para evitar disparos em massa.

**Exemplo de código:**
Configuração global para evitar saltos na tela:
```tsx
// app/[locale]/MuiProvider.tsx (ou SWRConfig root)
<SWRConfig value={{
  revalidateOnFocus: false,     // Evita chamadas agressivas ao minimizar/voltar
  dedupingInterval: 10000,      // Previne duplicate fetches na mesma janela de 10s
  shouldRetryOnError: false,
}}>
  {children}
</SWRConfig>
```
**Ganho esperado:** Como os acessos subsequentes já atestaram (caindo de 30s para 345ms), a configuração otimizada do SWR garante reuso instantâneo em navegações (cache em RAM).

---

### Fase 3: Estratégias de Renderização e Code Splitting (Client-side footprint)
**Objetivo:** Remover blocos inteiros de JS do parsing inicial do cliente.

**Ações práticas:**
1.  Importar dinamicamente (`next/dynamic`) qualquer dependência pesada de UI em instâncias que não precisam de indexação SEO, como os gráficos ou o MUI DataGrid. *(Ação prévia realizada em Contacts/Services/Orgs Container)*.
2.  Separar corretamente a árvore `use client` para manter as diretrizes do Next.js. O Layout principal deve prezar pela mínima hidratação.

**Ganho esperado:** O custo de download e hidratação (Time to Interactive - TTI) pode cair de 5s para cerca de 1.5s, pois as sub-árvores só são carregadas em demanda.

---

### Fase 4: Otimização Definitiva de Autenticação - SSR "Real" (Transição de Arquitetura)
**Objetivo:** Habilitar SSR (Server-Side Rendering) seguro com autenticação, eliminando o Waterfall (Render de Casca Client-side -> Fetch Fetch).

**Ações práticas:**
1. Migrar a guarda de Tokens de `localStorage` puro para **`HttpOnly Cookies`**.
2. Adaptar o interceptor do FastAPI/Axios para aceitar o token nos Cookies.
3. Usar Middleware (`middleware.ts`) para verificação de JWT antes que o servidor dispare respostas.
4. Mover as listagens base (*Contacts*, *Organizations*) para fetches nativos de servidor em `page.tsx` com Server Components.

**Exemplo de código (Server Component + Fetch direto):**
```tsx
// app/[locale]/utility/contacts/manage/page.tsx
import { cookies } from 'next/headers';
import ContactsClientWrapper from './ContactsClientWrapper';

// Route Segment Config (opcional para ISR/Dinâmico estrito)
export const dynamic = 'force-dynamic';

export default async function ContactManagePage() {
  const token = cookies().get('session_token')?.value;
  // O servidor busca dados (sem expor para payload JS) com zero latência para internet
  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/contact-points/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const preloadedContacts = await res.json();

  return <ContactsClientWrapper fallbackData={preloadedContacts} />;
}
```
**Ganho esperado:** Essa arquitetura (que unifica Server Components + SWR Hybrid) zera o **Loading Indicator** primário. Se o Backend demorar 2s, o usuário recebe a página completa imediatamente pronta em 2.2s.

---

## Quick Wins Mapeados (Massa de Impacto)

1. **Implementar `loading.tsx` global aos Segmentos:** Custa poucos minutos (MUI Skeletons) e aumenta consideravelmente a percepção de performance.
2. **Next/Dynamic nas Tabelas:** Fazer lazy loading em componentes como `<DataGrid>` e os Modais `<Dialog>`. Isso alivia o bundle principal e ajuda na indexação imediata da hierarquia do site.
3. **Paginação Backend:** Em vez de retornar arrays integrais de `10.000` documentos pro SWR mastigar de uma vez, usar *Server-Side Pagination* da base de dados se a mesma ultrapassar 500 registros. A diferença pode saltar a métrica em 80%.
4. **Variáveis de Ambiente Dinâmicas vs Estáticas:** Rotas onde a `fetch` é chamada não dependem de recompilação e minimizam conflitos entre o `NEXT_PUBLIC` versus Server-only secrets se o modelo SSR for adotado.
