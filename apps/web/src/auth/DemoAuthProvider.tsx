// apps/web/src/auth/DemoAuthProvider.tsx
// Demo mode identity provider. Paired with backend DemoAuthMiddleware.
// Identity is 100% client-side. No backend login call.
// The X-Demo-User header is injected by src/api/client.ts interceptor — NOT here.

import { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react';
import type { AuthState } from './useAuth';

// ── Canonical demo users ────────────────────────────────────────────────────
// Must exactly match the backend DemoUserStore.
// Email values are used as X-Demo-User header — exact string match required.
export const DEMO_USERS = [
  {
    email:       'test-global-admin@claas2saas-dev.onmicrosoft.com',
    displayName: 'Test Global Admin',
    userId:      '00000000-0000-0000-0001-000000000001',
    tenantId:    (import.meta.env['VITE_TEST_TENANT_ID'] as string | undefined) ?? 'demo-tenant-001',
  },
  {
    email:       'test-security-admin@claas2saas-dev.onmicrosoft.com',
    displayName: 'Test Security Admin',
    userId:      '00000000-0000-0000-0001-000000000002',
    tenantId:    (import.meta.env['VITE_TEST_TENANT_ID'] as string | undefined) ?? 'demo-tenant-001',
  },
  {
    email:       'test-module-admin@claas2saas-dev.onmicrosoft.com',
    displayName: 'Test Module Admin',
    userId:      '00000000-0000-0000-0001-000000000003',
    tenantId:    (import.meta.env['VITE_TEST_TENANT_ID'] as string | undefined) ?? 'demo-tenant-001',
  },
  {
    email:       'test-helpdesk@claas2saas-dev.onmicrosoft.com',
    displayName: 'Test Help Desk',
    userId:      '00000000-0000-0000-0001-000000000004',
    tenantId:    (import.meta.env['VITE_TEST_TENANT_ID'] as string | undefined) ?? 'demo-tenant-001',
  },
  {
    email:       'test-standard-user@claas2saas-dev.onmicrosoft.com',
    displayName: 'Test Standard User',
    userId:      '00000000-0000-0000-0001-000000000005',
    tenantId:    (import.meta.env['VITE_TEST_TENANT_ID'] as string | undefined) ?? 'demo-tenant-001',
  },
  {
    email:       'test-no-role@claas2saas-dev.onmicrosoft.com',
    displayName: 'Test No Role User',
    userId:      '00000000-0000-0000-0001-000000000006',
    tenantId:    (import.meta.env['VITE_TEST_TENANT_ID'] as string | undefined) ?? 'demo-tenant-001',
  },
] as const;

export type DemoUser = (typeof DEMO_USERS)[number];

const STORAGE_KEY = 'demo-user-email';
const DEFAULT_EMAIL = DEMO_USERS[0].email;

function getUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find(u => u.email === email);
}

function readStoredEmail(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_EMAIL;
}

interface DemoAuthContextValue extends AuthState {
  setActiveUser: (email: string) => void;
  activeUser: DemoUser;
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error('useDemoAuth must be used within DemoAuthProvider');
  return ctx;
}

export function DemoAuthProvider({ children }: PropsWithChildren) {
  const [activeEmail, setActiveEmail] = useState<string>(() => readStoredEmail());

  const activeUser = getUserByEmail(activeEmail) ?? DEMO_USERS[0];

  const setActiveUser = useCallback((email: string) => {
    localStorage.setItem(STORAGE_KEY, email);
    setActiveEmail(email);
  }, []);

  const getAccessToken = useCallback(async (): Promise<null> => null, []);

  const value: DemoAuthContextValue = {
    isAuthenticated: true,
    isLoading: false,
    userId: activeUser.userId,
    tenantId: activeUser.tenantId,
    displayName: activeUser.displayName,
    email: activeUser.email,
    getAccessToken,
    setActiveUser,
    activeUser,
  };

  return (
    <DemoAuthContext.Provider value={value}>
      {children}
    </DemoAuthContext.Provider>
  );
}
