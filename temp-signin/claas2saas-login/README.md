# CLaaS2SaaS Enterprises — Enterprise Control Center
## Login Page

React 18 + TypeScript 5 + Microsoft Fluent UI v9 sign-in screen.

---

### Tech Stack
| Layer | Technology |
|---|---|
| Framework | React 18.2 + TypeScript 5.x |
| Build | Vite 5.x |
| UI System | Microsoft Fluent UI React v9 (Fluent 2) |
| Icons | Fluent System Icons (`@fluentui/react-icons`) |
| Auth | MSAL.js v3 (`@azure/msal-browser` + `@azure/msal-react`) |
| Identity | Microsoft Entra ID (Azure AD) |
| Styling | CSS Modules + Fluent Design Tokens |
| Typography | Montserrat (heading) + Source Sans 3 (body) |

---

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# → Fill in VITE_ENTRA_CLIENT_ID and VITE_ENTRA_TENANT_ID

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
```

---

### Azure App Registration (Entra ID Setup)

1. Go to **Azure Portal → Microsoft Entra ID → App registrations → New registration**
2. Set redirect URI: `http://localhost:3000` (dev) / your production URL
3. Copy **Application (client) ID** → `VITE_ENTRA_CLIENT_ID`
4. Copy **Directory (tenant) ID** → `VITE_ENTRA_TENANT_ID`
5. Under **API permissions** add: `openid`, `profile`, `email`, `User.Read`

---

### Wiring Up MSAL Authentication

In `src/components/useAuth.ts`, uncomment and configure:

```typescript
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId:    import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority:   `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
```

Then in `signIn()`:
```typescript
await msalInstance.loginPopup({ scopes: ["openid", "profile", "User.Read"] });
```

Wrap `main.tsx` with `<MsalProvider instance={msalInstance}>` from `@azure/msal-react`.

---

### Project Structure

```
src/
├── App.tsx                     # FluentProvider wrapper
├── main.tsx                    # React entry point
├── components/
│   ├── LoginPage.tsx           # Main page component
│   ├── MicrosoftLogo.tsx       # MS 4-square logo SVG
│   ├── ShieldIcon.tsx          # Shield SVG icon
│   └── useAuth.ts              # MSAL auth hook
└── styles/
    ├── global.css              # Fonts, resets, Fluent token overrides
    ├── theme.ts                # Fluent UI v9 custom brand theme
    └── LoginPage.module.css    # Scoped component styles
```

---

### Accessibility
- WCAG 2.1 AA compliant focus rings (gold `#B3A125`)
- Semantic HTML (`<aside>`, `<section>`, `<h1>`, `<h2>`, `<ul>`)
- `aria-label` on all interactive and landmark elements
- `role="alert"` on error states
- Keyboard navigable via Fluent UI's built-in focus management
