# KERNEL — System Technical Overview & Environment Configuration

> **Purpose:** Production-grade knowledge base for developer onboarding, system understanding, and LLM knowledge retrieval (RAG / Semantic Kernel).
>
> **Single Source of Truth:** This document is the sole authority for all technology names, versions, and packages used in the KERNEL system. All Copilot configuration files, agent profiles, and prompt templates reference this document rather than duplicating version details. If the tech stack changes, only this file is updated — the Copilot system remains stable.
>
> **Last Updated:** 2026-03-25 — Post-upgrade alignment (security patches and minor version bumps within same major lines).

---

## 1. System Overview

**KERNEL** is a full-stack, Azure-native Security Control Center (SCC) application built as a monorepo. It consists of:

- A **.NET 10 REST API** backend (`apps/api`) following Clean Architecture across four projects (`Kernel.Domain`, `Kernel.Application`, `Kernel.Infrastructure`, `Kernel.API`), secured via Azure Entra ID
- A **React + Vite SPA** frontend (`apps/web`) communicating with the API over HTTP, styled with Fluent UI v9 and Griffel
- An **Azure SQL** database managed through Entity Framework Core
- Shared types/contracts via a local package (`packages/contracts`)

The system is designed for enterprise security workflows, with authentication delegated entirely to Azure Entra ID (formerly Azure Active Directory) and authorization enforced through `IPermissionEvaluator`.

---

## 2. Tech Stack Breakdown

### Backend — .NET 10 API

| Technology | Version | Role |
|---|---|---|
| .NET 10 SDK | 10.0.201 | Runtime & API framework (pinned in `global.json` with `rollForward: latestPatch`) |
| ASP.NET Core | 10.0 | HTTP pipeline, routing, middleware |
| Entity Framework Core | 9.0.3 | ORM — database access, migrations, change tracking, global query filters |
| EF Core SqlServer | 9.0.3 | Azure SQL provider for EF Core |
| Microsoft.Identity.Web | 4.4.0 | Azure Entra ID token validation & auth middleware |
| Microsoft.IdentityModel.Protocols.OpenIdConnect | 8.16.0 | OpenID Connect protocol support |
| System.IdentityModel.Tokens.Jwt | 8.16.0 | JWT creation, parsing, and validation |
| FluentValidation.AspNetCore | 11.3.1 | Request model validation (MediatR pipeline behaviour) |
| Swashbuckle.AspNetCore | 10.1.4 | Swagger/OpenAPI documentation |
| MediatR | (see .csproj) | CQRS command/query pipeline for Clean Architecture |

### Frontend — React + Vite SPA (Runtime Dependencies)

| Package | Version | Role |
|---|---|---|
| `react` | ^18.3.1 | Core UI rendering library |
| `react-dom` | ^18.3.1 | DOM rendering for React |
| `react-router-dom` | ^6.30.3 | SPA client-side routing |
| `@tanstack/react-query` | ^5.95.2 | Async server state: fetching, caching, synchronizing API data |
| `@tanstack/react-query-devtools` | ^5.95.2 | React Query developer tools (dev only, tree-shaken in production) |
| `axios` | ^1.13.6 | HTTP client — makes authenticated requests to the .NET API |
| `@fluentui/react-components` | ^9.73.4 | Microsoft Fluent UI v9 design system components |
| `@fluentui/react-icons` | ^2.0.322 | Icon library consistent with Fluent UI |
| `@azure/msal-browser` | ^3.30.0 | Microsoft Authentication Library — browser-side PKCE flow |
| `@azure/msal-react` | ^2.2.0 | React bindings for MSAL (hooks, context, guards) |
| `zod` | ^3.25.76 | Runtime schema validation & type inference at the API boundary |
| `@claas2saas/contracts` | local | Shared DTO/type contracts between frontend and backend |

### Frontend — Build & Dev Tooling

| Package | Version | Role |
|---|---|---|
| `vite` | ^5.4.21 | Fast ESM build tool and dev server |
| `@vitejs/plugin-react` | ^4.7.0 | Vite plugin for React Fast Refresh and JSX transform |
| `typescript` | ^5.9.3 | Static typing across the entire frontend codebase |
| `sharp` | ^0.34.5 | Image optimization during build (used by Vite plugin) |

### Frontend — Linting & Formatting

| Package | Version | Role |
|---|---|---|
| `eslint` | ^8.57.1 | JavaScript/TypeScript linter |
| `@typescript-eslint/parser` | ^7.18.0 | ESLint parser for TypeScript AST |
| `@typescript-eslint/eslint-plugin` | ^7.18.0 | TypeScript-specific lint rules |
| `eslint-plugin-react` | ^7.37.5 | React-specific lint rules |
| `eslint-plugin-react-hooks` | ^4.6.2 | Enforces Rules of Hooks |
| `eslint-plugin-react-refresh` | ^0.4.26 | Validates React Fast Refresh compatibility |
| `prettier` | ^3.8.1 | Code formatter (consistent style across the monorepo) |

### Frontend — Testing

| Package | Version | Role |
|---|---|---|
| `vitest` | ^1.6.1 | Unit and integration test runner (Vite-native) |
| `@vitest/coverage-v8` | ^1.6.1 | Code coverage via V8 engine instrumentation |
| `@testing-library/react` | ^15.0.7 | React component testing utilities |
| `@testing-library/user-event` | ^14.6.1 | Simulates realistic user interactions in tests |
| `@testing-library/jest-dom` | ^6.9.1 | Custom DOM element matchers for assertions |
| `jsdom` | ^24.1.3 | Browser environment simulation for Vitest |

### Contracts Package (`packages/contracts`)

| Package | Version | Role |
|---|---|---|
| `typescript` | ^5.9.3 | Static typing (aligned with frontend) |
| `tsup` | ^8.5.1 | TypeScript bundler for building the contracts package |
| `zod` | ^3.25.76 | Schema validation (aligned with frontend) |

---

## 3. Runtime Requirements

### Node.js

| Requirement | Value |
|---|---|
| Engine range | `>=20.15.1 <23` |
| Preferred runtime | Node 22.x LTS |
| npm minimum | `>=10` |

The engine range is enforced in the root `package.json`. Node 22.x LTS is the recommended version for local development and CI. Node 24.x is not yet supported and will trigger `EBADENGINE` warnings.

### .NET SDK

| Requirement | Value |
|---|---|
| SDK version | 10.0.201 |
| Roll-forward policy | `latestPatch` |

Pinned in `global.json`. The `latestPatch` roll-forward policy ensures consistent builds across dev machines and CI while automatically picking up patch-level security fixes.

---

## 4. Environment Variables

### Azure Entra ID (Authentication)

| Variable | Description | Used By |
|---|---|---|
| `AZUREAD_TENANT_ID` | Azure AD tenant identifier (directory ID) | Backend API — token issuer validation |
| `AZUREAD_CLIENT_ID` | App registration client ID | Backend API — audience validation |
| `AZUREAD_CLIENT_SECRET` | App registration client secret | Backend API — confidential client flows |

**`AZUREAD_TENANT_ID`**
The unique identifier of your Azure Active Directory tenant. Used by `Microsoft.Identity.Web` to construct the expected token issuer URL (`https://login.microsoftonline.com/<tenant_id>/v2.0`). All incoming JWTs are validated against this issuer.

**`AZUREAD_CLIENT_ID`**
The Application (client) ID of the backend API app registration in Azure Entra ID. Used to validate that incoming tokens were issued specifically for this API (audience check).

**`AZUREAD_CLIENT_SECRET`**
The client secret for the backend app registration. Used when the API itself needs to make outbound calls to Microsoft Graph or other protected resources (on-behalf-of flow or client credentials flow).

---

### Database Configuration

```
CONNECTIONSTRINGS_SECURITYDB=Server=tcp:<server>.database.windows.net,1433;
  Initial Catalog=<db>;
  Persist Security Info=False;
  User ID=<user>;
  Password=<password>;
  MultipleActiveResultSets=False;
  Encrypt=True;
  TrustServerCertificate=False;
  Connection Timeout=30;
```

| Connection String Part | Value | Meaning |
|---|---|---|
| `Server` | `tcp:<server>.database.windows.net,1433` | Azure SQL Server FQDN over TCP port 1433 |
| `Initial Catalog` | `<db>` | Target database name |
| `Persist Security Info` | `False` | Credentials not retained after connection |
| `User ID` / `Password` | `<user>` / `<password>` | SQL authentication credentials |
| `MultipleActiveResultSets` | `False` | MARS disabled (recommended for Azure SQL) |
| `Encrypt` | `True` | TLS encryption enforced |
| `TrustServerCertificate` | `False` | Server certificate validated (production-safe) |
| `Connection Timeout` | `30` | Connection attempt timeout in seconds |

This connection string is consumed by EF Core via `AddDbContext<ApplicationDbContext>(o => o.UseSqlServer(...))` in the API startup.

---

### JWT Configuration

| Variable | Description |
|---|---|
| `SCC_JWT_ISSUER` | The issuer claim (`iss`) embedded in issued JWTs — typically your domain |
| `SCC_JWT_AUDIENCE` | The audience claim (`aud`) — identifies the intended recipient of the token |
| `SCC_JWT_EXPIRY_MINUTES` | Token lifetime in minutes (default: `30`) |

**Token Validation Flow:**
The API uses `System.IdentityModel.Tokens.Jwt` and `Microsoft.Identity.Web` to validate every incoming bearer token. The validation enforces a clock skew of `TimeSpan.FromMinutes(2)` as specified in the Coding Constitution. The sequence is: verify signature using Entra ID public keys (fetched from the OIDC discovery endpoint), validate `iss` matches `SCC_JWT_ISSUER`, validate `aud` matches `SCC_JWT_AUDIENCE`, validate `exp` (token not expired), and validate `nbf` (token not used before valid time).

---

### Frontend Vite Configuration

| Variable | Description |
|---|---|
| `VITE_AUTH_MODE` | Authentication mode — `entra` activates Azure Entra ID login flow |
| `VITE_API_URL` | Base URL of the backend API (e.g., `http://localhost:8000`) |
| `VITE_ENTRA_CLIENT_ID` | Entra ID app registration client ID (frontend SPA registration) |
| `VITE_ENTRA_TENANT_ID` | Azure AD tenant ID |
| `VITE_ENTRA_REDIRECT_URI` | OAuth2 redirect URI after login (e.g., `http://localhost:5173`) |
| `VITE_TEST_TENANT_ID` | Tenant ID used in test/dev environments |

All `VITE_*` variables are inlined at build time by Vite and exposed via `import.meta.env`. Do **not** put secrets in `VITE_*` variables — they are public. In staging and production, these values are injected via GitHub Actions environment secrets, not committed `.env` files.

---

## 5. Dependency Analysis

### Backend (.NET) Packages

| Package | Version | Purpose |
|---|---|---|
| `Microsoft.Identity.Web` | 4.4.0 | Integrates Azure Entra ID into ASP.NET Core middleware. Validates bearer tokens and exposes user claims. |
| `Microsoft.IdentityModel.Protocols.OpenIdConnect` | 8.16.0 | Fetches and caches OIDC metadata (signing keys, issuer) from Azure's discovery endpoint. |
| `System.IdentityModel.Tokens.Jwt` | 8.16.0 | Low-level JWT parsing and validation primitives used by Identity.Web. |
| `Microsoft.EntityFrameworkCore` | 9.0.3 | ORM core — LINQ-to-SQL, migrations, change tracking, global query filters for soft-delete. |
| `Microsoft.EntityFrameworkCore.SqlServer` | 9.0.3 | Azure SQL / SQL Server database provider for EF Core. |
| `FluentValidation.AspNetCore` | 11.3.1 | Declarative, testable validation rules for MediatR commands. Runs as a pipeline behaviour. |
| `Swashbuckle.AspNetCore` | 10.1.4 | Generates OpenAPI/Swagger docs from controller annotations. |

### Frontend (NPM) Runtime Packages

| Package | Version | Purpose |
|---|---|---|
| `react` / `react-dom` | ^18.3.1 | Core UI rendering library (React 18 with concurrent features) |
| `react-router-dom` | ^6.30.3 | SPA client-side routing with lazy-loaded route components |
| `@tanstack/react-query` | ^5.95.2 | Async server state: fetching, caching, synchronizing API data (sole server state manager) |
| `@tanstack/react-query-devtools` | ^5.95.2 | Development-only React Query inspector (tree-shaken in production builds) |
| `axios` | ^1.13.6 | HTTP client — makes authenticated requests to the .NET API via Axios interceptors |
| `@fluentui/react-components` | ^9.73.4 | Microsoft Fluent UI v9 design system components (sole UI component library) |
| `@fluentui/react-icons` | ^2.0.322 | SVG icon library consistent with Fluent UI (tree-shakeable) |
| `@azure/msal-browser` | ^3.30.0 | Microsoft Authentication Library — PKCE flow, silent token acquisition, token cache |
| `@azure/msal-react` | ^2.2.0 | React hooks and context for MSAL integration (`useMsalAuthentication`, `MsalProvider`) |
| `zod` | ^3.25.76 | Schema declaration and runtime validation; validates API response shapes at the boundary |
| `@claas2saas/contracts` | local | Shared TypeScript types/DTOs between frontend and backend (additive-only versioning) |

### Frontend (NPM) Build & Dev Packages

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^5.4.21 | Fast ESM build tool and dev server with Hot Module Replacement |
| `@vitejs/plugin-react` | ^4.7.0 | Vite plugin providing React Fast Refresh and automatic JSX transform |
| `typescript` | ^5.9.3 | Static typing across the entire frontend and contracts codebase |
| `sharp` | ^0.34.5 | Image optimization during build (used by Vite image plugin) |
| `eslint` | ^8.57.1 | JavaScript/TypeScript linter (flat config mode) |
| `@typescript-eslint/parser` | ^7.18.0 | ESLint parser enabling TypeScript AST analysis |
| `@typescript-eslint/eslint-plugin` | ^7.18.0 | TypeScript-specific lint rules (type-aware) |
| `eslint-plugin-react` | ^7.37.5 | React-specific lint rules (JSX, component patterns) |
| `eslint-plugin-react-hooks` | ^4.6.2 | Enforces Rules of Hooks and dependency arrays |
| `eslint-plugin-react-refresh` | ^0.4.26 | Validates components are compatible with React Fast Refresh |
| `prettier` | ^3.8.1 | Code formatter enforcing consistent style across the monorepo |
| `vitest` | ^1.6.1 | Vite-native test runner for unit and integration tests |
| `@vitest/coverage-v8` | ^1.6.1 | Code coverage via V8 engine instrumentation |
| `@testing-library/react` | ^15.0.7 | React component testing utilities (render, screen, queries) |
| `@testing-library/user-event` | ^14.6.1 | Simulates realistic user interactions (click, type, tab) in tests |
| `@testing-library/jest-dom` | ^6.9.1 | Custom DOM element matchers for readable assertions |
| `jsdom` | ^24.1.3 | Browser environment simulation for Vitest (DOM API in Node.js) |

### Contracts Package (`packages/contracts`)

| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^5.9.3 | Static typing (aligned with `apps/web`) |
| `tsup` | ^8.5.1 | TypeScript bundler producing CommonJS and ESM outputs |
| `zod` | ^3.25.76 | Schema validation for shared DTOs (aligned with `apps/web`) |

---

## 6. System Architecture

```
┌─────────────────────────────────────┐
│           React SPA (Vite)          │
│  - Fluent UI v9 components          │
│  - Griffel makeStyles() styling     │
│  - React Query for server state     │
│  - Axios + MSAL for API calls       │
│  - Zod for API response validation  │
└───────────────┬─────────────────────┘
                │ Bearer JWT (Entra token)
                │ HTTP → VITE_API_URL
                ▼
┌─────────────────────────────────────┐
│     .NET 10 REST API (Kernel.API)   │
│  - ASP.NET Core middleware          │
│  - Microsoft.Identity.Web (auth)    │
│  - MediatR (CQRS pipeline)         │
│  - FluentValidation (input)         │
│  - IPermissionEvaluator (authz)     │
│  - IAuditQueue (audit trail)        │
└───────────────┬─────────────────────┘
                │ EF Core (Kernel.Infrastructure)
                ▼
┌─────────────────────────────────────┐
│         Azure SQL Database          │
│  SecurityDB v2.3 (7 tables)        │
│  (CONNECTIONSTRINGS_SECURITYDB)     │
└─────────────────────────────────────┘
        ▲ Token Validation
        │
┌───────┴─────────────────────────────┐
│         Azure Entra ID              │
│  - Issues OAuth2 / OIDC tokens      │
│  - Hosts signing keys               │
│  - Tenant: AZUREAD_TENANT_ID        │
│  - PKCE flow via MSAL.js            │
└─────────────────────────────────────┘
```

---

## 7. Authentication Flow

The system uses **Azure Entra ID** as the identity provider with an OAuth2 Authorization Code + PKCE flow for the SPA, handled by `@azure/msal-browser` and `@azure/msal-react`.

```
1. User visits the React SPA
        │
        ▼
2. SPA detects unauthenticated session (MsalAuthProvider)
   → Redirects to:
     https://login.microsoftonline.com/{VITE_ENTRA_TENANT_ID}/oauth2/v2.0/authorize
     ?client_id={VITE_ENTRA_CLIENT_ID}
     &redirect_uri={VITE_ENTRA_REDIRECT_URI}
     &response_type=code
        │
        ▼
3. User authenticates with Azure AD (MFA, SSO, etc.)
        │
        ▼
4. Entra ID redirects back to VITE_ENTRA_REDIRECT_URI with auth code
        │
        ▼
5. MSAL.js exchanges code for Access Token + ID Token (PKCE)
   (Token contains: iss, aud, sub, tid, exp, roles/claims)
        │
        ▼
6. Axios interceptor attaches Access Token to every API request:
   Authorization: Bearer <token>
   (Token refresh handled silently by MSAL acquireTokenSilent)
        │
        ▼
7. .NET API receives request
   → Microsoft.Identity.Web validates token:
     ✓ Signature (via Entra OIDC keys)
     ✓ Issuer matches AZUREAD_TENANT_ID
     ✓ Audience matches AZUREAD_CLIENT_ID
     ✓ Token not expired (exp > now, 2-minute clock skew tolerance)
        │
        ▼
8. If valid → MediatR handler executes, IPermissionEvaluator checks authz,
   EF Core queries DB, IAuditQueue records action, response returned
   If invalid → 401 Unauthorized
```

---

## 8. API Request Lifecycle

```
1. React component triggers data fetch (React Query useQuery hook)
2. Axios interceptor acquires token via MSAL acquireTokenSilent
3. Axios attaches Authorization: Bearer <token> header
4. HTTP request reaches .NET API
5. ASP.NET Core authentication middleware validates JWT
6. [Authorize(Policy = PermissionCode.XxxYyy)] checks authorization
7. MediatR pipeline runs FluentValidation on the command/query
8. Handler executes business logic, calls IPermissionEvaluator if needed
9. EF Core queries Azure SQL (via CONNECTIONSTRINGS_SECURITYDB)
10. IAuditQueue enqueues audit entry (fire-and-forget via Channel<T>)
11. Result mapped to DTO (shared via @claas2saas/contracts)
12. ApiResponseFactory.Create(result) wraps response in standard envelope
13. JSON response returned to frontend
14. Zod validates response shape at the API boundary
15. React Query caches response, UI updates
```

---

## 9. Security Considerations

| Concern | Implementation |
|---|---|
| Token validation | `Microsoft.Identity.Web` validates signature, issuer, audience, expiry with 2-minute clock skew on every request |
| Authorization | `IPermissionEvaluator` evaluates RBAC permissions via policy-based `[Authorize(Policy = ...)]` attributes |
| Secret management | All secrets in Azure Key Vault accessed via Managed Identity — never in source code or `.env` files committed to git |
| Database encryption | `Encrypt=True;TrustServerCertificate=False` in connection string; TLS enforced |
| Frontend secrets | No secrets in `VITE_*` env vars — these are public at runtime; MSAL manages tokens |
| Token storage | MSAL manages token cache (session storage, not `localStorage` for refresh tokens per Microsoft guidance) |
| HTTPS | Enforced in production; Azure App Service / API Management terminates TLS |
| CORS | Configured in ASP.NET Core to allow only the specific Static Web Apps domain (no wildcard in production) |
| Token expiry | `SCC_JWT_EXPIRY_MINUTES=30` — short-lived tokens limit exposure window |
| Audit trail | `IAuditQueue` (Channel<T>) writes to append-only `audit_sessions` and `audit_action_logs` tables |
| SQL injection | All queries use EF Core LINQ or `FromSqlInterpolated` — no string concatenation with variables |
| XSS prevention | React's default HTML escaping; no `dangerouslySetInnerHTML`; CSP headers on Azure Static Web Apps |
| PII protection | No PII in log statements; correlation IDs and `security_user_pid` (integer) used for tracing |

---

## 10. Monorepo Structure

```
kernel/
├── apps/
│   ├── api/                          # .NET 10 API (Clean Architecture)
│   │   ├── Kernel.Domain/            # Entities, value objects, domain events (zero dependencies)
│   │   ├── Kernel.Application/       # MediatR handlers, validators, interfaces (IPermissionEvaluator, IAuditQueue)
│   │   ├── Kernel.Infrastructure/    # EF Core, repositories, background services, external clients
│   │   └── Kernel.API/              # Controllers, middleware, Program.cs (thin orchestration only)
│   └── web/                          # React + Vite SPA
│       └── src/
│           ├── api/                  # Typed Axios client functions
│           ├── components/           # Shared Fluent UI wrapper components
│           ├── contexts/             # AuthContext, PermissionContext, FeatureFlagContext
│           ├── features/             # Feature-cluster page components
│           ├── hooks/                # Custom hooks (usePermission, etc.)
│           ├── routes/               # ROUTE_MAP (frozen), RoutePermissionMap
│           ├── styles/               # Griffel makeStyles tokens
│           └── utils/                # Utility functions, Zod schemas
├── packages/
│   └── contracts/                    # Shared TypeScript types/DTOs (additive-only)
├── package.json                      # Monorepo root (npm workspaces, engine constraints)
├── global.json                       # .NET SDK version pin
└── .github/                          # Copilot instructions, agents, prompts
```

**npm workspaces** are used to manage the JS monorepo: `apps/web` and `packages/contracts` are declared as workspaces in the root `package.json`.

---

## 11. Configuration Environments

| Variable Group | Dev Value | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Points to local .NET API |
| `VITE_ENTRA_REDIRECT_URI` | `http://localhost:5173` | Vite default dev port |
| `VITE_AUTH_MODE` | `entra` | Switch to `local` or `test` if a mock auth mode exists |
| `VITE_TEST_TENANT_ID` | `<test_tenant>` | Separate tenant for automated testing |
| `SCC_JWT_EXPIRY_MINUTES` | `30` | Reduce for higher security, increase for dev convenience |
| Node runtime | 22.x LTS | Required by engine constraint `>=20.15.1 <23` |
| .NET SDK | 10.0.201 | Pinned in `global.json` with `latestPatch` roll-forward |

---

## 12. Upgrade History

### 2026-03-25 — Security Patch Alignment

All upgrades within the same major version lines. No breaking changes. Motivation: incorporate security patches (Axios, MSAL, Zod) and bug fixes across the frontend stack.

| Package | Previous | Current | Change Type |
|---|---|---|---|
| .NET SDK | 10.0.102 | 10.0.201 | Patch (SDK) |
| `react` / `react-dom` | ^18.2.0 | ^18.3.1 | Minor |
| `react-router-dom` | ^6.20.0 | ^6.30.3 | Minor |
| `vite` | ^5.0.0 | ^5.4.21 | Minor |
| `@vitejs/plugin-react` | (undocumented) | ^4.7.0 | Added to KB |
| `typescript` | ^5.3.0 | ^5.9.3 | Minor |
| `axios` | ^1.6.0 | ^1.13.6 | Minor (security) |
| `@fluentui/react-components` | ^9.46.0 | ^9.73.4 | Minor |
| `@fluentui/react-icons` | ^2.0.226 | ^2.0.322 | Patch |
| `@tanstack/react-query` | ^5.0.0 | ^5.95.2 | Minor |
| `@tanstack/react-query-devtools` | (undocumented) | ^5.95.2 | Added to KB |
| `@azure/msal-browser` | (undocumented) | ^3.30.0 | Added to KB (security) |
| `@azure/msal-react` | (undocumented) | ^2.2.0 | Added to KB |
| `zod` | ^3.22.0 | ^3.25.76 | Minor (security) |
| `tsup` | (undocumented) | ^8.5.1 | Added to KB |
| `eslint` | (undocumented) | ^8.57.1 | Added to KB |
| `prettier` | (undocumented) | ^3.8.1 | Added to KB |
| `vitest` | (undocumented) | ^1.6.1 | Added to KB |
| All testing libraries | (undocumented) | See Section 2 | Added to KB |
| Node engine | >=20.15.1 | >=20.15.1 <23 | Upper bound added |

**Backend .NET packages** (EF Core 9.0.3, Microsoft.Identity.Web 4.4.0, FluentValidation 11.3.1, Swashbuckle 10.1.4, JWT libraries 8.16.0) were verified as current and not changed during this upgrade cycle.

---

*Generated for KERNEL v0.1.0 — .NET SDK 10.0.201 · React 18.3 · Vite 5.4 · TypeScript 5.9 · Azure Entra ID · Node 22.x LTS*
