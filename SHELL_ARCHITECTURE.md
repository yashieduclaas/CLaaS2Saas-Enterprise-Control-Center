# CLaaS2SaaS Frontend Shell — Architecture

## File Tree (Key Additions)

```
apps/web/src/
├── rbac/
│   ├── PermissionProvider.tsx   # Permission abstraction
│   ├── usePermission.ts
│   ├── PermissionGuard.tsx
│   ├── types.ts
│   └── index.ts
├── demo/
│   ├── permissionMap.ts         # Static permissions per demo user
│   ├── rolesData.ts             # Static roles for Local mode
│   └── index.ts
├── routes/
│   ├── RoutePermissionMap.ts    # ROUTE_MAP — single source of truth
│   └── routeMap.ts              # Legacy (deprecated)
├── features/
│   └── roles/
│       ├── api/
│       │   ├── rolesApi.ts      # Data layer — swap for real API
│       │   └── useRolesQuery.ts
│       └── pages/
│           └── RoleManagementPage.tsx
└── app/
    └── NavRail.tsx              # Generated from ROUTE_MAP
```

## Architectural Seams

### 1. Permission Abstraction (`src/rbac/`)
- **PermissionProvider** — Supplies permissions via API or demo map
- **usePermission(code)** — Returns `boolean` when not loading
- **usePermissionContext** — `permissions`, `isLoading`, `error`, `refresh`
- NO role checks — permission-only

### 2. Data Access Layer (`features/roles/api/`)
- **rolesApi.listRoles()** — Async, returns `RoleDto[]`
- **useRolesQuery()** — React Query hook
- Demo mode: `isDemoDataMode()` → static data + delay
- Components never fetch directly

### 3. RoutePermissionMap (`routes/RoutePermissionMap.ts`)
- Strongly typed `ROUTE_MAP` array
- Each entry: `pageKey`, `path`, `label`, `icon`, `requiredPermission`, `group`, `showInNav`
- NavRail generated entirely from ROUTE_MAP

### 4. Demo Mode
- `VITE_DATA_MODE=Local` → `isDemoDataMode() === true`
- Uses `demo/permissionMap.ts` and `demo/rolesData.ts`
- Simulated delay via `DEMO_LOAD_DELAY_MS`
- Remove `/demo/` folder when wiring real backend

## Future Integration Points
- **MSAL** — Swap `DemoAuthProvider` with `EntraAuthShell`
- **React Query** — `useRolesQuery` already matches shape
- **PermissionGuard** — Add route-level guards as needed
- **Real API** — Replace `rolesApi.listRoles` implementation; keep interface
