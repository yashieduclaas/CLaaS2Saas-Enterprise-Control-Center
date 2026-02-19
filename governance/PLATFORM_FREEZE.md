# 🔒 Platform Freeze Rules

> **This document is non-negotiable. Violations require revert and architecture board review.**

## Frozen Artifacts

The following are immutable. Changes require explicit Principal Architect sign-off:

| Artifact | Location | Reason |
|---|---|---|
| Folder structure | `/apps`, `/packages`, `/governance`, `/docs` | All tooling and CI pipelines are anchored to this layout |
| Authentication pipeline | `Program.cs` → `UseAuthentication → TenantMiddleware → UseAuthorization` | Reordering breaks multi-tenant security guarantees |
| `TenantMiddleware` | `Kernel.Infrastructure/Middleware/TenantMiddleware.cs` | Tenant resolution contract must be stable |
| `IPermissionEvaluator` interface | `Kernel.Application/Abstractions/IPermissionEvaluator.cs` | All authorization flows through this seam |
| `AppLayout` | `apps/web/src/layout/AppLayout.tsx` | Navigation is platform-owned |
| `PermissionProvider` | `apps/web/src/permissions/PermissionProvider.tsx` | Permission loading contract must be stable |
| `AuthProvider` | `apps/web/src/auth/AuthProvider.tsx` | MSAL is platform-owned |
| `ROUTE_MAP` structure | `apps/web/src/routes/routeMap.ts` | Keys are referenced from navigation and permission guards |
| `@claas2saas/contracts` | `packages/contracts/` | Single source of truth for all type contracts |

## Additive-Only Rule

Feature pods operate in **additive-only** mode:

- ✅ Add new routes to `ROUTE_MAP`
- ✅ Add new permission constants to `Permissions`
- ✅ Add new policies via `AddPermissionPolicy` in `Program.cs`
- ✅ Add new contracts to `/packages/contracts/`
- ✅ Add new controllers following the `TenantsController` template
- ❌ Modify existing constants, interfaces, or middleware
- ❌ Bypass `IPermissionEvaluator` for authorization
- ❌ Create parallel MSAL instances
- ❌ Fetch permissions outside `PermissionProvider`
