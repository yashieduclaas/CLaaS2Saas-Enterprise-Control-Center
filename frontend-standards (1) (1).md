# CLaaS2SaaS Security Kernel — Frontend Engineering Standards

**Document ID:** DOC-C2S-FE-STANDARDS  
**Version:** 1.0 — Authoritative  
**Status:** APPROVED — All frontend code must comply  
**Supersedes:** Any prior informal frontend guidance  
**Architecture Bar:** Microsoft Entra Admin Center / Azure Portal / M365 Admin Center  
**Audience:** All engineers, AI code-generation agents, and code reviewers  
**Last Updated:** February 2026

---

> ⚠️ **THIS DOCUMENT IS LAW.**
> Any code that violates this standard is non-compliant and must not be merged. CI gates enforce the majority of these rules programmatically. Human reviewers enforce the remainder. AI agents generating code must treat every rule in this document as a hard constraint, not a suggestion.

---

## Table of Contents

- [Alignment With Repository Scaffold](#alignment-with-repository-scaffold)

1. [Frontend Architecture Principles](#1-frontend-architecture-principles)
2. [Technology Stack Rules](#2-technology-stack-rules)
3. [Griffel & Styling Law](#3-griffel--styling-law)
4. [Component Architecture Standards](#4-component-architecture-standards)
5. [State Management Model](#5-state-management-model)
6. [RBAC & Route Protection Rules](#6-rbac--route-protection-rules)
7. [MSAL & Authentication UX Rules](#7-msal--authentication-ux-rules)
8. [Accessibility & Fluent Compliance](#8-accessibility--fluent-compliance)
9. [Performance & Bundle Budget](#9-performance--bundle-budget)
10. [Linting & Enforcement Rules](#10-linting--enforcement-rules)
11. [Anti-Patterns — Explicit Ban List](#11-anti-patterns--explicit-ban-list)

---

## Alignment With Repository Scaffold

The frontend standards in this document operate exclusively within the frozen monorepo structure defined in the CLaaS2SaaS Scaffold Specification. The scaffold is authoritative. This document does not redefine ownership boundaries — it enforces behavior within them.

Critical alignment points:

- **Navigation ownership is fixed.** `AppLayout` owns the NavRail and shell layout. Feature pods must not attempt to control, override, or augment navigation state.
- **Contracts are single source of truth.** `RoutePermissionMap.ts`, `PermissionContext`, and `AuthContext` are the authoritative contracts. Duplication of their logic in feature code is a defect, not a pattern.
- **Feature pods must respect blast-radius limits.** A feature page may only modify files within its own `pages/[feature]/` directory. Cross-pod side effects require a Principal Engineer review.
- **Core providers are immutable by feature teams.** `PermissionProvider`, `AuthProvider`, `MsalAuthProvider`, and `MockAuthProvider` are platform-owned. Feature teams file issues; they do not submit patches to these files without platform-team sign-off.

Any conflict between this document and the scaffold specification must be resolved by a Principal Engineer. Do not resolve conflicts unilaterally in code.

---

## 1. Frontend Architecture Principles

### 1.1 The API Is the Only Security Boundary

The React UI is not a security control. It is a UX layer. Every permission check rendered in the UI is a user experience convenience that improves discoverability and reduces confusion. It provides zero security enforcement.

**All authorization decisions are made by `IPermissionEvaluator` on the API.** The API enforces named ASP.NET Core policies. Controllers do not check roles. The frontend does not check roles. No component is a security gate.

The implication: a technically capable user who bypasses all UI navigation and calls an API endpoint directly will receive a `403 Forbidden` if they lack the required permission. The UI gating being absent changes nothing. This must be true 100% of the time.

**Rule:** Every API endpoint that modifies or reads sensitive data is protected by an ASP.NET Core `[Authorize(Policy = "...")]` attribute mapped to a named `IPermissionEvaluator` policy. If this is not the case, the backend is non-compliant, and the frontend UI gate provides false security. Raise this as a severity-1 issue immediately.

### 1.2 Zero-Trust Mindset in the UI

- Never assume the user is who they claim to be beyond what the valid JWT claims (`oid`, `tid`) assert.
- Never trust URL parameters, query strings, or path segments as authorization input. They are routing only.
- Never render sensitive data before the permission check from `PermissionProvider` has resolved. Show a loading skeleton.
- Never embed authorization logic in URL construction, link visibility, or breadcrumb computation outside of the approved `RoutePermissionMap` pattern.

### 1.3 Multi-Tenant Awareness Is Non-Negotiable

Every user action operates within a tenant context. `tenantId` comes from the `tid` claim in the JWT. It is resolved server-side by `TenantMiddleware` before any business logic executes. The frontend must:

- Never allow a user to select, override, or inject a `tenantId` through any UI control unless the user is in a verified cross-tenant administrative role with explicit backend enforcement.
- Never display data from a query that does not include tenant scoping. React Query cache keys must include `tenantId` where applicable.
- Treat `tenantId` as a server-resolved fact, not a client-side parameter.

### 1.4 Entra Admin UX Quality Bar

The UI quality bar is Microsoft Entra Admin Center. This means:

- Loading states use Fluent skeleton loaders that match the exact layout of the data they replace.
- Empty states provide actionable guidance, not just a "no results" message.
- Error states distinguish between network failures, authorization failures, and data validation errors, and provide appropriate recovery actions.
- Destructive operations (delete, revoke, deactivate) require a confirmation dialog with explicit acknowledgment text, not just "Are you sure?".
- All admin operations provide immediate visual feedback (toast notification, inline status update, optimistic UI where safe).
- Navigation is breadcrumb-consistent. The active route is always reflected in both the URL and the nav rail.

### 1.5 Performance Is a First-Class Requirement

Sluggish admin tooling undermines trust. Performance expectations:

- Page interactions (clicks, filter changes) must feel instantaneous: under 100ms to visual response.
- Initial page loads must complete in under 2 seconds on a corporate network (LTE equivalent or better).
- Data tables with more than 100 rows must be virtualized. No exceptions.
- All chart rendering is lazy-loaded. Charts do not block page paint.
- Bundle size gates are enforced in CI. A performance regression that passes CI still requires a PR comment justification.

---

## 2. Technology Stack Rules

### 2.1 Approved Stack — Complete List

The following packages constitute the complete approved frontend stack. No package outside this list may be added to production code without a formal Architecture Review Board (ARB) decision documented in the ADR log.

| Package | Pinned Version | Purpose |
|---|---|---|
| `react` + `react-dom` | 18.2.x | Core framework. Concurrent features enabled. `StrictMode` in development. |
| `typescript` | 5.x | Strict mode. `noImplicitAny`. No `any` casts without `// TODO: [TICKET] reason` comment. |
| `vite` | 5.x | Build tool, dev server, HMR, code splitting. |
| `@fluentui/react-components` | 9.x | ALL UI components. No exceptions. |
| `@fluentui/react-icons` | Latest compatible | Fluent System Icons only. |
| `@griffel/react` | Latest compatible | PRIMARY styling system. `makeStyles()` is the only approved CSS authoring method. |
| `react-router-dom` | 6.x | SPA routing. All pages are `React.lazy()` + `Suspense`. |
| `@tanstack/react-query` | 5.x | All server state. Fetching, caching, invalidation. |
| `@tanstack/react-virtual` | Latest compatible | Virtualization for tables exceeding 100 rows. |
| `axios` | 1.x | HTTP client. Auth header interceptor only. No raw `fetch()` for API calls. |
| `@azure/msal-react` + `@azure/msal-browser` | Latest stable | Authentication. PKCE flow. |
| `zod` | 3.x | Runtime validation of all API responses. |
| `chart.js` + `react-chartjs-2` | 4.x / 5.x | Dashboard charts only. Registered per component. |
| `clsx` | 2.x | Conditional class composition for `className` props. |

### 2.2 TypeScript Configuration — Required Settings

The following `tsconfig.json` settings are mandatory and may not be relaxed:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

Using `// @ts-ignore` or `// @ts-expect-error` without a tracked ticket reference is a CI failure.

### 2.3 React 18 Usage Rules

- `StrictMode` is enabled in development. Never remove it to silence double-render warnings. Double-render warnings identify side effects that must be fixed.
- Use concurrent features (`useTransition`, `useDeferredValue`) when deferring non-critical UI updates in large lists. Do not use them speculatively.
- Never use `ReactDOM.render()`. Use `createRoot()`.
- `Suspense` wraps every `React.lazy()` page import. `PageSkeleton` is the fallback. Never use a plain spinner.

### 2.4 Explicitly Banned Packages

The following packages are banned. ESLint `no-restricted-imports` will fail the build.

| Banned Package | Reason |
|---|---|
| `@fortawesome/*` | Fluent System Icons only. Inconsistent with Fluent 2 design language. |
| `styled-components` | Griffel is the styling system. Runtime CSS injection is rejected. |
| `@emotion/*` | Same reason as styled-components. |
| `tailwindcss` | Arbitrary utility classes introduce styling drift and token violations. |
| `bootstrap` | Not Fluent. Prohibited. |
| `material-ui` / `@mui/*` | Not Fluent. Prohibited. |
| `zustand` | State model is four-quadrant. Global state libraries are banned for MVP. |
| `redux` / `@reduxjs/toolkit` | Same reason as zustand. |
| `jotai` / `recoil` | Same reason as zustand. |
| `lodash` | Use native ES2022+ alternatives. Tree-shaking risk. |
| `moment` | Use `date-fns` or native `Intl.DateTimeFormat`. |
| `jquery` | Prohibited in all contexts. |
| `react-query` (v3) | Tanstack Query v5 only. v3 API is incompatible. |

---

## 3. Griffel & Styling Law

### 3.1 Griffel Is the Only Styling Method

`makeStyles()` from `@griffel/react` is the sole approved method for writing CSS in this codebase. No other method produces styles for new components. Period.

Griffel generates deterministic atomic CSS class names at build time. It supports SSR with zero runtime injection penalty. It integrates natively with Fluent design tokens, enabling automatic high-contrast mode support, theme switching, and accessibility compliance by inheritance.

### 3.2 Required Pattern

Every component that requires custom styles beyond Fluent component defaults must follow this exact pattern:

```typescript
// ✅ REQUIRED: makeStyles at module level, outside component function
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  activeItem: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

export function MyComponent({ isActive }: { isActive: boolean }) {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.container, isActive && styles.activeItem)}>
      <span className={styles.title}>Label</span>
    </div>
  );
}
```

### 3.3 Token Usage — Mandatory Rules

#### Semantic Tokens First

Always use semantic tokens before reaching for raw tokens. Semantic tokens carry accessibility intent.

| Intent | Required Token |
|---|---|
| Primary text | `tokens.colorNeutralForeground1` |
| Secondary text | `tokens.colorNeutralForeground2` |
| Disabled text | `tokens.colorNeutralForegroundDisabled` |
| Page background | `tokens.colorNeutralBackground1` |
| Card background | `tokens.colorNeutralBackground2` |
| Brand action | `tokens.colorBrandBackground` |
| Danger / destructive | `tokens.colorStatusDangerBackground1` |
| Warning | `tokens.colorStatusWarningBackground1` |
| Success | `tokens.colorStatusSuccessBackground1` |
| Standard padding (M) | `tokens.spacingVerticalM` / `tokens.spacingHorizontalM` |
| Section padding (L) | `tokens.spacingVerticalL` / `tokens.spacingHorizontalL` |
| Compact padding (S) | `tokens.spacingVerticalS` / `tokens.spacingHorizontalS` |
| Body text size | `tokens.fontSizeBase300` |
| Heading text size | `tokens.fontSizeBase500` |
| Semibold weight | `tokens.fontWeightSemibold` |
| Bold weight | `tokens.fontWeightBold` |
| Standard radius | `tokens.borderRadiusMedium` |
| Focus outline | `tokens.strokeWidthThick` |

#### Raw Token Usage

Raw tokens (`tokens.colorPaletteBlueBorder2`, etc.) are permitted only when no semantic equivalent exists. Document the reason in a comment.

### 3.4 Explicit Styling Bans

The following are banned in all files under `src/`. ESLint enforces these. Any violation fails CI.

**Hardcoded colors — BANNED**
```typescript
// ❌ BANNED
const useStyles = makeStyles({
  item: { color: '#0078d4' },           // hardcoded hex
  danger: { backgroundColor: 'red' },  // named color
  faded: { opacity: 0.5, color: 'rgba(0,0,0,0.6)' }, // raw rgba
});

// ✅ REQUIRED
const useStyles = makeStyles({
  item: { color: tokens.colorBrandForeground1 },
  danger: { backgroundColor: tokens.colorStatusDangerBackground1 },
  faded: { color: tokens.colorNeutralForeground3 },
});
```

**Hardcoded spacing — BANNED**
```typescript
// ❌ BANNED
const useStyles = makeStyles({
  card: { padding: '16px', margin: '8px 0', gap: '1rem' },
});

// ✅ REQUIRED
const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalS,
    gap: tokens.spacingHorizontalM,
  },
});
```

**Inline style objects — BANNED**
```tsx
// ❌ BANNED — always
<div style={{ padding: '16px', color: 'blue' }} />
<div style={{ marginTop: tokens.spacingVerticalM }} />  // also banned, use makeStyles

// Exception: truly dynamic computed values that cannot be expressed as static tokens
// This is the ONLY permitted use of inline style:
<div style={{ width: `${computedWidth}px` }} />  // ← only with a code comment justifying it
```

**`makeStyles()` inside component function body — BANNED**
```typescript
// ❌ BANNED — recreated on every render, defeats Griffel's determinism
function MyComponent() {
  const useStyles = makeStyles({ ... }); // ← this runs on every render
  const styles = useStyles();
}

// ✅ REQUIRED — module-level
const useStyles = makeStyles({ ... });
function MyComponent() {
  const styles = useStyles();
}
```

**Arbitrary z-index — BANNED**
```typescript
// ❌ BANNED
const useStyles = makeStyles({ modal: { zIndex: 9999 } });

// ✅ REQUIRED — use Fluent z-index tokens
const useStyles = makeStyles({ modal: { zIndex: tokens.zIndexOverlay } });
```

**Global CSS — BANNED**
No `.css` files, `<style>` tags, or `document.head.appendChild` style injection in component code. The only permitted global CSS is in `src/index.css` for root-level resets, maintained exclusively by the platform team.

**CSS Modules — Escape Hatch Only**
CSS Modules (`.module.css`) are permitted only for overriding third-party component styles that cannot be reached via Griffel. Any use requires a comment explaining why Griffel could not address it.

### 3.5 `mergeClasses()` Is Required for Class Composition

When applying multiple Griffel class names conditionally, always use `mergeClasses()`. Never concatenate strings.

```typescript
// ❌ BANNED
className={`${styles.base} ${isActive ? styles.active : ''}`}

// ✅ REQUIRED
className={mergeClasses(styles.base, isActive && styles.active, hasError && styles.error)}
```

---

## 4. Component Architecture Standards

### 4.1 Folder Structure

```
src/
├── shell/                    # App shell, routing, providers
│   ├── AppLayout.tsx
│   ├── NavRail.tsx
│   ├── TopBar.tsx
│   ├── RoutePermissionMap.ts # ← SINGLE SOURCE OF TRUTH
│   ├── ProtectedRoute.tsx
│   └── PageSkeleton.tsx
├── auth/                     # Auth and permission providers
│   ├── AuthContext.tsx
│   ├── PermissionContext.tsx
│   ├── MockAuthProvider.tsx
│   └── MsalAuthProvider.tsx
├── pages/                    # One folder per route
│   ├── kernel-dashboard/
│   │   ├── KernelDashboardPage.tsx
│   │   ├── components/       # Page-local components
│   │   └── hooks/            # Page-local hooks
│   ├── role-management/
│   │   ├── RoleManagementPage.tsx
│   │   ├── components/
│   │   └── hooks/
│   └── ...
├── components/               # Shared reusable components
│   ├── DataGrid/
│   │   ├── DataGrid.tsx
│   │   ├── DataGrid.types.ts
│   │   └── index.ts
│   ├── ConfirmDialog/
│   ├── PageHeader/
│   ├── StatusBadge/
│   └── ...
├── hooks/                    # Shared hooks
│   ├── usePermission.ts
│   ├── useTenantId.ts
│   └── usePaginatedQuery.ts
├── api/                      # API client layer
│   ├── client.ts             # Axios instance + interceptors
│   ├── auth.api.ts
│   ├── roles.api.ts
│   ├── users.api.ts
│   └── ...
├── types/                    # Shared TypeScript types
│   ├── api.types.ts
│   ├── rbac.types.ts
│   └── ...
└── utils/                    # Pure utility functions
```

### 4.2 Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Page component file | `PascalCase + Page.tsx` | `RoleManagementPage.tsx` |
| Feature component | `PascalCase + .tsx` | `RoleCard.tsx` |
| Shared component | `PascalCase + .tsx` | `ConfirmDialog.tsx` |
| Custom hook | `camelCase + .ts`, prefix `use` | `useRoleList.ts` |
| API module | `camelCase + .api.ts` | `roles.api.ts` |
| Type file | `camelCase + .types.ts` | `rbac.types.ts` |
| Zod schema | `PascalCase + Schema` | `const RoleSchema = z.object(...)` |
| Context | `PascalCase + Context` | `PermissionContext` |
| Provider | `PascalCase + Provider` | `PermissionProvider` |

### 4.3 Page Components

Page components are the entry point for each route. They are lazy-loaded.

Rules:
- Page components are thin orchestrators. They fetch data (via React Query hooks), compose layout, and delegate to feature components.
- Page components do not contain business logic.
- Page components do not contain inline styles.
- Page components export a single default export.
- Page components receive no props. They use `useParams()` and `useSearchParams()` for route input.

```typescript
// ✅ Correct page component structure
import { Suspense } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { RoleList } from './components/RoleList';
import { useRoleListQuery } from './hooks/useRoleListQuery';

export default function RoleManagementPage() {
  const { data, isLoading, isError } = useRoleListQuery();

  return (
    <div className={useStyles().page}>
      <PageHeader
        title="Role Management"
        description="Define and manage security roles for this tenant."
      />
      <RoleList roles={data?.roles} isLoading={isLoading} isError={isError} />
    </div>
  );
}
```

### 4.4 Feature Components

Feature components implement the substantive UI logic for a page. They live in `pages/[feature]/components/`.

Rules:
- Feature components accept typed props. No `any` props.
- Feature components do not call React Query directly. They receive data via props or use page-scoped hooks.
- Feature components are responsible for their own loading states and error states using Fluent `Skeleton` and `MessageBar` components.
- Feature components must not know about routing. Navigation side effects go through `useNavigate()` passed as a callback or invoked in the page component.

### 4.5 Shared Components (`src/components/`)

Shared components are general-purpose building blocks used across multiple pages.

Rules:
- Shared components are fully typed. Props interfaces are co-located in the component file or a companion `.types.ts` file.
- Shared components do not access React Query or PermissionContext directly. They are presentation-first.
- Shared components export a named export and an `index.ts` barrel.
- Breaking changes to shared component APIs require a PR review with impact assessment.

### 4.6 Prop Typing Rules

```typescript
// ✅ All props typed explicitly — no implicit any
interface RoleCardProps {
  role: Role;
  onEdit: (roleId: string) => void;
  onDelete: (roleId: string) => void;
  isLoading?: boolean;
  className?: string;  // ← allow className passthrough for Fluent mergeClasses
}

// ❌ Banned
function Component(props: any) { ... }
function Component({ role, ...rest }: { role: Role; [key: string]: unknown }) { ... }
```

Children must be typed as `React.ReactNode`, never `any` or `JSX.Element`.

### 4.7 Layout Shell

`AppLayout` renders the persistent shell: `NavRail` on the left, `TopBar` at the top, and `<Outlet />` in the main content area. It is never re-mounted on route changes; only `<Outlet />` swaps.

`NavRail` builds its navigation items exclusively from `ROUTE_MAP` entries where `showInNav: true` and the current user has the `requiredPermission`. It does not maintain its own route definitions. It does not hard-code labels or icons.

`TopBar` renders the tenant name (from JWT `tid` resolved to display name), the signed-in user's display name, and the sign-out action.

### 4.7a NavRail Collapse Contract (Entra-Style)

The NavRail collapse behavior follows Microsoft Entra Admin Center conventions. These rules are enforced at design review and code review. Deviations require Principal Engineer approval.

**Required behaviors — non-negotiable:**

- **Collapsed rail shows icons only.** Labels are not visible in the collapsed state. No truncation, no tooltip as a label substitute in expanded state.
- **Tooltip is required on hover AND keyboard focus in collapsed state.** The tooltip text must exactly match the nav item label from `ROUTE_MAP`. Icon-only navigation without tooltips is an accessibility failure.
- **Keyboard navigation order is preserved identically in both collapsed and expanded states.** Collapse must not alter tab order or arrow-key traversal sequence.
- **Active route indicator is always visible.** In collapsed state, the active item must retain a visible active indicator (highlight bar or background fill using `tokens.colorBrandBackground` or equivalent Fluent semantic token). An icon alone with no active indicator is non-compliant.
- **Collapse state is owned exclusively by `AppLayout`.** No feature page, no feature component, and no hook outside of `AppLayout` and `NavRail` may read or write the collapse state.
- **Feature slices MUST NOT control navigation state.** A feature page that opens, closes, or modifies the NavRail is a defect. Feature code is blast-radius contained to its own `pages/[feature]/` directory.

```typescript
// ✅ Required — tooltip on collapsed nav item
<Tooltip
  content={route.label}
  relationship="label"
  positioning="after"
>
  <NavItem icon={<RouteIcon />} aria-current={isActive ? 'page' : undefined} />
</Tooltip>

// ❌ Banned — icon without tooltip in collapsed rail
<NavItem icon={<RouteIcon />} />
```

`aria-current="page"` is set on the active nav item in both collapsed and expanded states. This is an accessibility requirement, not a styling concern.



### 4.8 Data Grids

For any grid that may exceed 100 rows, `@tanstack/react-virtual` is mandatory. The virtualizer must be configured with an accurate `estimateSize` to prevent layout jitter.

Required grid behaviors:
- Column headers are sortable. Sort state stored in URL params (`useSearchParams`).
- Pagination controls use Fluent `Pagination` or manual page controls styled with Fluent tokens.
- Row selection state is local UI state (`useState`). It is never persisted to server state.
- Skeleton loaders match the column layout exactly, including column widths.
- Empty state renders a Fluent `EmptyState` pattern with actionable guidance.

### 4.9 Forms

All forms use controlled components. No uncontrolled form state.

```typescript
// ✅ Required pattern for forms
const [formValues, setFormValues] = useState<CreateRoleForm>({
  name: '',
  description: '',
  moduleId: '',
});

// Validation via zod at submit time — not on every keystroke
const handleSubmit = () => {
  const result = CreateRoleSchema.safeParse(formValues);
  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors);
    return;
  }
  createRoleMutation.mutate(result.data);
};
```

Use Fluent `Field`, `Input`, `Select`, `Textarea`, and `Combobox` components. No raw `<input>` or `<select>` elements.

All form fields have associated `<label>` elements via Fluent's `Field` wrapper. This is an accessibility requirement, not a suggestion.

---

## 5. State Management Model

### 5.1 The Four-Quadrant Model — Authoritative

This is the complete state model. No fifth category exists. If state does not fit one of these four quadrants, the design is wrong. Fix the design.

| Quadrant | Tool | Owns | Must NOT Own |
|---|---|---|---|
| **Server State** | `@tanstack/react-query` | API data: roles, users, assignments, audit logs, SCC stats, modules | Auth state, UI open/close, permission codes |
| **Auth State** | `AuthContext` | Token, user identity (`oid`, `tid`, `displayName`), `isAuthenticated`, `isLoading` | Server data, permission codes, UI state |
| **Permission State** | `PermissionContext` | `Set<string>` of permission codes, permissions loading flag | User identity, server data, UI state |
| **Ephemeral UI State** | `useState` / `useReducer` | Modal open/close, form values, active tab, accordion state, selection state | Anything from the server or auth system |

### 5.2 React Query Rules

**Cache keys must be deterministic and tenant-scoped where applicable:**

```typescript
// ✅ Correct cache key pattern
useQuery({
  queryKey: ['roles', 'list', { tenantId, page, pageSize, sortBy, sortDir }],
  queryFn: () => rolesApi.list({ page, pageSize, sortBy, sortDir }),
  staleTime: 2 * 60 * 1000,
});

// ❌ Banned — ambiguous cache key, not tenant-scoped
useQuery({ queryKey: ['roles'], queryFn: rolesApi.list });
```

**After mutations, invalidate — never manually sync:**

```typescript
// ✅ Correct post-mutation invalidation
const mutation = useMutation({
  mutationFn: rolesApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['roles', 'list'] });
    showSuccessToast('Role created successfully.');
  },
  onError: (error) => {
    showErrorToast(extractApiError(error));
  },
});

// ❌ Banned — manual local state sync instead of invalidation
const mutation = useMutation({
  mutationFn: rolesApi.create,
  onSuccess: (newRole) => {
    setRoles(prev => [...prev, newRole]); // ← never do this
  },
});
```

**Permissions query stale time must match backend cache TTL:**

```typescript
// Permission codes have a 5-minute stale time matching the backend Redis TTL
useQuery({
  queryKey: ['me', 'permissions'],
  queryFn: authApi.getMyPermissions,
  staleTime: 5 * 60 * 1000,
  enabled: isAuthenticated,
});
```

### 5.3 Global State Libraries Are Banned

Zustand, Redux, Jotai, Recoil, and MobX are prohibited. ESLint `no-restricted-imports` blocks these packages. The four-quadrant model covers all state requirements in this application. A request to add a global state library requires an ARB decision and a documented gap analysis proving the four-quadrant model is insufficient.

### 5.4 Context Usage Rules

Context is used only for the two approved providers: `AuthContext` and `PermissionContext`. Creating new context for sharing server data between components is banned. Pass data via props or co-locate the React Query hook.

---

## 6. RBAC & Route Protection Rules

### 6.1 The Foundational Rule

> **UI permission checks NEVER replace API authorization. They improve UX only.**

This statement appears here, in the codebase, and in every code review checklist. It is non-negotiable. A component that hides a button based on a permission check is not a security control. The API endpoint behind that button must independently enforce the same permission.

### 6.2 `RoutePermissionMap` Is the Authority

`src/shell/RoutePermissionMap.ts` is the single source of truth for:
- All application routes
- Required permission codes per route
- Navigation visibility
- Route labels and icons
- Breadcrumb computation

No route may exist outside `ROUTE_MAP`. No navigation item may be hard-coded. No breadcrumb may be computed from a source other than `ROUTE_MAP`.

```typescript
// src/shell/RoutePermissionMap.ts — canonical interface
export interface RouteDefinition {
  path: string;
  pageKey: string;
  label: string;
  icon: string;           // Fluent System Icon component name only
  navSection: NavSection;
  requiredPermission: string | null;  // null = public (login, forbidden pages)
  showInNav: boolean;
}
```

### 6.3 RoutePermissionMap Type Safety

`ROUTE_MAP` MUST be declared with `as const`. This is not optional. The `as const` assertion makes every route key and every property value a literal type, enabling the TypeScript compiler to catch invalid route references at build time rather than at runtime.

An exported `RouteKey` type derived from `ROUTE_MAP` is required. No component, hook, or utility function may reference a route using a raw string literal.

**Required pattern:**

```ts
export const ROUTE_MAP = {
  roleMgmt: {
    path: '/roles',
    label: 'Role Management',
    icon: 'ShieldKeyholeRegular',
    navSection: 'admin',
    requiredPermission: 'ROLE:READ',
    showInNav: true,
  },
  // ... all routes
} as const;

export type RouteKey = keyof typeof ROUTE_MAP;
```

**Why this matters for multi-AI reliability:**

In a multi-AI code generation environment, string literals drift. Two agents generating code against the same route may produce `'role-mgmt'` and `'roleMgmt'` and `'roles'` for the same conceptual route. When `RouteKey` is the only accepted type at all call sites, the TypeScript compiler rejects every invalid variant at `tsc --noEmit` time. The CI gate catches drift before it reaches review.

Stringly-typed route references are banned. The ESLint `no-restricted-syntax` rule prohibits string literals in any position that accepts `RouteKey`.

### 6.4 `ProtectedRoute` Pattern

Every authenticated route is wrapped by `ProtectedRoute`. This component reads from `PermissionContext` and redirects unauthorized users to `/forbidden`. It never renders children before the permission check resolves.

```typescript
// ✅ Required pattern — pseudo-code, not copy-paste implementation
function ProtectedRoute({ requiredPermission, children }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPermission, isLoading: permLoading } = usePermissionContext();

  if (authLoading || permLoading) {
    return <PageSkeleton />;  // Never render null; never render a raw spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
```

`ProtectedRoute` derives its `requiredPermission` from `ROUTE_MAP`. It does not accept hardcoded permission strings from the JSX call site:

```typescript
// ✅ Correct — permission derived from ROUTE_MAP
<ProtectedRoute routeKey="role-mgmt">
  <RoleManagementPage />
</ProtectedRoute>

// ❌ Banned — hardcoded permission bypasses ROUTE_MAP as authority
<ProtectedRoute requiredPermission="ROLE:READ">
  <RoleManagementPage />
</ProtectedRoute>
```

### 6.5 `usePermission()` Hook

The only approved way to check a permission in a component is `usePermission()`.

```typescript
// src/hooks/usePermission.ts
export function usePermission(code: string): boolean {
  const { hasPermission } = usePermissionContext();
  return hasPermission(code);
}

// Usage in a component
function RoleActions({ roleId }: { roleId: string }) {
  const canEdit = usePermission('ROLE:WRITE');
  const canDelete = usePermission('ROLE:DELETE');

  return (
    <div>
      {canEdit && <Button onClick={() => handleEdit(roleId)}>Edit</Button>}
      {canDelete && <Button appearance="subtle" onClick={() => handleDelete(roleId)}>Delete</Button>}
    </div>
  );
}
```

### 6.6 Navigation Visibility Rules

`NavRail` renders navigation items by iterating `ROUTE_MAP` and filtering on `showInNav: true` and the current user's permissions. The filter logic is:

```typescript
// Pseudo-code — NavRail item visibility
const visibleRoutes = ROUTE_MAP.filter(route =>
  route.showInNav &&
  (route.requiredPermission === null || hasPermission(route.requiredPermission))
);
```

A user who navigates to a route directly (deep link) and lacks the required permission is redirected to `/forbidden` by `ProtectedRoute`. Navigation visibility is UX convenience only; it is not a security mechanism.

### 6.7 Deep-Link Protection

Deep links are fully protected. A user who bookmarks `/roles` and opens it in a new tab without the `ROLE:READ` permission will be redirected to `/forbidden`. The `ProtectedRoute` guard runs on every render, not just on navigation events. Permissions are re-fetched from the server (via React Query) on each app load with a 5-minute stale time.

### 6.8 Permission Loading Contract (Authoritative)

> ⚠️ **This is a P0 security UX invariant. It is not cosmetic guidance.**

Permission-gated UI MUST NOT render while the `PermissionContext` is in a loading state. Rendering before permission resolution has completed risks an unauthorized UI flash — briefly showing actions, routes, or data that the user does not have access to. This is a known enterprise foot-gun and a defect in any compliant component.

**Required rules — no exceptions:**

- MUST NOT render permission-gated UI while `permLoading === true`.
- MUST render a `<PageSkeleton />` or equivalent Fluent skeleton during permission resolution. Skeletons are **required**, not recommended.
- MUST NOT optimistically assume permission success. The default state is unknown, not granted.
- MUST treat missing permission state (context not yet hydrated) as **unknown** — not as denied and not as granted.
- MUST treat a permission API error as a **deny**. An error response is never a pass-through.

**Required pattern — every component that gates on permissions:**

```ts
const { isLoading: permLoading } = usePermissionContext();

if (permLoading) {
  return <PageSkeleton />;
}
```

This guard is not optional. `ProtectedRoute` implements it at the route level, but any component that performs inline permission gating with `usePermission()` must also apply this guard if it is capable of rendering before the provider has resolved.

AI-generated components that omit this guard will produce nondeterministic access-control UX and will be rejected in code review.

### 6.9 What Is Prohibited

- Role name checks in components: `if (user.roles.includes('Admin'))` — BANNED.
- Permission checks outside `usePermission()`: reading `PermissionContext` directly in components — BANNED.
- Navigation bypasses: `window.location.href` assignment to bypass `react-router-dom` — BANNED.
- Conditional route registration based on permissions: Routes are always registered. Guards handle access.
- Rendering sensitive data before `permLoading` resolves — BANNED.

---

## 7. MSAL & Authentication UX Rules

### 7.1 `AuthProvider` Responsibilities

Two providers implement the `AuthContextValue` interface. The environment variable `VITE_AUTH_MODE` determines which is active. Switching auth mode requires zero component changes.

```typescript
export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthUser {
  userId: string;    // oid claim
  tenantId: string;  // tid claim
  displayName: string;
  email: string;
}
```

`MsalAuthProvider` wraps `useMsal()`, calls `acquireTokenSilent()` on every API request, and handles `InteractionRequiredAuthError` by calling `acquireTokenRedirect()`.

`MockAuthProvider` calls `POST /api/auth/mock-login` with a test email. It produces a JWT of identical claim shape to the production token. No component knows which provider is active.

### 7.2 MSAL Instance Rules

- The MSAL instance is created once in `main.tsx`. It is never recreated.
- Recreating the MSAL instance produces duplicate token cache entries and authentication loops.
- The MSAL instance is not stored in React state. It is a module-level singleton.

### 7.3 Token Storage Rules

- Never store access tokens in `localStorage`. `localStorage` is accessible to XSS payloads.
- MSAL's default is `sessionStorage`. Accept this default. Do not override it.
- Never read JWT token claims in application code (expiry, roles, etc.). Use `AuthContext.user` and `PermissionContext.permissions` exclusively.

### 7.4 Silent Token Acquisition

- Call `acquireTokenSilent()` before every API request via the Axios request interceptor.
- The interceptor catches `InteractionRequiredAuthError` and calls `acquireTokenRedirect()`.
- Never swallow `InteractionRequiredAuthError`. Swallowing it produces API calls with expired tokens and a broken UX with no explanation.
- Never implement a custom token expiry timer. MSAL handles silent refresh.

```typescript
// src/api/client.ts — required interceptor pattern
axiosInstance.interceptors.request.use(async (config) => {
  const token = await msalInstance
    .acquireTokenSilent({ scopes: [API_SCOPE] })
    .catch((error) => {
      if (error instanceof InteractionRequiredAuthError) {
        msalInstance.acquireTokenRedirect({ scopes: [API_SCOPE] });
      }
      throw error;
    });

  config.headers.Authorization = `Bearer ${token.accessToken}`;
  return config;
});
```

### 7.5 Logout Rules

Always call `msalInstance.logoutRedirect()` on logout. Do not simply clear local state. Clearing local state without the Entra logout leaves the Entra session active. Users can re-authenticate without MFA, which violates the security model.

### 7.6 Error Handling UX

| Scenario | Required UX |
|---|---|
| Silent token acquisition fails — interaction required | Redirect to Entra login immediately. Do not show an error page. |
| API returns `401 Unauthorized` | Show a full-page "Session expired" message with a "Sign in again" button. Redirect to login on button click. |
| API returns `403 Forbidden` | Navigate to `/forbidden`. Show the access denied page with the user's current tenant and a link to request access. |
| Network error on API call | Show a Fluent `MessageBar` with `intent="error"` inline in the affected component. Provide a retry action. Do not show a full-page error for non-critical failures. |
| MSAL login fails | Show a full-page error with diagnostic information (error code, correlation ID) and a support contact link. |

### 7.7 Session Expiration UX

When the Entra session expires during active use, the user will encounter `InteractionRequiredAuthError`. The interceptor triggers a redirect. Before redirecting, store the current URL in `sessionStorage` under the key `postLoginRedirect`. After successful re-authentication, read this key and navigate to the stored URL. Remove the key after use.

### 7.8 Common Pitfalls to Avoid

- **Never call `acquireTokenSilent()` in a component.** The Axios interceptor handles token injection. Components must never call MSAL directly.
- **Never use the implicit flow.** PKCE is the only approved grant type.
- **Never decode the JWT in client code.** Use the `AuthContext.user` object.
- **Never hardcode the client ID or tenant ID.** These come from `import.meta.env`.
- **Never initialize MSAL inside a component.** Module-level singleton only.

---

## 8. Accessibility & Fluent Compliance

### 8.1 Compliance Standard

This application must meet **WCAG 2.1 Level AA**. Fluent UI React v9 components comply with WCAG 2.1 AA when used correctly. Using non-Fluent elements or overriding Fluent's accessibility attributes will produce regressions that fail CI.

axe-core runs in CI on every build. Zero accessibility violations are tolerated. A new violation blocks the merge.

### 8.2 Keyboard Navigation

- Every interactive element is keyboard-reachable via Tab in logical document order.
- All custom interactive elements implement the correct ARIA role and keyboard event handlers (`Enter` for activation, `Space` for toggle, arrow keys for lists and menus).
- Fluent components handle keyboard interaction automatically. Never replace a Fluent interactive component with a `<div onClick>` handler.
- Modal dialogs trap focus. Use Fluent `Dialog`. Do not implement custom focus trapping.
- The nav rail is navigable via keyboard. Active item is announced via `aria-current="page"`.

```typescript
// ❌ BANNED — div with click handler, not keyboard accessible
<div onClick={handleDelete} className={styles.deleteButton}>Delete</div>

// ✅ REQUIRED — Fluent Button, accessible by default
<Button appearance="subtle" onClick={handleDelete}>Delete</Button>
```

### 8.3 Focus Management

- After a modal dialog closes, focus returns to the trigger element.
- After a navigation event, focus moves to the `<main>` landmark or the page heading (H1).
- After an async operation completes (form submit, delete), a live region announces the result.
- Never use `outline: none` or `outline: 0` without providing an equivalent visible focus indicator using Fluent focus tokens.

```typescript
// ❌ BANNED
const useStyles = makeStyles({
  button: { ':focus': { outline: 'none' } }, // removes focus ring, accessibility violation
});

// If custom focus styling is needed:
const useStyles = makeStyles({
  button: {
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
  },
});
```

### 8.4 High Contrast Support

Fluent design tokens include high-contrast values. Using Fluent tokens correctly produces automatic high-contrast support. Violations occur when:

- Hardcoded colors are used (they do not adapt to high-contrast mode).
- Backgrounds are set without the corresponding foreground token pair.
- Borders are invisible in high-contrast mode (use `tokens.colorNeutralStroke1`, not a hardcoded subtle gray).

Test high-contrast compliance by enabling "High Contrast Black" mode in Windows and verifying the application is fully usable.

### 8.5 ARIA Attribute Rules

- Never add ARIA roles to elements that already have implicit roles (`button`, `a`, `input`, etc.).
- `aria-label` is required on all icon-only buttons. The label describes the action, not the icon.
- `aria-describedby` links form fields to their validation error messages.
- `aria-live="polite"` regions announce non-critical updates (save success, filter applied).
- `aria-live="assertive"` is reserved for critical errors that require immediate attention. Do not use it for routine operations.
- `aria-expanded` is set on accordion triggers, dropdowns, and expandable nav items.
- `aria-current="page"` is set on the active nav item.

```typescript
// ✅ Required — icon-only button
<Button
  icon={<DeleteRegular />}
  aria-label={`Delete role ${role.name}`}
  appearance="subtle"
  onClick={() => handleDelete(role.id)}
/>

// ❌ Banned — no accessible label
<Button icon={<DeleteRegular />} onClick={() => handleDelete(role.id)} />
```

### 8.6 Semantic HTML

Use semantic HTML elements. Do not replace them with styled `<div>` elements.

| Semantic Element | When to Use |
|---|---|
| `<main>` | Primary content area — exactly one per page |
| `<nav>` | Navigation rail and breadcrumb navigation |
| `<header>` | Top bar |
| `<h1>` through `<h4>` | Page and section headings in logical hierarchy |
| `<table>` | Tabular data (via Fluent DataGrid, which renders `<table>` correctly) |
| `<form>` | Form containers with submit behavior |
| `<button>` | All interactive clickable elements (via Fluent Button) |

### 8.7 Fluent Motion Discipline

Fluent provides motion tokens. All animations and transitions must use Fluent motion tokens. No custom `animation` or `transition` CSS outside of Fluent tokens.

Respect the operating system's `prefers-reduced-motion` setting. Fluent handles this automatically for its components. Custom animations must include:

```typescript
const useStyles = makeStyles({
  animatedElement: {
    transition: `opacity ${tokens.durationNormal} ${tokens.curveEasyEase}`,
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});
```

---

## 9. Performance & Bundle Budget

### 9.1 Bundle Size Gates — Hard Limits

These limits are enforced as CI failures. A build that exceeds these limits will not merge.

| Bundle | Limit (gzipped) |
|---|---|
| Shell bundle (main entry point) | ≤ 100 KB |
| Any single page chunk | ≤ 200 KB |
| Total application (all chunks combined) | ≤ 1.5 MB |

### 9.2 Route-Based Code Splitting — Mandatory

Every page component is lazy-loaded via `React.lazy()`. No page chunk is included in the shell bundle.

```typescript
// ✅ Required — lazy loading in router definition
const RoleManagementPage = React.lazy(() => import('./pages/role-management/RoleManagementPage'));
const AuditLogsPage = React.lazy(() => import('./pages/audit-logs/AuditLogsPage'));

// All route definitions use Suspense with PageSkeleton
<Route
  path="/roles"
  element={
    <ProtectedRoute routeKey="role-mgmt">
      <Suspense fallback={<PageSkeleton />}>
        <RoleManagementPage />
      </Suspense>
    </ProtectedRoute>
  }
/>
```

### 9.3 Chart.js — Lazy Loading and Tree Shaking

Chart.js must be imported with named component registration only. Never import the entire Chart.js bundle.

```typescript
// ✅ Required — register only what is used
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ❌ BANNED — imports the entire Chart.js library
import Chart from 'chart.js';
import 'chart.js/auto';
```

Chart components are loaded in a `React.lazy()` import within the dashboard page. The chart bundle does not affect pages that do not render charts.

### 9.3a Chart.js Suspense Requirement

Chart.js dashboard components MUST be lazy-loaded and wrapped in a `<Suspense>` boundary. This is a bundle-ownership requirement, not a suggestion.

```typescript
// ✅ Required — lazy-loaded chart component with Suspense at dashboard/page level
const SccTrendChart = React.lazy(() => import('./components/SccTrendChart'));

export default function KernelDashboardPage() {
  return (
    <div className={styles.page}>
      <PageHeader title="Security Kernel Dashboard" />
      <Suspense fallback={<Skeleton />}>
        <SccTrendChart />
      </Suspense>
    </div>
  );
}
```

The `<Suspense>` boundary lives at the **dashboard or page level**, not inside the individual chart component. Placing Suspense boundaries inside chart components fragments fallback behavior and produces layout jitter. One Suspense boundary wraps all charts on a given page.

Rationale: Chart.js with registered scales is a substantial dependency. Without lazy loading and a Suspense boundary, chart code inflates the main bundle, degrading first paint for all users regardless of whether they visit the dashboard. The bundle size CI gate will catch violations, but the correct fix is architectural, not a bundle-size exemption.

### 9.4 Data Grid Virtualization

Tables with potentially more than 100 rows must use `@tanstack/react-virtual`. This is enforced at design time, not after performance complaints.

Thresholds:
- Audit logs: always virtualized (unbounded dataset).
- User list: virtualized (tenant may have thousands of users).
- Role list: pagination is sufficient (bounded by tenant role count, typically < 50).
- Assignment list: virtualized (user × role combinations).

```typescript
// ✅ Required pattern for virtualized grids
const parentRef = useRef<HTMLDivElement>(null);
const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,  // Match actual Fluent row height
  overscan: 5,
});
```

### 9.5 Memoization Discipline

Memoize selectively. Do not memoize everything.

**When to memoize:**
- `useMemo`: expensive computations (sorting, filtering large arrays) that run on every render.
- `useCallback`: callbacks passed to memoized child components to prevent their re-renders.
- `React.memo`: components that receive stable props but render in a high-frequency parent.

**When NOT to memoize:**
- Simple derived values that take < 1ms to compute.
- Components that render infrequently.
- As a default or habit — memoization has overhead and obscures bugs.

```typescript
// ✅ Correct memoization — filtering a large list
const filteredRoles = useMemo(
  () => roles.filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [roles, searchTerm]
);

// ❌ Incorrect — unnecessary memoization of a trivial value
const title = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
// Just write: const title = `${firstName} ${lastName}`;
```

### 9.5a Permission Evaluation Budget Awareness

The backend authorization layer operates under a defined SLO that the frontend must understand and align with.

**Backend authorization SLO (authoritative):**

| Path | P50 | P99 |
|---|---|---|
| Cache path (Redis) | < 1 ms | < 5 ms |
| Database path (cold) | — | < 50 ms |

**Frontend implications:**

Permission checks are cheap. The cache path dominates in production. The UI must be designed accordingly.

- Permission checks via `usePermission()` are safe to call frequently. Do not treat them as expensive operations that require call-site optimization.
- DO NOT implement client-side permission caching beyond what `PermissionProvider` already provides. Adding a second caching layer creates staleness risks with no latency benefit.
- DO NOT memoize permission decisions in components. `usePermission('ROLE:READ')` inside a component must not be wrapped in `useMemo`. The `PermissionContext` `Set<string>` lookup is already O(1).
- The UI must assume the cache-dominant path is the norm. Design for sub-5ms permission resolution. Treat the 50ms database path as a cold-start edge case, not a baseline.

These rules exist to prevent defensive over-engineering — caching on top of a cache, memoizing a hash set lookup — that adds complexity without benefit and risks serving stale authorization decisions.

### 9.6 Fluent UI Tree Shaking

Import Fluent components individually:

```typescript
// ✅ Required — named imports, tree-shakeable
import { Button, DataGrid, Input } from '@fluentui/react-components';

// ❌ Banned — barrel import defeats tree shaking
import * as FluentUI from '@fluentui/react-components';
```

Confirm tree shaking is active in `vite.config.ts`. The bundle visualizer output is reviewed in each PR that adds new Fluent components.

### 9.7 Performance Red Flags

The following patterns are immediate code review flags:

- A component that renders a list of more than 100 items without virtualization.
- A `useEffect` that calls a React Query `refetch()` on a timer — use `refetchInterval` on the query instead.
- A React Query `staleTime` of `0` on a non-real-time resource — this causes a waterfall of unnecessary fetches.
- A component that subscribes to React Query data it does not need — lift queries to the lowest common ancestor and pass data via props.
- A `makeStyles()` call inside a component function body.
- An Axios call outside of the React Query layer.

---

## 10. Linting & Enforcement Rules

### 10.1 ESLint Configuration — Required Rules

The following ESLint rules are mandatory. The configuration lives in `.eslintrc.cjs` at the repository root. These rules must not be overridden in nested configs.

```javascript
// .eslintrc.cjs — required rules (abbreviated, see full config in repo)
module.exports = {
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    '@typescript-eslint/no-unused-vars': 'error',

    // Forbidden imports — state libraries
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['zustand', 'zustand/*'], message: 'Global state is banned. Use React Query or Context.' },
        { group: ['redux', '@reduxjs/*', 'react-redux'], message: 'Redux is banned.' },
        { group: ['jotai', 'recoil'], message: 'Atomic state libraries are banned.' },
        { group: ['@fortawesome/*'], message: 'FontAwesome is banned. Use @fluentui/react-icons.' },
        { group: ['styled-components', '@emotion/*'], message: 'CSS-in-JS runtime libs banned. Use Griffel.' },
        { group: ['tailwindcss'], message: 'Tailwind is banned.' },
        { group: ['lodash', 'lodash/*'], message: 'Lodash is banned. Use native ES2022+.' },
      ],
    }],

    // React
    'react/no-danger': 'error',
    'react/jsx-no-target-blank': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Accessibility
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
  },
};
```

### 10.2 Custom ESLint Rules — Required

The following custom ESLint rules must be implemented and enforced:

**`no-hardcoded-colors`** — Fails on any CSS property value in `makeStyles()` that matches a hex color, `rgb()`, `rgba()`, `hsl()`, or a CSS named color string.

**`no-inline-styles`** — Fails on any `style={{}}` prop except where preceded by `// style: dynamic-only` comment.

**`no-makestyles-in-component`** — Detects `makeStyles()` calls inside function component bodies and fails.

**`require-permission-context`** — Fails if `PermissionContext` is imported directly in any file outside `src/hooks/usePermission.ts`. All permission checks must go through the `usePermission()` hook.

**`no-direct-fetch`** — Fails on any use of `window.fetch` or the global `fetch()`. All HTTP calls use the Axios client.

### 10.3 Griffel Token Enforcement

An additional ESLint rule scans `makeStyles()` calls for the following violations:

- Any numeric pixel/rem value in a spacing, sizing, or font-size property.
- Any color value that is not a `tokens.*` reference.
- Any `zIndex` value that is not a `tokens.zIndex*` reference.

### 10.4 CI Pipeline Gates

Every pull request must pass the following gates before merge is permitted:

| Gate | Tool | Failure Condition |
|---|---|---|
| TypeScript compilation | `tsc --noEmit` | Any type error |
| ESLint | `eslint src/**` | Any error-level violation |
| Unit tests | Vitest | Any test failure or coverage < 80% on RBAC-related modules |
| Accessibility audit | axe-core (CI mode) | Any WCAG 2.1 AA violation |
| Bundle size | vite-bundle-analyzer | Shell > 100KB gzipped OR any page chunk > 200KB gzipped |
| RoutePermissionMap drift | Custom CI script | Any route in router not present in ROUTE_MAP, or any ROUTE_MAP entry with no corresponding page component |
| Dependency audit | `npm audit` | Any critical or high severity vulnerability |

### 10.5 `RoutePermissionMap` Drift Detection

The CI script validates:
1. Every `path` in `ROUTE_MAP` has a corresponding `React.lazy()` import in the router.
2. Every `React.lazy()` import in the router corresponds to a `ROUTE_MAP` entry.
3. Every `requiredPermission` value in `ROUTE_MAP` exists in the backend's `PermissionCode` enum (validated against the published OpenAPI spec).
4. Every Fluent icon name in `ROUTE_MAP.icon` resolves to a real export from `@fluentui/react-icons`.

A mismatch in any of the above is a CI failure.

### 10.5a Future Enhancement — Permission Drift Detection

> **Priority: MMP phase. Not required for MVP. High value at scale.**

At MVP, `ROUTE_MAP.requiredPermission` values are validated against the backend `PermissionCode` enum via the published OpenAPI spec (see §10.5 rule 3). This catches UI-side orphans but does not detect API-side drift — backend policies that exist in `[Authorize(Policy)]` attributes but have no corresponding frontend gate, or frontend permissions that no longer correspond to any API policy.

At MMP scale, a dedicated CI rule will cross-reference both surfaces:

- Parse every `ROUTE_MAP.requiredPermission` value from the frontend source.
- Parse every `[Authorize(Policy = "...")]` attribute value from the backend source.
- **Flag orphaned frontend permissions:** permissions declared in `ROUTE_MAP` with no matching backend `[Authorize(Policy)]`. These represent UI gates with no API enforcement to back them.
- **Flag unused API policies:** backend policies that exist in `[Authorize(Policy)]` attributes with no corresponding `ROUTE_MAP.requiredPermission`. These may indicate missing frontend gates or deprecated policies that should be removed.

This rule does not block MVP development. It is designed for the scale at which manual audit of the permission surface becomes impractical. Engineering leads should track this as a planned addition to the CI pipeline at MMP milestone.



Pre-commit hooks run `eslint --fix` on staged files and `tsc --noEmit`. A failing pre-commit hook prevents the commit. Do not use `git commit --no-verify` on the main or develop branches.

---

## 11. Anti-Patterns — Explicit Ban List

This section is the definitive list of what NOT to do. Every item here has been observed, has a real failure mode, and is enforceable.

### 11.1 Security Anti-Patterns

**BANNED: Role name check in a component**
```typescript
// ❌ BANNED — role names are not a security model
if (user.roles?.includes('Global Admin')) { ... }
if (authUser.email?.endsWith('@contoso.com')) { ... }
```
Why banned: Role names are display labels. They are not the permission model. `hasPermission('ROLE:WRITE')` is the correct check. Role name checks silently break when roles are renamed or reorganized.

**BANNED: Hardcoded tenant ID**
```typescript
// ❌ BANNED
if (user.tenantId === '00000000-0000-0000-0000-000000000001') { ... }
```
Why banned: Hardcoded tenant IDs create invisible multi-tenant privilege escalation risks.

**BANNED: `PermissionContext` access outside `usePermission()`**
```typescript
// ❌ BANNED
import { usePermissionContext } from '@/auth/PermissionContext';
const { permissions } = usePermissionContext();
if (permissions.has('ROLE:DELETE')) { ... }
```
Why banned: The `usePermission()` hook is the only approved access point, providing a consistent interception layer for future enhancements (audit, debug overlay, etc.).

**BANNED: Client-side token decoding for authorization**
```typescript
// ❌ BANNED
import { jwtDecode } from 'jwt-decode';
const claims = jwtDecode(token);
if (claims.roles?.includes('Admin')) { ... }
```
Why banned: JWT signature is not verified client-side. Decoded claims cannot be trusted for security decisions.

### 11.2 State Management Anti-Patterns

**BANNED: Manual server state duplication**
```typescript
// ❌ BANNED — duplicating React Query data into local state
const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list });
const [localRoles, setLocalRoles] = useState(roles);  // ← never do this
```
Why banned: Creates two sources of truth that diverge after mutations and cache invalidation.

**BANNED: Post-mutation local state synchronization**
```typescript
// ❌ BANNED
onSuccess: (newRole) => {
  setRoles(prev => [...prev, newRole]);
}

// ✅ REQUIRED
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['roles', 'list'] });
}
```

**BANNED: Storing derived data in state**
```typescript
// ❌ BANNED
const [filteredRoles, setFilteredRoles] = useState([]);
useEffect(() => {
  setFilteredRoles(roles.filter(r => r.name.includes(search)));
}, [roles, search]);

// ✅ REQUIRED
const filteredRoles = useMemo(
  () => roles?.filter(r => r.name.includes(search)) ?? [],
  [roles, search]
);
```

### 11.3 Styling Anti-Patterns

**BANNED: Any hardcoded color in makeStyles**
```typescript
// ❌ BANNED
makeStyles({ item: { color: '#0078d4', background: '#f3f3f3' } })
```

**BANNED: Any hardcoded pixel/rem spacing in makeStyles**
```typescript
// ❌ BANNED
makeStyles({ card: { padding: '16px', gap: '8px', marginTop: '24px' } })
```

**BANNED: Inline style objects**
```typescript
// ❌ BANNED in all but explicitly documented dynamic cases
<div style={{ padding: '16px' }} />
<span style={{ color: tokens.colorBrandForeground1 }} />  // ← also banned, use makeStyles
```

**BANNED: makeStyles inside component body**
```typescript
// ❌ BANNED — runs on every render
function Component() {
  const useStyles = makeStyles({ ... });  // ← definition inside component
  const styles = useStyles();
}
```

**BANNED: FontAwesome or any non-Fluent icon**
```typescript
// ❌ BANNED
import { FaUser } from 'react-icons/fa';
import { UserIcon } from '@heroicons/react/outline';

// ✅ REQUIRED
import { PersonRegular, PersonFilled } from '@fluentui/react-icons';
```

### 11.4 Component Anti-Patterns

**BANNED: Raw `<div onClick>` for interactive elements**
```typescript
// ❌ BANNED — not keyboard accessible, no ARIA role
<div onClick={handleClick} className={styles.button}>Click me</div>

// ✅ REQUIRED
<Button onClick={handleClick}>Click me</Button>
```

**BANNED: Raw `<input>` or `<select>` elements**
```typescript
// ❌ BANNED
<input type="text" onChange={handleChange} />

// ✅ REQUIRED
<Input onChange={(_, data) => handleChange(data.value)} />
```

**BANNED: Removing focus rings**
```typescript
// ❌ BANNED — accessibility violation
makeStyles({ button: { ':focus': { outline: 'none' } } })
```

**BANNED: Non-lazy page imports**
```typescript
// ❌ BANNED — page included in shell bundle
import RoleManagementPage from './pages/role-management/RoleManagementPage';

// ✅ REQUIRED
const RoleManagementPage = React.lazy(() => import('./pages/role-management/RoleManagementPage'));
```

### 11.5 API & Data Fetching Anti-Patterns

**BANNED: `fetch()` or `XMLHttpRequest` in components**
```typescript
// ❌ BANNED
useEffect(() => {
  fetch('/api/roles')
    .then(r => r.json())
    .then(setRoles);
}, []);
```

**BANNED: Axios calls outside React Query**
```typescript
// ❌ BANNED — untracked fetch, no caching, no error handling, no loading state
const handleLoad = async () => {
  const response = await axiosClient.get('/api/roles');
  setRoles(response.data);
};
```

**BANNED: API response used without Zod validation**
```typescript
// ❌ BANNED
const { data } = useQuery({ queryFn: () => rolesApi.list() });
const role = data[0];  // ← unvalidated shape

// ✅ REQUIRED
const { data } = useQuery({
  queryFn: async () => {
    const response = await axiosClient.get('/api/roles');
    return RoleListResponseSchema.parse(response.data);  // ← validate
  },
});
```

### 11.6 Navigation Anti-Patterns

**BANNED: `window.location.href` assignment for in-app navigation**
```typescript
// ❌ BANNED
window.location.href = '/roles';

// ✅ REQUIRED
const navigate = useNavigate();
navigate('/roles');
```

**BANNED: Hardcoded route paths in components**
```typescript
// ❌ BANNED
navigate('/roles/123/edit');

// ✅ REQUIRED — use path builder or route constant from ROUTE_MAP
navigate(buildPath('role-edit', { roleId: '123' }));
```

**BANNED: Navigation that bypasses ProtectedRoute**
```typescript
// ❌ BANNED — any mechanism that renders a page component without
// going through the ProtectedRoute wrapper in the router definition
```

---

## Appendix A — Quick Reference Card

| Rule | Correct | Banned |
|---|---|---|
| Styling | `makeStyles()` + `tokens.*` | Inline styles, hardcoded hex, Tailwind |
| Icons | `@fluentui/react-icons` | FontAwesome, Heroicons, Material Icons |
| Server state | React Query | `useState` + `useEffect` + `fetch` |
| Global state | Not needed | Zustand, Redux, Jotai |
| Permission check | `usePermission('CODE')` | Role name checks, context access |
| Route protection | `ProtectedRoute` from `ROUTE_MAP` | Manual route guards, unprotected pages |
| HTTP client | Axios via React Query | Raw `fetch()`, XHR |
| Authentication | `useAuth()` hook | Direct MSAL calls in components |
| Token storage | MSAL sessionStorage default | localStorage |
| Form inputs | Fluent `Input`, `Field`, `Select` | Raw HTML `<input>`, `<select>` |
| Interactive elements | Fluent `Button`, `Link` | `<div onClick>` |
| Charts | Chart.js (named imports only) | Any other charting library |
| TypeScript | Strict, no `any` | `any`, `// @ts-ignore` |

---

## Appendix B — Fluent Token Quick Reference

| Category | Token Pattern | Example |
|---|---|---|
| Brand foreground | `tokens.colorBrandForeground1` | Primary action text |
| Brand background | `tokens.colorBrandBackground` | Primary button fill |
| Neutral foreground | `tokens.colorNeutralForeground1` | Body text |
| Neutral background 1 | `tokens.colorNeutralBackground1` | Page background |
| Neutral background 2 | `tokens.colorNeutralBackground2` | Card background |
| Neutral stroke | `tokens.colorNeutralStroke1` | Borders |
| Status danger | `tokens.colorStatusDangerBackground1` | Error states |
| Status warning | `tokens.colorStatusWarningBackground1` | Warning states |
| Status success | `tokens.colorStatusSuccessBackground1` | Success states |
| Spacing XS | `tokens.spacingVerticalXS` | 4px equivalent |
| Spacing S | `tokens.spacingVerticalS` | 8px equivalent |
| Spacing M | `tokens.spacingVerticalM` | 12px equivalent |
| Spacing L | `tokens.spacingVerticalL` | 16px equivalent |
| Spacing XL | `tokens.spacingVerticalXL` | 20px equivalent |
| Font size base 200 | `tokens.fontSizeBase200` | 12px equivalent (small labels) |
| Font size base 300 | `tokens.fontSizeBase300` | 14px equivalent (body) |
| Font size base 400 | `tokens.fontSizeBase400` | 16px equivalent (subheading) |
| Font size base 500 | `tokens.fontSizeBase500` | 20px equivalent (heading) |
| Font weight regular | `tokens.fontWeightRegular` | Normal |
| Font weight semibold | `tokens.fontWeightSemibold` | Headings, labels |
| Border radius small | `tokens.borderRadiusSmall` | Inline elements |
| Border radius medium | `tokens.borderRadiusMedium` | Cards, inputs |
| Border radius large | `tokens.borderRadiusLarge` | Panels |
| Z-index popup | `tokens.zIndexPopup` | Tooltips, dropdowns |
| Z-index overlay | `tokens.zIndexOverlay` | Modal backdrop |
| Z-index modal | `tokens.zIndexModal` | Modal dialog |

---

*This document is maintained by the CLaaS2SaaS Platform Engineering team. Changes require a pull request to the `docs/` directory with a Principal Engineer review. Version history is tracked in Git.*
