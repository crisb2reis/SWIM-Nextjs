'use client';

/**
 * components/AuthGuard.tsx
 * Protege rotas verificando a existência do token no localStorage.
 * Redireciona para /login se não autenticado.
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Box, CircularProgress } from '@mui/material';

const PUBLIC_ROUTES = ['/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const isPublicPath = PUBLIC_ROUTES.includes(pathname);

      if (!token && !isPublicPath) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Enquanto verifica o token no client side, renderizamos a casca da página (MainLayout) 
  // Opcional: Se quiser esconder conteúdo sensível muito rápido, podes retornar null,
  // mas retornar {children} permite que o Next.js faça o SSR do Layout Skeletons.
  
  if (isChecking && typeof window !== 'undefined' && !PUBLIC_ROUTES.includes(pathname)) {
     // Evita hydration mismatch mantendo a renderização igual ao SSR
     // Mas se o JS já carregou e está verificando, escondemos se preferir, ou apenas deixamos renderizar Skeletons.
     // Aqui vamos deixar o SSR processar garantindo {children} no initial render
  }

  return <>{children}</>;
}
