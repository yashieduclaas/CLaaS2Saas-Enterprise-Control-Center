// apps/web/src/auth/MsalAuthProvider.tsx
// PLATFORM FILE — FROZEN.
// Stub MSAL implementation. Replace with full MSAL integration when Entra is configured.

import { createContext, useContext, type PropsWithChildren } from 'react';
import type { AuthState } from './useAuth';

interface MsalAuthContextValue extends AuthState {}

const MsalAuthContext = createContext<MsalAuthContextValue | null>(null);

export function useMsalAuth(): MsalAuthContextValue {
  const ctx = useContext(MsalAuthContext);
  if (!ctx) throw new Error('useMsalAuth must be used within MsalAuthProvider');
  return ctx;
}

export function MsalAuthProvider({ children }: PropsWithChildren) {
  const value: MsalAuthContextValue = {
    isAuthenticated: false,
    isLoading: false,
    userId: null,
    tenantId: null,
    displayName: null,
    email: null,
    getAccessToken: async () => null,
  };

  return (
    <MsalAuthContext.Provider value={value}>
      {children}
    </MsalAuthContext.Provider>
  );
}
