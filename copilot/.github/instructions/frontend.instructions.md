# ECC Frontend Instructions — React + TypeScript UI Layer

> **Scope:** This file applies only when Copilot is working within `src/ECC.UI/**`. It complements the workspace-wide instructions in `.github/copilot-instructions.md` with React and TypeScript specifics.
>
> **applyTo:** `src/ECC.UI/**`

---

## Purpose

This file ensures Copilot generates React components and TypeScript code that conform to ECC's frontend architecture — where the UI is a rendering layer that never makes authorization decisions, always delegates API calls to service modules, and renders only what the user's permission profile authorizes.

---

## Why This File Exists

The ECC frontend is not a typical React application. It is the user-facing surface of an enterprise authorization platform. The modules it renders, the actions it enables, and the data it displays are all governed by the permission profile that the ASP.NET Core API returns. A component that renders unauthorized content — even if hidden or disabled — is a security concern. A component that makes API calls directly without going through the service layer breaks the centralized error handling and token management that the architecture depends on. This file constrains Copilot to patterns that prevent both categories of error.

---

## MSAL Authentication Pattern

ECC uses `@azure/msal-react` for authentication. The `useMsalAuthentication` hook is the only permitted way to acquire tokens. This hook handles the full MSAL lifecycle: initial interactive login, silent token acquisition for subsequent requests, and automatic redirect when silent acquisition fails.

**Rule 1:** Use `useMsalAuthentication(InteractionType.Redirect)` in the application's root authentication wrapper. This establishes the MSAL session for all child components.

**Rule 2:** To acquire an access token for API calls, use `instance.acquireTokenSilent()` with the appropriate scopes defined in the MSAL configuration. If silent acquisition fails (e.g., the refresh token has expired), fall back to `instance.acquireTokenRedirect()`. Never catch the silent failure silently — the user must re-authenticate.

**Rule 3:** Never attach Bearer tokens manually to `fetch()` or `axios` requests in components. The service modules in `src/ECC.UI/services/` handle token acquisition and attachment. This ensures tokens are always current, scopes are always correct, and token refresh logic is centralized.

```typescript
// ✅ CORRECT — in a service module (src/ECC.UI/services/identityService.ts)
import { msalInstance } from '../auth/msalConfig';

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) throw new Error('No authenticated account');

  const response = await msalInstance.acquireTokenSilent({
    scopes: ['api://ecc-api/.default'],
    account: accounts[0],
  });

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${response.accessToken}`,
  };
};

export const getUserPermissionProfile = async (): Promise<PermissionProfile> => {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/identity/permission-profile', { headers });
  if (!response.ok) throw new ApiError(response.status, await response.json());
  return response.json();
};
```

```typescript
// ❌ WRONG — token acquisition in a component
const MyComponent = () => {
  const { instance } = useMsal();
  useEffect(() => {
    const token = await instance.acquireTokenSilent({...});
    fetch('/api/data', { headers: { Authorization: `Bearer ${token.accessToken}` } });
    // This bypasses the service layer and scatters token logic across components
  }, []);
};
```

---

## Service Module Call Pattern

All API communication goes through typed service modules in `src/ECC.UI/services/`. Components call service functions and handle the typed response — they never construct URLs, manage headers, or parse raw responses.

**Rule 4:** Every API endpoint accessed by the frontend has a corresponding function in a service module. The function name describes the operation (`getUserPermissionProfile`, `assignRole`, `getModuleList`), accepts typed parameters, and returns a typed promise.

**Rule 5:** Service modules handle HTTP errors by throwing a typed `ApiError` that components can catch and display. The error type carries the HTTP status code and the ECC standard error envelope, so the component can show a meaningful message.

**Rule 6:** Components call service functions in `useEffect` hooks (for data fetching on mount) or in event handlers (for user-initiated actions). The component manages loading, error, and success states using `useState`.

```typescript
// Component calling a service module
import { getUserPermissionProfile } from '../services/identityService';
import { PermissionProfile } from '../types/identity';

const ModuleDiscoveryDashboard: React.FC<ModuleDiscoveryDashboardProps> = () => {
  const [permissionProfile, setPermissionProfile] = useState<PermissionProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserPermissionProfile();
        setPermissionProfile(profile);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load permission profile');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!permissionProfile) return <AccessRequestPrompt />;

  return (
    <div className="module-dashboard">
      {permissionProfile.authorizedModules.map(module => (
        <ModuleCard key={module.moduleCode} module={module} />
      ))}
    </div>
  );
};
```

---

## Permission Profile Typing and Usage

The permission profile is the central data structure that drives the entire frontend rendering decision tree. It is returned by the ASP.NET Core API after evaluating the authenticated user's role assignments and is the frontend's single source of truth for what the user is allowed to see and do.

**Rule 7:** The permission profile interface is defined in `src/ECC.UI/types/identity.ts` and imported wherever needed. It is never redefined or approximated in individual components.

```typescript
// src/ECC.UI/types/identity.ts
export interface PermissionProfile {
  entraObjectId: string;
  displayName: string;
  authorizedModules: AuthorizedModule[];
}

export interface AuthorizedModule {
  solutionCode: string;
  moduleCode: string;
  moduleName: string;
  roleCode: string;
  roleName: string;
  permissions: ModulePermissions;
  moduleUrl: string;
}

export interface ModulePermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewAllUserData: boolean;
  hasFullModuleAccess: boolean;
  hasFullPlatformAccess: boolean;
}
```

**Rule 8:** Components receive the permission profile (or a relevant subset) as a typed prop — they do not fetch it themselves. The top-level dashboard component fetches the profile once and passes the relevant pieces down.

**Rule 9:** Permission checks in components use the boolean flags from `ModulePermissions`. Never check role names as strings (`if (role === 'Admin')`) — this couples the UI to role name strings that could change. The permission flags are the stable contract.

---

## Unauthorized Content Rendering — The Non-Rendering Rule

**Rule 10:** If a user is not authorized to access a module, that module's card, link, menu item, or any other UI representation must not exist in the rendered DOM. Do not hide it with CSS (`display: none`, `visibility: hidden`), do not render it in a disabled state, and do not render it with a lock icon. The correct behavior is to not render it at all.

This rule exists because ECC is an authorization platform. A user should not be able to inspect the DOM and discover modules they are not authorized to access. CSS-based hiding is not access control — it is a visual illusion that any browser developer tool can defeat.

```typescript
// ✅ CORRECT — only render authorized modules
{permissionProfile.authorizedModules.map(module => (
  <ModuleCard key={module.moduleCode} module={module} />
))}

// ❌ WRONG — rendering all modules and hiding unauthorized ones
{allModules.map(module => (
  <ModuleCard
    key={module.moduleCode}
    module={module}
    disabled={!isAuthorized(module)}  // Module exists in DOM even if unauthorized
    style={{ display: isAuthorized(module) ? 'block' : 'none' }}  // CSS hiding is not security
  />
))}
```

---

## useCallback and useMemo Patterns

**Rule 11:** Every function passed as a prop to a child component must be wrapped in `useCallback`. Without `useCallback`, the function is recreated on every render, causing the child to re-render unnecessarily. In the module discovery dashboard, which can render many module cards, this matters for performance.

```typescript
// ✅ CORRECT
const handleModuleClick = useCallback((moduleCode: string) => {
  navigateToModule(moduleCode);
}, [navigateToModule]);

return <ModuleCard onModuleClick={handleModuleClick} />;
```

**Rule 12:** Expensive computations (filtering, sorting, transforming large lists) must be wrapped in `useMemo` with appropriate dependency arrays.

```typescript
// ✅ CORRECT
const sortedModules = useMemo(
  () => permissionProfile.authorizedModules.sort((a, b) => a.moduleName.localeCompare(b.moduleName)),
  [permissionProfile.authorizedModules]
);
```

---

## TypeScript Interface Naming Conventions

**Rule 13:** Component props interfaces follow the pattern `[ComponentName]Props`. For example, `ModuleCardProps`, `ModuleDiscoveryDashboardProps`, `RoleAssignmentFormProps`.

**Rule 14:** All interfaces are defined with the `interface` keyword and exported as named exports. Never use `type` aliases for object shapes that could be interfaces — `interface` supports declaration merging and extension, which is important for a growing codebase.

**Rule 15:** Never use `any`. Never use inline object types for props. If you need a type that does not exist yet, define it in `src/ECC.UI/types/` and import it. The `any` type defeats TypeScript's type checker and causes Copilot to generate untyped, unreliable code.

---

## Loading and Error State Handling

**Rule 16:** Every component that depends on an async service call must handle three states: loading, error, and success. The loading state displays a consistent loading indicator (use the shared `<LoadingSpinner />` component). The error state displays a user-friendly message (use the shared `<ErrorDisplay />` component). The success state renders the component's primary content.

**Rule 17:** Never render partial or stale data while a service call is in flight. The loading state must completely replace the content area until the data is available. This prevents the user from interacting with incomplete data, which is especially important in an authorization context.

---

## Common Mistakes — What Not to Do

**Mistake 1:** Calling `fetch()` or `axios` directly in a component instead of using a service module. This scatters token management, error handling, and URL construction across the codebase.

**Mistake 2:** Using `any` for API response types. This makes the component ignore type errors that would catch bugs at compile time.

**Mistake 3:** Storing sensitive data (tokens, Object IDs) in React state or `localStorage`. The MSAL library manages token storage — components should never handle tokens directly.

**Mistake 4:** Using string comparison for role-based rendering decisions (`role === 'Admin'`). Use the boolean permission flags from `ModulePermissions` instead.

**Mistake 5:** Creating class components. The entire ECC frontend uses functional components with hooks. Class components are incompatible with the hook-based patterns and would create an inconsistent codebase.

---

## How This File Improves Copilot Output

When Copilot generates a React component within `src/ECC.UI/`, it now knows to import from service modules instead of using `fetch`, to type props with named interfaces, to handle all three async states, and to never render unauthorized content. These specific patterns eliminate the most common categories of frontend code review feedback and produce components that integrate correctly with ECC's authorization model on the first generation.
