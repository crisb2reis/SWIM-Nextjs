'use client';

/**
 * src/components/layout/AppWrapper.tsx
 * Lógica para alternar o layout global baseado na rota atual.
 */

import { usePathname } from 'next/navigation';
import { MainLayout } from './MainLayout';
import { AuthGuard } from '../AuthGuard';

const PUBLIC_ROUTES = ['/login', '/register', '/404', '/500'];

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
