// apps/web/src/api/client.ts
// PLATFORM FILE — The ONLY location for auth header injection.
// No component, hook, or feature module may read or write auth headers directly.

import axios, { type InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── MSAL interceptor slot ────────────────────────────────────────────────────
type MsalInterceptor = (cfg: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>;
export let msalInterceptorFn: MsalInterceptor | null = null;
export function registerMsalInterceptor(fn: MsalInterceptor): void {
  msalInterceptorFn = fn;
}

// ── Request interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const authMode = import.meta.env['VITE_AUTH_MODE'] as string | undefined;

  if (authMode === 'demo') {
    // Demo mode: inject X-Demo-User from localStorage.
    const email = localStorage.getItem('demo-user-email');
    if (email) {
      config.headers['X-Demo-User'] = email;
    }
    return config;
  }

  // Entra mode: inject Bearer token via registered MSAL interceptor.
  if (msalInterceptorFn) {
    return msalInterceptorFn(config);
  }

  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      if (error.response?.status === 403) {
        window.location.href = '/forbidden';
      }
    }
    return Promise.reject(error);
  }
);
