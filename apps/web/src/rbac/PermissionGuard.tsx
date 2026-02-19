// apps/web/src/rbac/PermissionGuard.tsx
// PLATFORM FILE — FROZEN.
// Wraps every protected route. Shows PageSkeleton while loading. Redirects to /forbidden if denied.

import { Navigate } from 'react-router-dom';
import { usePermissionContext } from './PermissionContext';
import { usePermission } from './usePermission';
import { ROUTE_MAP, getRoutePath, type RouteKey } from './RoutePermissionMap';
import { PageSkeleton } from '@/app/PageSkeleton';
import type { PropsWithChildren } from 'react';

interface PermissionGuardProps {
  pageKey: RouteKey;
}

export function PermissionGuard({ pageKey, children }: PropsWithChildren<PermissionGuardProps>) {
  const { isLoading } = usePermissionContext();

  const entry = ROUTE_MAP.find(r => r.pageKey === pageKey);
  const requiredPermission = entry?.requiredPermission ?? null;

  const hasPermission = usePermission(requiredPermission);

  if (isLoading) return <PageSkeleton />;
  if (!requiredPermission) return <>{children}</>;
  if (!hasPermission) return <Navigate to={getRoutePath('forbidden')} replace />;

  return <>{children}</>;
}
