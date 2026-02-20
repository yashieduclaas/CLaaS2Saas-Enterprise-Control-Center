# CLaaS2SaaS Security Kernel — Coding Constitution

`/governance/coding-constitution.md` — Authoritative Engineering Law

**Version 1.0** | **Status: APPROVED — LAW, NOT GUIDANCE** | February 2026

**Architecture Bar:** Microsoft Entra Admin Center / Azure Portal / M365 Admin Center

**Author:** Principal Software Engineer | **Audience:** All engineers and AI code-generation agents

> ⚠ **THIS DOCUMENT IS LAW.** Any code that violates these rules is non-compliant and MUST NOT be merged. CI gates enforce the majority programmatically. Human reviewers enforce the remainder. AI agents treat every rule as a hard constraint, not a suggestion.

---

# Section 1 — Constitutional Principles (Non-Negotiable)
These are platform invariants. Every engineering decision must be evaluated against them. Violations are defects, not disagreements.


## 1.1  The API Is the Only Security Boundary
⚖ LAW: Every access control decision is enforced by IPermissionEvaluator on the API. The React UI is a UX layer. A component that hides a button is not a security control.
The implication is absolute: a technically capable user who bypasses all UI navigation and calls an API endpoint directly receives a 403 Forbidden if they lack the required permission. UI gating being absent changes nothing. Any API endpoint that modifies or reads sensitive data and lacks [Authorize(Policy="...")] is a severity-1 security defect. Raise it immediately.


## 1.2  Contracts Are the Single Source of Truth
⚖ LAW: /packages/contracts is the canonical definition of all cross-layer types, permission codes, route shapes, API envelopes, and auth models. No feature pod, controller, or component may redefine or locally duplicate a contracts type.
TypeScript contracts are authoritative. C# mirrors derive from them via the sync enforcement script. Drift between the two is a build failure. The contracts package evolves additively only — no removal or rename without ARB approval and a major version bump.


## 1.3  Additive-Only Evolution
⚖ LAW: Contract interfaces, permission codes, and route maps grow by addition. Removal or rename of any exported symbol requires ARB approval, a two-sprint deprecation window, and a migration guide.
This rule exists because AI agents and multiple engineering teams generate code against these contracts simultaneously. A removal or rename in contracts produces build failures across all consumers immediately. Premature refactoring is more expensive than the temporary debt of an unused symbol.


## 1.4  Zero-Trust Mindset
⚖ LAW: Never trust input that has not been validated by an authoritative server-side source. JWT tid and oid claims are facts. URL parameters are routing hints only. No UI interaction grants or revokes permissions.
- Never trust URL parameters, query strings, or path segments as authorization input.
- Never render sensitive data before PermissionContext has fully resolved.
- Never read roles from JWT claims. Roles come from IPermissionEvaluator per request.
- Never assume the absence of a UI guard means the API is unprotected.


## 1.5  Deterministic Behavior Over Convenience
⚖ LAW: Predictability is a security property. Every system behavior must be the same regardless of who calls it, when, or in what order.
Async fire-and-forget (outside approved locations), race conditions in UI rendering, non-deterministic cache key construction, and ambient service resolution all introduce non-determinism. They are banned for this reason, not just for style.


## 1.6  Platform Ownership vs Feature Ownership
⚖ LAW: Platform-owned files (providers, shell, contracts, navigation, CI scripts) may not be modified by feature teams without Principal Engineer sign-off. Feature code is blast-radius contained to its own feature slice.
Platform-owned: AuthProvider, PermissionProvider, MsalAuthProvider, MockAuthProvider, AppLayout, NavRail, RoutePermissionMap, /packages/contracts/, CI pipeline configuration.
Feature-owned: pages/[feature]/** and the feature's API hooks, local components, and local types within those bounds.


## 1.7  Multi-Tenant Data Isolation Is Structural
⚖ LAW: TenantId is a required, non-nullable column on every security entity. EF Core global query filters enforce isolation. Cross-tenant data visibility is a catastrophic failure, not a bug.
The frontend treats tenantId as a server-resolved fact from the JWT tid claim. It is never a UI-selectable parameter. The backend resolves it in TenantMiddleware before any business logic executes and before IPermissionEvaluator is invoked.

BACKEND CODING LAW  Sections 2 – 6 govern all ASP.NET Core .NET 8 backend code

# Section 2 — Controller Design Standard
⚖ LAW: Controllers are thin orchestrators only. They contain zero business logic, zero permission evaluation logic, zero direct database access, and zero response envelope construction beyond wrapping a service result.


## 2.1  Mandatory Controller Template
Every controller MUST conform to this structure. Deviations require Principal Engineer approval with a documented justification in the PR description.

```
[ApiController]
[Route("api/[controller]")]
public sealed class RolesController : ControllerBase
{
    private readonly IRoleService _service;
    private readonly TenantContext _tenant;

    public RolesController(IRoleService service, TenantContext tenant)
    {
        _service = service;
        _tenant = tenant;
    }

    [HttpGet]
    [Authorize(Policy = PermissionCode.RoleRead)]       // ← MANDATORY on every endpoint
    [ProducesResponseType(typeof(ApiResponse<RoleListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ListRoles(
        [FromQuery] ListQueryParams query,
        CancellationToken ct)                           // ← MANDATORY on every async action
    {
        var result = await _service.ListAsync(_tenant.TenantId, query, ct);
        return Ok(ApiResponseFactory.Create(result));   // ← MANDATORY envelope
    }
}
```


## 2.2  Enforcement Rules

| Rule | Requirement |
| --- | --- |
| [Authorize(Policy)] mandatory | Every non-public endpoint carries [Authorize(Policy=PermissionCode.XxxYyy)]. Anonymous endpoints are explicitly decorated [AllowAnonymous] with a comment explaining why. |
| Thin controller — max 5 lines of logic | Controller actions may contain only: validate model state, call one service method, wrap result in ApiResponse, return IActionResult. Business logic in controllers is an immediate code review rejection. |
| CancellationToken mandatory | Every async action method accepts CancellationToken ct as its last parameter and passes it to every async call within the action. |
| No direct DbContext injection | Controllers never inject DbContext, KernelDbContext, or any IRepository directly. All data access is mediated by a domain service or application use case. |
| No direct permission checks | Controllers never call IPermissionEvaluator, check User.IsInRole(), or read User.Claims directly for authorization. The [Authorize(Policy)] attribute is the complete authorization mechanism. |
| ApiResponse envelope required | All successful responses return Ok(ApiResponseFactory.Create(result)). No raw object returns. No anonymous types. No custom serialization per endpoint. |
| ProducesResponseType attributes | Every action documents its response types with [ProducesResponseType] for Swagger correctness and contract drift detection. |


## 2.3  Explicit Bans
❌ BANNED: Fat controllers: any action method exceeding 15 lines of meaningful code. Extract to a service.
❌ BANNED: Inline permission logic: if (User.IsInRole("Admin")) — BANNED everywhere in controllers.
❌ BANNED: Synchronous actions: Task.Result, .Wait(), or void action methods. All actions are async Task<IActionResult>.
❌ BANNED: Ad-hoc response shapes: returning new { data = x, count = y } instead of ApiResponse<T>.
❌ BANNED: Direct exception swallowing: catch (Exception) without logging and rethrowing or converting to ProblemDetails.


# Section 3 — Authorization Enforcement Law
⚖ LAW: IPermissionEvaluator is the ONLY permission authority. All authorization logic, audit emission, and telemetry live inside it. No code path anywhere in the codebase makes an authorization decision by any other means.


## 3.1  IPermissionEvaluator Is the Sole Authority
The policy handler (PermissionRequirementHandler) is a five-line adapter that delegates to IPermissionEvaluator. It contains zero evaluation logic. IPermissionEvaluator in turn:
- Checks IPermissionCache (sub-millisecond). On miss: resolves from IPermissionRepository.
- Checks ADMIN:GLOBAL bypass (explicit code path, always audited with IsBreakGlass=true).
- Evaluates ctx.HasPermission(code) on the resolved PermissionContext.
- Emits authorization telemetry via IAuthTelemetry.
- Enqueues AuditEvent via IAuditQueue (fire-and-forget, never throws).
- Returns EvaluationResult with IsGranted, Reason, PermissionsVersion, and LatencyMs.


## 3.2  The Five-Line Policy Handler — Canonical
```
protected override async Task HandleRequirementAsync(
    AuthorizationHandlerContext ctx,
    PermissionRequirement req)
{
    var result = await _evaluator.EvaluateAsync(
        _tenant.TenantId, ctx.User.GetUserId(),
        ctx.User.GetModuleId(), req.Code);
    if (result.IsGranted) ctx.Succeed(req);
    // Denied: ctx remains not-succeeded → 403 returned automatically
}
```


## 3.3  Forbidden Authorization Patterns

| Forbidden Pattern | Why Banned |
| --- | --- |
| User.IsInRole("Admin") | Role-name checks are revocation-deaf. A revoked role persists until token expiry. All checks must go through IPermissionEvaluator. |
| User.Claims.FirstOrDefault(c => c.Type == "roles") | JWT roles are NEVER present in this platform. Reading them silently produces a null permission check that always fails open or closed. |
| "ROLE:CREATE" string literal in feature code | Permission strings may only appear in /packages/contracts/rbac/index.ts and the C# PermissionCode class. Everywhere else must import from contracts. |
| if (isGlobalAdmin) { /* skip check */ } | GLOBAL_ADMIN is handled exclusively inside IPermissionEvaluator. Never model it as an application-layer bypass. The evaluator emits IsBreakGlass=true audit events for every GLOBAL_ADMIN evaluation. |
| authService.HasPermissionAsync() in a service class | Domain services do not perform authorization. Authorization is an application-layer concern, enforced at the HTTP boundary via [Authorize(Policy)]. Domain services receive pre-authorized commands. |


## 3.4  GLOBAL_ADMIN Non-Negotiable Invariants
- BYPASSES: module scope only — access across all modules within a tenant without module-scoped evaluation.
- NEVER BYPASSES: tenant boundary — GLOBAL_ADMIN in Tenant A cannot access Tenant B data.
- NEVER BYPASSES: soft delete — soft-deleted entities are invisible to GLOBAL_ADMIN. EF Core global filter is not overridden.
- NEVER BYPASSES: audit — every GLOBAL_ADMIN evaluation emits IsBreakGlass=true AuditEvent. Non-suppressible.
- NEVER BYPASSES: authentication — GLOBAL_ADMIN is not a superuser that skips JWT validation. 401 on invalid token regardless.


# Section 4 — Dependency Injection Law
⚖ LAW: Constructor injection is the only approved DI mechanism. Service locator, ambient resolution, and static service access are banned without exception.


## 4.1  Constructor Injection — Required Pattern
```
// ✅ REQUIRED — constructor injection
public sealed class PermissionEvaluator : IPermissionEvaluator
{
    private readonly IPermissionCache _cache;
    private readonly IPermissionRepository _repo;
    private readonly IAuditQueue _audit;
    private readonly IAuthTelemetry _telemetry;

    public PermissionEvaluator(
        IPermissionCache cache,
        IPermissionRepository repo,
        IAuditQueue audit,
        IAuthTelemetry telemetry)
    {
        _cache = cache; _repo = repo; _audit = audit; _telemetry = telemetry;
    }
}
```


## 4.2  Service Lifetime Decision Table

| Lifetime | Use For | Never Use For | Example |
| --- | --- | --- | --- |
| Scoped | Services that depend on the per-request TenantContext, HttpContext, or EF Core DbContext. | Long-running operations, services with singleton dependencies. | TenantContext, DbContext, IRoleService, IUserService |
| Singleton | Stateless services with no per-request dependencies. Initialized once and shared. | Anything that touches TenantContext, IMemoryCache with per-tenant keying, or Request-scoped data. | IAuthTelemetry, ILogger, IPermissionCache (InMemory) |
| Transient | Lightweight, stateless value-object-style services with no shared state. | Services with significant initialization cost or services that hold state. | Validators, mappers |


## 4.3  Options Binding — Required Pattern
```
// ✅ REQUIRED — typed options with IOptions<T>
public sealed class JwtOptions
{
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public required string SigningKey { get; init; }
}
// Registration in Program.cs:
services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
// Consumption:
public MyService(IOptions<JwtOptions> opts) => _opts = opts.Value;
```


## 4.4  Explicit Bans
❌ BANNED: IServiceProvider.GetService<T>() or GetRequiredService<T>() in business code or domain services. Permitted only in DI bootstrapping (Program.cs) and integration test setup.
❌ BANNED: Static service singletons: public static IPermissionEvaluator Instance. Untestable. Lifecycle unmanaged.
❌ BANNED: Ambient service resolution: ServiceLocator.Current.GetService<T>(). Prohibited in all contexts.
❌ BANNED: Property injection or method injection outside of framework-specific scenarios (e.g., ASP.NET Core middleware).
❌ BANNED: Injecting IServiceProvider into a domain or application class as a dependency resolution escape hatch.


# Section 5 — Logging & Telemetry Standard
⚖ LAW: All logging uses ILogger<T> with structured message templates. No string interpolation in log messages. All authorization-related events include tenantId, userId, and permissionCode dimensions.


## 5.1  Required Logging Pattern
```
// ✅ REQUIRED — structured log with named properties
_logger.LogInformation(
    "Permission evaluated. TenantId={TenantId} UserId={UserId} Code={Code} Granted={Granted} Source={Source} LatencyMs={LatencyMs}",
    tenantId, userId, code, result.IsGranted, result.Source, result.LatencyMs);

// ❌ BANNED — string interpolation destroys structured log queryability
_logger.LogInformation($"Permission {code} evaluated for user {userId}: {result.IsGranted}");
```


## 5.2  Mandatory Log Dimensions

| Dimension | Required In | Notes |
| --- | --- | --- |
| TenantId | All authorization, audit, and data access logs | Always a Guid string. Never resolved to display name in log messages (PII risk). |
| UserId | Authorization and audit events | Entra Object ID (oid claim). Never email or display name in structured log properties. |
| PermissionCode | All IPermissionEvaluator evaluations | Exact permission code string. e.g., "ROLE:CREATE". |
| CorrelationId | All log messages within a request scope | Injected via Serilog request enricher. Available via ILogger automatically when scope is configured. |
| ModuleId | Module-scoped permission evaluations | Guid. Omit for tenant-wide operations (e.g., ADMIN:GLOBAL evaluations). |
| Source | IPermissionEvaluator evaluations | "cache" or "db". Feeds cache hit rate monitoring. |


## 5.3  Log Level Discipline

| Level | When to Use |
| --- | --- |
| LogTrace | Cache lookup steps, loop iterations within permission resolution. Never in production by default. Development-only. |
| LogDebug | Cache hits, routine permission resolutions, query execution details. Not emitted in production. |
| LogInformation | Significant business events: permission evaluation results, role assignments, module registrations, session starts/ends. |
| LogWarning | Recoverable anomalies: cache miss burst rate exceeded, permission count growing, clock skew detected, tenant resolution fallback used. |
| LogError | Failures that affect a specific request but the service remains operational: permission repository timeout, audit enqueue failure. |
| LogCritical | Service-level failures: database unreachable, key vault inaccessible, TenantMiddleware unable to resolve any tenant. Triggers PagerDuty. |


## 5.4  PII Safety Rules
❌ BANNED: Never log email addresses, display names, or IP addresses as structured log property values. Use Guid identifiers only.
❌ BANNED: Never log JWT token strings or token fragments. Log only the oid and tid claims by Guid.
❌ BANNED: Never log permission context contents (the full set of permission codes for a user). Log only the evaluated code and result.
Exception: ip_address may be logged in AuditSession records where explicitly required by compliance. It is not logged in application telemetry events.


# Section 6 — Async & Concurrency Law
⚖ LAW: Async all the way. No blocking on async code. CancellationToken propagates through every async call chain. Fire-and-forget is banned except in the explicitly approved IAuditQueue.Enqueue() path.


## 6.1  Async Top to Bottom
```
// ✅ REQUIRED — async through the entire call chain
public async Task<RoleDto> GetRoleAsync(Guid roleId, CancellationToken ct)
{
    var role = await _repo.GetByIdAsync(roleId, ct);
    return _mapper.Map<RoleDto>(role);
}

// ❌ BANNED — blocking on async code
var role = _repo.GetByIdAsync(roleId).Result;   // deadlock risk
_repo.GetByIdAsync(roleId).Wait();               // deadlock risk
var role = _repo.GetByIdAsync(roleId).GetAwaiter().GetResult(); // deadlock risk
```


## 6.2  CancellationToken Propagation — Mandatory
Every async method in the call chain accepts CancellationToken ct as its last parameter. Passing CancellationToken.None is permitted only in BackgroundService-initiated operations that are not associated with an HTTP request. It must be documented with a comment.
```
// ✅ REQUIRED
public async Task<PermissionContext> ResolveAsync(Guid tenantId, Guid userId, Guid moduleId, CancellationToken ct)
{
    var assignments = await _db.UserRoleAssignments
        .Where(a => a.TenantId == tenantId && a.UserId == userId && a.ModuleId == moduleId && a.IsActive)
        .ToListAsync(ct);  // ← ct passed to every EF Core async call
}
```


## 6.3  Task vs ValueTask Guidance

| Type | When to Use |
| --- | --- |
| Task<T> | Default choice. Use for all application layer methods, controller actions, service methods, and repository methods. |
| ValueTask<T> | Hot-path cache lookups where the synchronous (cache-hit) result is returned most of the time and heap allocation matters. Example: IPermissionCache.GetAsync(). Requires careful implementation — ValueTask cannot be awaited multiple times. |
| void async | BANNED in all non-event-handler contexts. Exceptions in void async methods are unobservable and crash the process. |


## 6.4  Fire-and-Forget — Approved Locations Only
⚖ LAW: Fire-and-forget async is permitted ONLY in IAuditQueue.Enqueue() which writes to a Channel<AuditEvent> consumed by AuditBackgroundService. Every other fire-and-forget pattern is banned.
❌ BANNED: _ = Task.Run(() => DoSomethingAsync()); — unobserved exception, thread pool misuse.
❌ BANNED: Task.Factory.StartNew(() => DoAsync()); — unless configuring a dedicated TaskScheduler with exception handling.
❌ BANNED: async void methods outside ASP.NET event handlers (e.g., Button.Click). If using Blazor in future: document exception handling explicitly.


## 6.5  Parallelism Rules
Parallel database queries within a single EF Core DbContext are banned. EF Core DbContext is not thread-safe. Each parallel operation requires its own scoped DbContext.
Use Task.WhenAll() for independent async operations that do not share a DbContext. Document the maximum concurrency and ensure it is within Dataverse service protection limits.

FRONTEND CODING LAW  Sections 7 – 11 govern all React 18 / TypeScript frontend code

# Section 7 — Griffel-Only Styling Law
⚖ LAW: makeStyles() from @griffel/react is the sole approved method for writing CSS in this codebase. No other styling mechanism produces styles for new components. Period.
Griffel generates deterministic atomic CSS class names at build time with zero runtime injection penalty. It integrates natively with Fluent design tokens providing automatic high-contrast mode, theme switching, and WCAG 2.1 AA compliance by inheritance. Any alternative styling system destroys these guarantees.


## 7.1  Required Griffel Pattern
```
import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';

// ✅ REQUIRED: makeStyles at module level, outside component function body
const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
  },
  activeState: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

export function MyComponent({ isActive }: { isActive: boolean }) {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.container, isActive && styles.activeState)}>
      Content
    </div>
  );
}
```


## 7.2  Explicit Styling Bans

| Banned Pattern | Required Alternative |
| --- | --- |
| color: '#0078d4' | tokens.colorBrandForeground1 |
| backgroundColor: 'red' | tokens.colorStatusDangerBackground1 |
| padding: '16px' | tokens.spacingVerticalM (vertical) / tokens.spacingHorizontalM (horizontal) |
| gap: '1rem' | tokens.spacingHorizontalM or tokens.spacingVerticalM |
| zIndex: 9999 | tokens.zIndexOverlay, tokens.zIndexModal, etc. |
| style={{ padding: '16px' }} on any element | makeStyles() only. Inline style permitted ONLY for truly dynamic computed pixel values with a justifying comment. |
| makeStyles() inside component function body | Module-level only. Inside component body recreates styles on every render and defeats Griffel determinism. |
| styled-components, @emotion, Tailwind, CSS Modules (except override escape hatch) | Griffel only. CSS Modules permitted solely for third-party component overrides unreachable via Griffel, with a comment explaining why. |
| className={`${styles.a} ${isActive ? styles.b : ""}`} | mergeClasses(styles.a, isActive && styles.b) — always use mergeClasses() for class composition. |
| outline: none or outline: 0 on any element | Use :focus-visible with tokens.colorStrokeFocus2 and tokens.strokeWidthThick to provide a compliant focus indicator. |

❌ BANNED: Global CSS (.css files, <style> tags, document.head.appendChild). The only permitted global CSS is src/index.css for root resets, maintained exclusively by the platform team.


# Section 8 — Fluent Token Usage Discipline
⚖ LAW: Semantic tokens are preferred over raw tokens. Hardcoded values are banned. Token usage is not a style preference — it is the mechanism that provides high-contrast mode, theme switching, and accessibility compliance at no additional cost.
Why this matters: when a user enables Windows High Contrast Black mode, Fluent semantic tokens adapt automatically. A hardcoded color (#0078d4) does not. The result is an inaccessible UI that fails WCAG 2.1 AA, blocks enterprise onboarding, and violates the CI axe-core gate. Token discipline is a security and compliance requirement, not an aesthetic preference.


## 8.1  Token Hierarchy
Semantic tokens (preferred): Carry accessibility and intent. tokens.colorNeutralForeground1, tokens.colorBrandBackground, tokens.colorStatusDangerBackground1. Use these first.
Raw tokens (permitted with justification): tokens.colorPaletteBlueBorder2, tokens.colorPaletteRedBackground3. Permitted only when no semantic equivalent exists. Requires a comment in the code.
Hardcoded values (BANNED): '#0078d4', 'red', 'rgba(0,0,0,0.5)', '16px', '1rem'. These do not adapt to themes and fail accessibility.


## 8.2  Token Reference Table

| Intent | Required Token | Notes |
| --- | --- | --- |
| Primary text | tokens.colorNeutralForeground1 | Main body text, form labels |
| Secondary text | tokens.colorNeutralForeground2 | Descriptions, captions |
| Disabled text | tokens.colorNeutralForegroundDisabled | Always paired with disabled state |
| Page background | tokens.colorNeutralBackground1 | Main content area background |
| Card background | tokens.colorNeutralBackground2 | Cards, panels, sidebars |
| Brand action | tokens.colorBrandBackground | Primary buttons, active indicators |
| Danger / destructive | tokens.colorStatusDangerBackground1 | Delete confirmations, error states |
| Warning | tokens.colorStatusWarningBackground1 | Alerts, cautionary states |
| Success | tokens.colorStatusSuccessBackground1 | Confirmations, active assignments |
| Standard padding | tokens.spacingVerticalM / spacingHorizontalM | Default component padding |
| Section padding | tokens.spacingVerticalL / spacingHorizontalL | Page sections, modals |
| Body text | tokens.fontSizeBase300 | Default text size |
| Heading text | tokens.fontSizeBase500 | Section headings |
| Focus outline | tokens.colorStrokeFocus2 + tokens.strokeWidthThick | Required for custom interactive elements |
| Modal z-index | tokens.zIndexOverlay | Never use integer values |


# Section 9 — Frontend State Management Boundaries
⚖ LAW: State management follows the four-quadrant model. There is no fifth category. A request to add a global state library requires an ARB decision and a documented gap analysis proving the four-quadrant model is insufficient.


## 9.1  The Four-Quadrant Model — Authoritative

| Quadrant | Tool | Owns | Must NOT Own |
| --- | --- | --- | --- |
| Server State | @tanstack/react-query | API data: roles, users, assignments, audit logs, stats, modules | Auth state, UI open/close, permission codes |
| Auth State | AuthContext | Token, user identity (oid, tid, displayName), isAuthenticated, isLoading | Server data, permission codes, UI state |
| Permission State | PermissionContext | Set<string> of permission codes, permissions loading flag | User identity, server data, UI state |
| Ephemeral UI State | useState / useReducer | Modal open/close, form values, active tab, row selection, accordion state | Anything from server or auth system |


## 9.2  React Query Rules

### Cache keys must be deterministic and tenant-scoped
```
// ✅ REQUIRED — tenant-scoped, deterministic cache key
useQuery({
  queryKey: ['roles', 'list', { tenantId, page, pageSize, sortBy, sortDir }],
  queryFn: () => rolesApi.list({ page, pageSize, sortBy, sortDir }),
  staleTime: 2 * 60 * 1000,
});

// ❌ BANNED — ambiguous, not tenant-scoped, non-deterministic
useQuery({ queryKey: ['roles'], queryFn: rolesApi.list });
```


### After mutations, invalidate — never manually sync
```
// ✅ REQUIRED
const mutation = useMutation({
  mutationFn: rolesApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['roles', 'list'] });
    showSuccessToast('Role created successfully.');
  },
});

// ❌ BANNED — manual local state sync
onSuccess: (newRole) => { setRoles(prev => [...prev, newRole]); }
```


### Permissions stale time must match backend TTL
```
useQuery({
  queryKey: ['me', 'permissions'],
  queryFn: authApi.getMyPermissions,
  staleTime: 5 * 60 * 1000,   // ← must match IPermissionCache TTL (5 min)
  enabled: isAuthenticated,
});
```


## 9.3  Context Usage Rules
Context is used only for the two approved providers: AuthContext and PermissionContext. Creating new context for sharing server data between components is banned. Pass data via props or co-locate the React Query hook within the feature that needs it.
❌ BANNED: Zustand, Redux, Jotai, Recoil, and MobX. ESLint no-restricted-imports blocks these packages. A request to unblock requires ARB decision and gap analysis.
❌ BANNED: Creating a third Context for server-fetched feature data. Use React Query co-location.
❌ BANNED: Storing any permission code or auth state in useState or useReducer outside the approved providers.


# Section 10 — MSAL & Authentication Usage Rules
⚖ LAW: AuthProvider is the single authority for auth state. Feature components never call MSAL directly. Token injection happens exclusively in the Axios request interceptor. acquireTokenSilent() is called before every API request.


## 10.1  AuthContextValue Interface — The Contract
```
export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email?: string) => Promise<void>;  // email param used by MockAuthProvider only
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthUser {
  userId: string;    // oid claim — Entra Object ID
  tenantId: string;  // tid claim — Entra Tenant ID
  displayName: string;
  email: string;
}
```


## 10.2  Required Axios Token Interceptor
```
// src/api/client.ts — the ONLY location where tokens are injected
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


## 10.3  Error Handling UX Requirements

| Scenario | Required UX |
| --- | --- |
| InteractionRequiredAuthError | Redirect to Entra login immediately via acquireTokenRedirect(). Never show an error page. Store current URL in sessionStorage["postLoginRedirect"]. |
| API returns 401 Unauthorized | Full-page "Session expired" message with "Sign in again" button. Redirect to login. Clear auth state. |
| API returns 403 Forbidden | Navigate to /forbidden page (from ROUTE_MAP). Show access denied with tenant name and a "Request Access" link. |
| Network error | Fluent MessageBar with intent="error" inline in the affected component. Provide a retry action. Not a full-page error. |
| MSAL login fails | Full-page error with diagnostic info: error code, correlation ID, and support contact link. |
| Session expires during active use | InteractionRequiredAuthError → redirect. After re-auth: read sessionStorage["postLoginRedirect"], navigate to stored URL, remove key. |


## 10.4  Common MSAL Anti-Patterns — All Banned
❌ BANNED: acquireTokenSilent() called inside a component. Token injection is the interceptor's job. Components use useAuth() only.
❌ BANNED: MSAL instance created inside a component or hook. Module-level singleton only, initialized once in main.tsx.
❌ BANNED: Storing access tokens in localStorage. XSS-accessible. MSAL uses sessionStorage by default. Accept this default.
❌ BANNED: Decoding the JWT in client code (atob, jwt-decode, manual claim parsing). Use AuthContext.user exclusively.
❌ BANNED: Hardcoding client ID or tenant ID. These come from import.meta.env variables only.
❌ BANNED: Swallowing InteractionRequiredAuthError. This produces broken UX with expired tokens and no recovery path.
❌ BANNED: Using the implicit grant flow. PKCE is the only approved grant type.
❌ BANNED: msalInstance.logoutPopup() as primary logout mechanism. Use logoutRedirect() to clear the Entra session.


# Section 11 — RBAC Usage Rules (Frontend)
⚖ LAW: UI permission checks never replace API authorization. RoutePermissionMap is the authority for all routes and permissions. usePermission() is the only approved permission check hook. ProtectedRoute wraps every authenticated page. Permission-gated UI never renders while PermissionContext is loading.


## 11.1  The Foundational Rule
Every permission check rendered in the UI is a UX convenience only. It provides zero security enforcement. The API endpoint behind every permission-gated action independently enforces the same permission via [Authorize(Policy)] and IPermissionEvaluator. The UI gate being absent or bypassed changes nothing at the security boundary.


## 11.2  ProtectedRoute — Required Pattern
```
// ✅ REQUIRED — every authenticated route uses ProtectedRoute
function ProtectedRoute({ routeKey }: { routeKey: RouteKey }) {
  const route = ROUTE_MAP.find(r => r.pageKey === routeKey)!;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPermission, isLoading: permLoading } = usePermissionContext();

  if (authLoading || permLoading) return <PageSkeleton />;   // MANDATORY guard
  if (!isAuthenticated) return <Navigate to='/login' replace />;
  if (route.requiredPermission && !hasPermission(route.requiredPermission))
    return <Navigate to='/forbidden' replace />;
  return <Outlet />;
}

// ❌ BANNED — hardcoded permission string bypasses RoutePermissionMap as authority
// <ProtectedRoute requiredPermission='ROLE:READ'>   ← NEVER
```


## 11.3  Permission Loading Contract — P0 Security UX Invariant
⚖ LAW: Permission-gated UI MUST NOT render while PermissionContext is loading. Rendering before resolution risks an unauthorized UI flash. This is a security UX defect, not cosmetic.
```
// ✅ REQUIRED — every component that gates on permissions
export function RolesPage() {
  const { isLoading: permLoading, hasPermission } = usePermissionContext();

  if (permLoading) return <PageSkeleton />;      // MANDATORY — not optional
  if (!hasPermission('ROLE:READ')) return <AccessDenied />;
  return <RolesPageContent />;
}

// ❌ BANNED — renders gated content before permission resolution
export function BadRolesPage() {
  const { hasPermission } = usePermissionContext();  // missing isLoading guard
  if (!hasPermission('ROLE:READ')) return <AccessDenied />;
  return <RolesPageContent />;   // ← unauthorized flash on cold load
}
```


## 11.4  usePermission() — The Only Approved Hook
```
// src/hooks/usePermission.ts — the only way to check permission in a component
export function usePermission(code: PermissionCode): boolean {
  const { hasPermission } = usePermissionContext();
  return hasPermission(code);
}

// Usage
function RoleActions({ roleId }: { roleId: string }) {
  const canEdit   = usePermission('ROLE:UPDATE');
  const canDelete = usePermission('ROLE:DELETE');
  return (
    <>
      {canEdit   && <Button onClick={() => handleEdit(roleId)}>Edit</Button>}
      {canDelete && <Button onClick={() => handleDelete(roleId)}>Delete</Button>}
    </>
  );
}
```


## 11.5  Prohibited Frontend RBAC Patterns
❌ BANNED: Role name checks: if (user.roles?.includes('Admin')) — BANNED. Roles are never in AuthUser or JWT on this platform.
❌ BANNED: Permission checks outside usePermission(): reading PermissionContext directly in JSX — BANNED.
❌ BANNED: Permission string literals in components: if (hasPermission('ROLE:CREATE')) — BANNED. Import PermissionCode from contracts.
❌ BANNED: Optimistic permission gating: rendering gated content and hiding it with CSS — BANNED. Always guard with a conditional render.
❌ BANNED: window.location.href assignment to bypass react-router-dom navigation — BANNED.
❌ BANNED: Conditional route registration based on permissions. Routes are always registered. ProtectedRoute handles access.

CROSS-CUTTING SAFETY RULES  Section 12 — Global enforcement regardless of layer

# Section 12 — Forbidden Patterns: Global Ban List
These patterns are banned across the entire codebase without exception. CI gates catch the majority. Code review catches the remainder. A PR containing any of these patterns is rejected immediately without further review.


## 12.1  Security Violations — Immediate Rejection

| Banned Pattern | Violation / Required Alternative |
| --- | --- |
| User.IsInRole("Admin") anywhere | IPermissionEvaluator / usePermission() only. Role-name checks are revocation-deaf. |
| Permission string literal outside contracts: 'ROLE:CREATE' | Import PermissionCode from @claas2saas/contracts/rbac. No inline strings. |
| Roles in JWT: reading jwt.roles claim | Roles are never in JWT on this platform. Roles come from IPermissionEvaluator. |
| Missing [Authorize(Policy)] on non-public endpoint | Every non-public endpoint carries [Authorize(Policy=PermissionCode.XxxYyy)]. No exceptions. |
| Rendering gated UI before permLoading resolves | if (permLoading) return <PageSkeleton />; — mandatory in every permission-gated component. |
| Cross-tenant query without TenantId filter | EF Core global query filter enforces TenantId. Do not call IgnoreQueryFilters() in application code. |
| GLOBAL_ADMIN bypass in application code (not evaluator) | GLOBAL_ADMIN is handled exclusively in IPermissionEvaluator. Application code never models it. |
| Secrets in source code (connection strings, API keys) | Gitleaks pre-commit hook blocks commits. Use dotnet user-secrets locally; Key Vault in production. |
| localStorage for access token storage | MSAL uses sessionStorage by default. Accept this. Do not override. |
| Synchronous audit emission in request path | IAuditQueue.Enqueue() only — fire-and-forget, never throws. Audit failures never surface as API errors. |


## 12.2  Architecture Violations — Immediate Rejection

| Banned Pattern | Violation / Required Alternative |
| --- | --- |
| Feature-local DTO that duplicates a contracts type | Import from @claas2saas/contracts. Submit a contracts PR if a new type is needed. |
| Business logic in a controller action | Extract to domain service. Controller max 5 lines of business-relevant logic. |
| DbContext injected into a controller | Controllers inject services only. Services inject repositories. Repositories inject DbContext. |
| IServiceProvider.GetService() in business code | Constructor injection. If the dependency cannot be injected, redesign the service lifetime. |
| Kernel.Application referencing EF Core or ASP.NET Core | Application layer references Domain only. Infrastructure implements Application interfaces. |
| Global state library (Zustand, Redux, Jotai) | Four-quadrant model. React Query + Context covers all requirements. |
| React Query key without tenantId where applicable | Include tenantId in query keys for all tenant-scoped data: ['roles', 'list', { tenantId }]. |
| New package added without ARB approval | Approved stack is defined in frontend-standards.md Section 2.1. All additions require ADR + ARB. |
| Feature pod modifying platform-owned files | Feature pods are blast-radius contained. Platform files require Principal Engineer sign-off. |


## 12.3  Async & Concurrency Violations

| Banned Pattern | Violation |
| --- | --- |
| .Result on any Task or ValueTask | Deadlock risk in ASP.NET Core synchronization context. Always await. |
| .Wait() on any Task | Same deadlock risk. Always await. |
| .GetAwaiter().GetResult() | Equivalent to .Result. Same deadlock risk. Always await. |
| async void method | Exceptions are unobservable and crash the process. Always return Task. |
| Fire-and-forget outside IAuditQueue.Enqueue() | Exceptions silently disappear. Only approved fire-and-forget is the audit queue channel. |
| CancellationToken.None in HTTP request handler | Pass the CancellationToken from the action method through every async call. |
| Parallel EF Core queries on shared DbContext | DbContext is not thread-safe. Use a new scoped DbContext per parallel operation. |


## 12.4  Styling & UI Violations

| Banned Pattern | Violation |
| --- | --- |
| Any hardcoded color value (#hex, rgb, named) | Fluent semantic token required. Fails CI ESLint rule. Breaks high-contrast mode. |
| style={{ }} on any element for layout or color | makeStyles() only. Inline style permitted only for truly dynamic computed px values with comment. |
| makeStyles() inside component function body | Module-level only. Inside body defeats Griffel determinism and recreates styles every render. |
| Non-Fluent UI component (Material UI, Bootstrap) | @fluentui/react-components v9 only. No exceptions. |
| FontAwesome or non-Fluent icon library | @fluentui/react-icons only. ESLint no-restricted-imports enforces. |
| <div onClick> without keyboard handler | Use Fluent Button or implement full keyboard accessibility (Enter, Space, ARIA role). |
| outline: none without equivalent focus indicator | Use tokens.colorStrokeFocus2 + tokens.strokeWidthThick on :focus-visible. |
| aria-label missing on icon-only buttons | aria-label describing the action (not the icon) is required on every icon-only interactive element. |


## 12.5  TypeScript Violations

| Banned Pattern | Violation |
| --- | --- |
| any type without tracked TODO comment + ticket | noImplicitAny is enforced. any casts require // TODO: [TICKET-123] reason comment. CI validates. |
| // @ts-ignore or // @ts-expect-error without ticket | These suppress type errors without addressing them. CI fails on any suppression without a ticket reference. |
| Raw string where PermissionCode union expected | Import type { PermissionCode } from @claas2saas/contracts/rbac and use the typed union. |
| Raw string where RouteKey union expected | Import type { RouteKey } from @claas2saas/contracts/routes. Never use 'role-mgmt' as a raw string. |
| Non-null assertion (!) without null check comment | ! operator asserts non-null without checking. Requires a comment explaining why null is impossible at this point. |
| function Component(props: any) | All props must be typed with an explicit interface or inline type literal. No implicit any props. |


# Section 13 — CI Enforcement Summary
These gates run on every PR. A gate failure blocks the merge. Warnings are not accepted — all gates produce zero-tolerance errors.


| Gate | Tool | What Fails It | Enforces Law |
| --- | --- | --- | --- |
| TypeScript strict typecheck | tsc --noEmit | Any TS error, including strict null violations, any casts, ts-ignore without ticket | Sections 9, 11, 12.5 |
| ESLint no-restricted-imports | eslint --max-warnings 0 | Banned packages (Zustand, Redux, FontAwesome), deep contract imports, permission string literals in feature code | Sections 7, 9, 11, 12 |
| Hardcoded style values rule | eslint custom rule | Any hex color, px value, or rem value inside makeStyles() | Sections 7, 8 |
| Permission literal ban | eslint custom rule | String literal matching '[A-Z_]+:[A-Z_]+' outside /packages/contracts/ | Sections 2, 3, 11 |
| Permission code sync | tools/sync-permission-codes.ps1 | Any TS permission code missing from C# PermissionCode class or vice versa | Sections 3, 9 of contracts spec |
| RoutePermissionMap validation | tools/validate/route-map-check.ts | Orphan RouteKey without React.lazy() entry, unregistered permission code in ROUTE_MAP | Section 11 |
| RBAC matrix tests | xUnit + SQLite | Any role x permission code combination producing unexpected allow/deny result | Sections 3, 4 |
| Multi-tenant isolation tests | xUnit + TestServer | Any cross-tenant data visibility or write success | Sections 1.7, 3 |
| Bundle size gate | vite + size-limit | Shell > 100KB gzipped, any page chunk > 200KB gzipped | Section 13 of contracts spec |
| Accessibility gate | axe-core per page | Any critical or serious WCAG 2.1 AA violation | Sections 7, 8 |
| Nullable reference analysis | Roslyn analyzers | Any CS8600 nullable dereference warning in backend projects | Section 6 |
| Secret scanning | Gitleaks pre-commit | Any credential, connection string, or API key in source code | Section 12.1 |


# Section 14 — Naming Conventions
Naming is not subjective on this platform. These conventions are enforced by ESLint and Roslyn analyzers where possible and by code review gate where not.


## 14.1  TypeScript / Frontend

| Artefact | Convention | Example |
| --- | --- | --- |
| Page component file | PascalCase + Page.tsx | RoleManagementPage.tsx |
| Feature component | PascalCase + .tsx | RolePermissionMatrix.tsx |
| Custom hook | camelCase, use prefix, .ts | useRoleList.ts |
| API module | camelCase + .api.ts | roles.api.ts |
| React Query hook (query) | useXxxQuery suffix | useRoleListQuery.ts |
| React Query hook (mutation) | useXxxMutation suffix | useCreateRoleMutation.ts |
| Zod schema | PascalCase + Schema | const CreateRoleSchema = z.object(...) |
| Context | PascalCase + Context | PermissionContext |
| Provider | PascalCase + Provider | PermissionProvider |
| Types file | camelCase + .types.ts | rbac.types.ts |


## 14.2  C# / Backend

| Artefact | Convention | Example |
| --- | --- | --- |
| Interface | I prefix + PascalCase | IPermissionEvaluator |
| Implementation | PascalCase, no I prefix | PermissionEvaluator |
| Controller | PascalCase + Controller | RolesController |
| DTO / record | PascalCase + Dto | RoleDto, CreateRoleDto |
| Domain entity | PascalCase, no suffix | SecurityRole, SecurityUser |
| Repository | IXxxRepository / XxxRepository | IRoleRepository, RoleRepository |
| Options class | PascalCase + Options | JwtOptions, DataverseOptions |
| Exception | PascalCase + Exception | TenantNotFoundException |
| private field | _camelCase underscore prefix | _permissionEvaluator |
| Constant / static readonly | PascalCase | public const string RoleCreate = "ROLE:CREATE"; |


CLaaS2SaaS Security Kernel  |  Coding Constitution v1.0  |  February 2026  |  APPROVED — LAW, NOT GUIDANCE
Any code violating this constitution is non-compliant and must not be merged.