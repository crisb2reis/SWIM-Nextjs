'use client';

/**
 * components/AuthGuard.tsx
 * Protege rotas verificando a existência do token no localStorage.
 * Redireciona para /login se não autenticado.
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

const PUBLIC_ROUTES = ['/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const isPublicPath = PUBLIC_ROUTES.includes(pathname);

      if (!token && !isPublicPath) {
        setIsAuthorized(false);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!isAuthorized && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100vh', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
