// apps/web/src/app/AppProviders.tsx
// PLATFORM FILE - Provider composition order is frozen.
// Fluent -> Auth -> QueryClient -> Permissions

import type { PropsWithChildren } from 'react';
import { FluentProvider, createDOMRenderer, RendererProvider } from '@fluentui/react-components';
import { kernelLightTheme } from '@/theme/kernelTheme';
import { QueryClientProvider } from '@tanstack/react-query';
import { PermissionProvider } from '@/rbac/PermissionContext';
import { queryClient } from '@/api/queryClient';
import { DemoAuthProvider } from '@/auth/DemoAuthProvider';
import { MsalAuthProvider } from '@/auth/MsalAuthProvider';

const isDemoMode = (import.meta.env['VITE_AUTH_MODE'] as string | undefined) === 'demo';

const renderer = createDOMRenderer();

export function AppProviders({ children }: PropsWithChildren) {
  const AuthProvider = isDemoMode ? DemoAuthProvider : MsalAuthProvider;

  return (
    <RendererProvider renderer={renderer} targetDocument={document}>
    <FluentProvider theme={kernelLightTheme}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <PermissionProvider>
            {children}
          </PermissionProvider>
        </QueryClientProvider>
      </AuthProvider>
    </FluentProvider>
    </RendererProvider>
  );
}
