'use client';

/**
 * src/components/layout/AppWrapper.tsx
 * Lógica para alternar o layout global baseado na rota atual.
 */

import { usePathname } from '@/i18n/navigation';
import { MainLayout } from './MainLayout';
import { AuthGuard } from '../AuthGuard';
import { SWRConfig } from 'swr';

const PUBLIC_ROUTES = ['/login', '/register', '/404', '/500'];

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  return (
    <SWRConfig 
      value={{ 
        revalidateOnFocus: false, // Evita refetch agressivo
        dedupingInterval: 10000,  // Deduplica chamadas idênticas por 10s
        shouldRetryOnError: false 
      }}
    >
      <AuthGuard>
        {isPublicRoute ? children : <MainLayout>{children}</MainLayout>}
      </AuthGuard>
    </SWRConfig>
  );
}
