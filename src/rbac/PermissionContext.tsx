// apps/web/src/rbac/PermissionContext.tsx
// PLATFORM FILE — wired to GET /api/auth/me/permissions.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';
import { apiClient } from '@/api/client';
import { useAuth } from '@/auth/useAuth';
import { DEMO_USERS } from '@/auth/DemoAuthProvider';

export interface PermissionContextValue {
  permissions: ReadonlySet<string>;
  isLoading: boolean;
  isError: boolean;
  reload: () => void;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function usePermissionContext(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissionContext must be used within PermissionProvider');
  return ctx;
}

export function PermissionProvider({ children }: PropsWithChildren) {
  const { userId, tenantId, isAuthenticated, email } = useAuth();
  const [permissions, setPermissions] = useState<ReadonlySet<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken(t => t + 1);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setPermissions(new Set());
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPermissions() {
      setIsLoading(true);
      setIsError(false);
      try {
        // GET /api/auth/me/permissions — returns string[] (plain array)
        const response = await apiClient.get<string[]>('/api/auth/me/permissions');
        if (!cancelled) {
          setPermissions(new Set(response.data));
        }
      } catch {
        // Fail closed: on any error, permissions = empty set.
        // Demo mode: use fallback so nav renders when backend is down
        const isDemo = (import.meta.env['VITE_AUTH_MODE'] as string | undefined) === 'demo';
        const isGlobalAdmin = isDemo && email === DEMO_USERS[0].email;
        const fallback = isGlobalAdmin
          ? [
            // Full GLOBAL_ADMIN permission set — mirrors backend DemoPermissionEvaluator
            'ROLE:CREATE', 'ROLE:READ', 'ROLE:UPDATE', 'ROLE:DELETE',
            'USER:CREATE', 'USER:READ', 'USER:UPDATE', 'USER:DELETE',
            'USER:ASSIGN_ROLE', 'USER:REVOKE_ROLE',
            'USERS:READ', 'USERS:WRITE', 'USERS:DELETE',
            'TENANT:READ', 'TENANT:WRITE',
            'MODULE:CREATE', 'MODULE:READ', 'MODULE:UPDATE', 'MODULE:DELETE',
            'AUDIT:VIEW_SESSIONS', 'AUDIT:VIEW_ACTIONS', 'AUDIT:EXPORT',
            'ACCESS_REQUEST:SUBMIT', 'ACCESS_REQUEST:REVIEW', 'ACCESS_REQUEST:RESOLVE',
            'ADMIN:MODULE_SCOPED', 'ADMIN:GLOBAL',
          ]
          : isDemo
            ? ['ROLE:READ', 'ROLE:CREATE', 'MODULE:READ', 'AUDIT:VIEW_SESSIONS', 'USER:READ', 'ADMIN:GLOBAL']
            : [];
        if (!cancelled) {
          setIsError(true);
          setPermissions(new Set(fallback));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadPermissions();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tenantId, isAuthenticated, reloadToken]);

  return (
    <PermissionContext.Provider value={{ permissions, isLoading, isError, reload }}>
      {children}
    </PermissionContext.Provider>
  );
}
