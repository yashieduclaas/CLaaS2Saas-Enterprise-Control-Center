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
  const { userId, tenantId, isAuthenticated } = useAuth();
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
        const fallback = isDemo ? ['ROLE:READ', 'ROLE:CREATE', 'MODULE:READ', 'AUDIT:VIEW_SESSIONS', 'USER:READ', 'ADMIN:GLOBAL'] : [];
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
