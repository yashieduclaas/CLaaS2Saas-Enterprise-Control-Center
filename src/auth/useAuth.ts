// apps/web/src/auth/useAuth.ts
// PLATFORM FILE — FROZEN INTERFACE.
// Feature code imports useAuth from here only. Never from provider files directly.

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly userId: string | null;
  readonly tenantId: string | null;
  readonly displayName: string | null;
  readonly email: string | null;
  getAccessToken: () => Promise<string | null>;
}

import { useDemoAuth } from './DemoAuthProvider';
import { useMsalAuth } from './MsalAuthProvider';

const isDemoMode = (import.meta.env['VITE_AUTH_MODE'] as string | undefined) === 'demo';

export function useAuth(): AuthState {
  if (isDemoMode) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDemoAuth();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMsalAuth();
}
