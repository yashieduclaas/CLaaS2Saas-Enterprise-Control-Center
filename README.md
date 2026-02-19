# CLaaS2SaaS Security Kernel — Base Frozen Skeleton

> ⚠️ **This is the immutable platform foundation. Read [governance/PLATFORM_FREEZE.md](governance/PLATFORM_FREEZE.md) before making any structural changes.**

## Quick Start

### Prerequisites

- .NET 8 SDK
- Node.js 20+
- An Entra ID app registration (client ID + tenant ID)

---

### Backend

```bash
cd apps/api
dotnet build
```

Expected output: `Build succeeded.`

Configure your Entra credentials in `Kernel.API/appsettings.json` (or via env vars):

```json
{
  "Entra": {
    "Authority": "https://login.microsoftonline.com/{YOUR_TENANT_ID}/v2.0",
    "Audience": "{YOUR_CLIENT_ID}"
  }
}
```

```bash
dotnet run --project Kernel.API
```

Expected: `Now listening on: https://localhost:7000`  
Health check: `curl https://localhost:7000/health` → `Healthy`

---

### Frontend

```bash
cd apps/web
cp .env.example .env.local
# Edit .env.local with your Entra values
npm install
npm run dev
```

Expected: `VITE ready on http://localhost:3000`  
Expected in browser: Fluent UI NavRail + MSAL sign-in flow

---

## Architecture

```
/apps
  /api          — ASP.NET Core 8 Clean Architecture
    Kernel.Domain          — Value objects, exceptions (no deps)
    Kernel.Application     — IPermissionEvaluator seam, DTOs, policies
    Kernel.Infrastructure  — TenantMiddleware, StubPermissionEvaluator
    Kernel.API             — Program.cs, controllers

  /web          — React 18 + TypeScript strict + Fluent UI v9 + Griffel
    src/auth/              — MSAL PKCE (FROZEN)
    src/permissions/       — PermissionProvider (FROZEN)
    src/layout/            — AppLayout NavRail (FROZEN)
    src/routes/            — ROUTE_MAP (additive)
    src/components/        — Shared components
    src/pages/             — Page components

/packages
  /contracts    — @claas2saas/contracts — AUTHORITATIVE TYPE DEFINITIONS

/governance     — Platform freeze rules, ADRs
/docs           — Architecture documentation
```

## 🔒 Platform Freeze Rules

See [governance/PLATFORM_FREEZE.md](governance/PLATFORM_FREEZE.md).

**Summary:**
- Folder structure: **frozen**
- Auth pipeline order: **frozen**
- TenantMiddleware: **frozen**
- AppLayout: **frozen**
- PermissionProvider: **frozen**
- IPermissionEvaluator interface: **frozen**
- Feature pods: **additive only**

## Verification Checklist

After setup, verify:

- [ ] `dotnet build` exits 0
- [ ] `GET /health` returns 200
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] Browser shows NavRail
- [ ] Browser shows MSAL sign-in (if not already authenticated)
- [ ] No hardcoded colors in components (all from Fluent tokens)
