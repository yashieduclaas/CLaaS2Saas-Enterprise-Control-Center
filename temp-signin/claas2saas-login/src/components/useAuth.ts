// useAuth.ts
// Authentication hook — wraps MSAL.js for Microsoft Entra ID SSO
// 
// Dependencies (add to package.json):
//   @azure/msal-browser: ^3.x
//   @azure/msal-react:   ^2.x
//
// Usage:
//   const { signIn, isLoading, error } = useAuth();

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// MSAL Configuration
// Replace clientId and tenantId with values from Azure App Registration
// ---------------------------------------------------------------------------
// import { PublicClientApplication, Configuration } from "@azure/msal-browser";
//
// const msalConfig: Configuration = {
//   auth: {
//     clientId:    import.meta.env.VITE_ENTRA_CLIENT_ID,
//     authority:   `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
//     redirectUri: window.location.origin,
//   },
//   cache: {
//     cacheLocation: "sessionStorage",
//     storeAuthStateInCookie: false,
//   },
// };
//
// export const msalInstance = new PublicClientApplication(msalConfig);
//
// const loginRequest = {
//   scopes: ["openid", "profile", "email", "User.Read"],
// };

// ---------------------------------------------------------------------------
// Stub hook for design-time — replace body with real MSAL calls
// ---------------------------------------------------------------------------
interface AuthState {
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  signIn: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: null,
  });

  const signIn = useCallback(async () => {
    setState({ isLoading: true, error: null });
    try {
      // Production: replace with MSAL popup/redirect
      // await msalInstance.loginPopup(loginRequest);
      // or:
      // await msalInstance.loginRedirect(loginRequest);

      // Design-time stub — simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("[CLaaS2SaaS] MSAL sign-in initiated — wire up msalInstance");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setState({ isLoading: false, error: message });
    }
  }, []);

  return { ...state, signIn };
}
