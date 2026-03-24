import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { AppProviders } from './app/AppProviders';
import { AppRouter } from './app/AppRouter';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID ?? '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID ?? 'common'}`,
    redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI ?? window.location.origin,
  },
});

export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthenticatedTemplate>
        <AppProviders>
          <AppRouter />
        </AppProviders>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div style={{ padding: 24 }}>Please sign in to continue.</div>
      </UnauthenticatedTemplate>
    </MsalProvider>
  );
}
