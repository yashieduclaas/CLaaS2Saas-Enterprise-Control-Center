# ECC-Kernel Frontend Instructions — React + TypeScript UI Layer

> **Scope:** This file applies only when Copilot is working within `apps/web/**`. It complements the workspace-wide instructions in `.github/copilot-instructions.md` with React and TypeScript specifics.
>
> **applyTo:** `apps/web/**`
>
> **Tech Stack:** Refer to **KERNEL_TechStack_KnowledgeBase.md** for all technology and version details.

---

## Purpose

This file ensures Copilot generates React components that conform to ECC-Kernel's frontend architecture — where the UI is a rendering layer that never makes authorization decisions, all server state flows through React Query, all styling uses Griffel with Fluent UI tokens, and all permission gating uses the `usePermission` hook.

---

## Why This File Exists

ECC-Kernel's frontend is the user-facing surface of an enterprise authorization platform. The modules it renders, the actions it enables, and the data it displays are all governed by the permission profile that the API returns through `IPermissionEvaluator`. A component that renders unauthorized content — even if hidden — is a security concern. A component that manages its own API calls or token logic breaks the centralized patterns that the architecture depends on.

---

## Component Design Principles

All UI components use Fluent UI v9 (`@fluentui/react-components`). No custom component is built when a Fluent UI equivalent exists. Custom components are built only for domain-specific patterns (permission matrix table, role hierarchy visualisation). All custom components are compound components (not monolithic) and accept only typed props from `packages/contracts`. Components are pure functional — no class components. Side effects are isolated to custom hooks.

Every data-fetching component has three explicit states: loading (Fluent UI Skeleton), error (actionable error message with retry option), and success (data display). An empty state is distinct from an error state — it must display a contextual action (e.g., "No roles found. Assign a role to get started" with a primary button), never a generic "No data" label.

---

## Styling — Griffel and Fluent UI Tokens Only

All styling uses `makeStyles()` from `@griffel/react` with Fluent UI `tokens.*` for all values. No hardcoded hex colors, no pixel values, no alternative CSS-in-JS libraries. This is enforced by CI and pod validation.

```typescript
// ✅ CORRECT — Griffel with Fluent tokens
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
  },
  title: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
});
```

**Rule 1:** Never use inline styles with raw values (`style={{ padding: '16px' }}`). Never use CSS modules, Tailwind, styled-components, or any other styling approach. These are banned packages and cause immediate pod rejection.

---

## State Management — Four Quadrant Model

Server state (data from the API: user lists, role lists, audit logs) is managed exclusively by React Query `useQuery` hooks. No `useEffect` + `fetch` patterns are permitted. React Query's `staleTime` for permission queries is set to 5 minutes to match the backend cache TTL.

UI state (form fields, modal open/close, tab selection) uses `useState` or `useReducer` local to the component or custom hook.

Auth state (MSAL account, token claims, login status) is managed by `AuthContext` — a platform-owned context that feature pods must not modify.

Permission state (the current user's resolved permissions) is managed by `PermissionContext` and the `usePermission(PermissionCode.XxxYyy)` hook.

**Rule 2:** No global state libraries (Zustand, Redux, MobX, Jotai, Recoil) are permitted. These are banned. React Query handles server state, and React context handles the remaining state categories.

---

## MSAL Authentication Pattern

`MsalAuthProvider` is a frozen artifact — Copilot must not modify it. Token acquisition for API calls uses MSAL's `acquireTokenSilent` with automatic fallback to `acquireTokenPopup`. The acquired token is attached to every API request via an Axios interceptor configured in the `src/api/` client module. The SCC security context token received after authorization is passed to downstream module deep links as a query parameter or session storage value, never as a cookie (to avoid CSRF risk in cross-origin contexts).

**Rule 3:** Never attach Bearer tokens manually in components. The Axios interceptor in `src/api/` handles token acquisition and attachment centrally.

**Rule 4:** Never store raw JWT tokens in `localStorage`. MSAL manages token storage. Session storage is acceptable for short-lived values per Microsoft's MSAL guidance.

---

## API Client Pattern — Typed Axios Modules

All API communication goes through typed client functions in `src/api/`. The client is built on Axios with a base URL from the Vite environment configuration. API client functions return `Promise<ApiResponse<T>>` where `T` is a strongly-typed DTO from `packages/contracts`. Response validation at the boundary uses Zod schemas — if the API returns an unexpected shape, the Zod parse fails loudly in development.

```typescript
// src/api/usersApi.ts
import { apiClient } from './client';
import { UserDto, userDtoSchema } from '@claas2saas/contracts';

export const getUser = async (entraObjectId: string): Promise<UserDto> => {
  const response = await apiClient.get(`/api/v1/users/${entraObjectId}`);
  return userDtoSchema.parse(response.data.data); // Zod validates the shape
};
```

**Rule 5:** Components call API functions via React Query hooks, never directly. Service functions handle HTTP errors by throwing typed errors that React Query's error handling captures.

```typescript
// In a component — always use React Query, never useEffect + fetch
const { data: user, isLoading, error } = useQuery({
  queryKey: ['user', entraObjectId],
  queryFn: () => getUser(entraObjectId),
});
```

---

## Permission Gating — The usePermission Hook

The `usePermission(PermissionCode.XxxYyy)` hook is the only approved mechanism for gating UI elements based on permission. Never check role names as strings (`role === 'Admin'`). The `PermissionCode` enum lives in `packages/contracts` and is the shared contract with the backend.

```typescript
// ✅ CORRECT — permission gating via hook
const canAssignRoles = usePermission(PermissionCode.UserRoleAssignCreate);

return canAssignRoles ? <AssignRoleButton /> : null;
```

**Rule 6:** `PermissionGuard` wraps every route in `ROUTE_MAP` that requires a permission. It renders a Skeleton until `PermissionContext` has resolved. It must never render the route component and then unmount it after resolution — this prevents flashing unauthorized content.

---

## Unauthorized Content Rendering — The Non-Rendering Rule

**Rule 7:** If a user is not authorized to access a module, that module's card, link, menu item, or any other UI representation must not exist in the DOM. Do not hide with CSS, do not render disabled, do not show a lock icon. Render `null`. Feature-flagged components follow the same rule: when the flag is disabled, render `null`, not a placeholder.

---

## React Query Cache Invalidation

When a role assignment is created or revoked, the relevant permission query cache entries must be explicitly invalidated: `queryClient.invalidateQueries(['permissions', userId])`. This ensures the frontend reflects the updated permissions without waiting for the staleTime to expire.

---

## Routing Strategy

React Router v6 handles all SPA routing. All routes are defined in `ROUTE_MAP` (a frozen artifact — changes require ARR and Principal Architect sign-off). All route components are lazy-loaded with `React.lazy()` wrapped in `React.Suspense` with a Skeleton fallback. Routes are grouped by feature cluster: `/admin/users`, `/admin/roles`, `/admin/permissions`, `/admin/assignments`, `/admin/audit`, `/admin/registry`.

---

## Error Handling and Retry UX

Network errors display an inline Fluent UI `Alert` with a "Retry" button calling React Query `refetch()`. After three consecutive failures, the message escalates to suggest contacting support. `403 Forbidden` responses show a permission-denied state explaining which permission is missing and who can grant it. `401 Unauthorized` triggers MSAL silent token refresh; if that fails, redirect to Entra login. `400 Bad Request` surfaces field-level validation errors adjacent to the relevant form field.

---

## UX Consistency and Accessibility

Fluent UI v9 components are WCAG 2.1 AA compliant by default. The ECC-Kernel admin UI must not override any Fluent UI accessibility defaults (focus rings, ARIA labels, keyboard navigation). Data tables use Fluent UI `DataGrid` with sorting, filtering, and pagination. Tables with more than 100 rows use `@tanstack/react-virtual` for row virtualisation. All destructive actions require a confirmation dialog with the Fluent UI `Dialog` component — the Confirm button is styled as a danger variant with a specific action verb ("Deactivate Role", not "OK").

---

## TypeScript Interface Conventions

**Rule 8:** Component props use the pattern `[ComponentName]Props`. All interfaces use the `interface` keyword (not `type` aliases for object shapes). All interfaces are named exports.

**Rule 9:** Never use `any`. Never use inline object types for props. If a type does not exist yet, define it in `packages/contracts` or `src/types/` and import it.

---

## Feature Flag Integration

Azure App Configuration feature flags are read from `GET /api/v1/config/features` at startup. `FeatureFlagContext` makes flag values available throughout the component tree. Components gated behind a feature flag render `null` when disabled — not a disabled state or placeholder.

---

## Telemetry

Application Insights JavaScript SDK tracks page views automatically via router integration. Custom events track high-value actions: role assignment creation, user activation/deactivation, Golden Handshake initiation. Frontend errors in React error boundaries are captured as Application Insights exceptions with the component name as a custom dimension (sanitised to remove PII).

---

## Secure Coding Checklist

No `dangerouslySetInnerHTML` anywhere. No inline event handlers using `eval()` or `Function()`. No `console.log` with sensitive data in production builds (gate with `import.meta.env.PROD`). Content Security Policy headers are configured at the Azure Static Web Apps level. All external links use `rel="noopener noreferrer"`. DTOs from `packages/contracts` are validated by Zod at the API boundary before use in component state.

---

## Frontend Folder Structure

```
apps/web/
  src/
    api/              # Typed Axios API client functions
    components/       # Shared Fluent UI wrapper components
    contexts/         # AuthContext, PermissionContext, FeatureFlagContext
    features/         # Feature-cluster-organised page components
      authentication/
      users/
      roles/
      permissions/
      assignments/
      audit/
      registry/
    hooks/            # Custom React hooks (usePermission, useAuditLog, etc.)
    routes/           # ROUTE_MAP (FROZEN), RoutePermissionMap
    styles/           # Griffel makeStyles tokens (global design tokens)
    utils/            # Utility functions, Zod schemas
  public/
  index.html
  vite.config.ts
```
