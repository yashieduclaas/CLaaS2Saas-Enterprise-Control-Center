// apps/web/src/auth/AuthGuard.tsx
// PLATFORM FILE — FROZEN.
// Redirects to /login if not authenticated. Wraps the entire authenticated shell.

import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { PageSkeleton } from '@/app/PageSkeleton';
import { getRoutePath } from '@/rbac/RoutePermissionMap';
import type { PropsWithChildren } from 'react';

export function AuthGuard({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to={getRoutePath('login')} replace />;

  return <>{children}</>;
}
