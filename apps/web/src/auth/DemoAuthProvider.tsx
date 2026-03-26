// apps/web/src/auth/DemoAuthProvider.tsx
// Demo mode identity provider. Paired with backend DemoAuthMiddleware.
// Identity is 100% client-side. No backend login call.
// The X-Demo-User header is injected by src/api/client.ts interceptor — NOT here.

import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { AuthState } from './useAuth';

// ── Canonical demo users ────────────────────────────────────────────────────
// Must exactly match the backend DemoUserStore.
// Email values are used as X-Demo-User header — exact string match required.
export const DEMO_USERS = [
  {
    email: 'global.admin@demo.com',
    displayName: 'Global Admin',
    userId: 'demo-user-global-admin',
    tenantId: 'tenant-global',
  },
  {
    email: 'security.admin@demo.com',
    displayName: 'Security Admin',
    userId: 'demo-user-security-admin',
    tenantId: 'tenant-a',
  },
  {
    email: 'helpdesk@demo.com',
    displayName: 'Help Desk',
    userId: 'demo-user-helpdesk',
    tenantId: 'tenant-a',
  },
  {
    email: 'user@tenantA.com',
    displayName: 'User TenantA',
    userId: 'demo-user-tenant-a',
    tenantId: 'tenant-a',
  },
  {
    email: 'user@tenantB.com',
    displayName: 'User TenantB',
    userId: 'demo-user-tenant-b',
    tenantId: 'tenant-b',
  },
] as const;

export type DemoUser = (typeof DEMO_USERS)[number];

const STORAGE_KEY = 'demo-user-email';
const TENANT_STORAGE_KEY = 'demo-tenant-id';
const DEFAULT_EMAIL = DEMO_USERS[0].email;

function getUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find(u => u.email === email);
}

function readStoredEmail(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_EMAIL;
}

function persistDemoUser(user: DemoUser): void {
  localStorage.setItem(STORAGE_KEY, user.email);
  localStorage.setItem(TENANT_STORAGE_KEY, user.tenantId);
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

  useEffect(() => {
    persistDemoUser(activeUser);
  }, [activeUser]);

  const setActiveUser = useCallback((email: string) => {
    const nextUser = getUserByEmail(email) ?? DEMO_USERS[0];
    persistDemoUser(nextUser);
    setActiveEmail(nextUser.email);
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
