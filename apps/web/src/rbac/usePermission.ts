// apps/web/src/rbac/usePermission.ts
// PLATFORM FILE — FROZEN.
// The single hook for checking a permission. Feature code uses only this.

import { usePermissionContext } from './PermissionContext';

export function usePermission(code: string | null | undefined): boolean {
  const { permissions, isLoading } = usePermissionContext();
  if (isLoading || !code) return false;
  return permissions.has(code);
}
