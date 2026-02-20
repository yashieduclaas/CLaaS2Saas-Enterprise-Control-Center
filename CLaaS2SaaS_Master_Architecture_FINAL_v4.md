CLaaS2SaaS
Security Kernel — Multi-Tenant RBAC Control Centre

MASTER ARCHITECTURE DOCUMENT
FINAL — SINGLE SOURCE OF TRUTH — IMPLEMENTATION-READY
| Document Attribute | Value |
| --- | --- |
| Document ID | DOC-C2S-ARCH-FINAL |
| Version | v4.0 — Authoritative Consolidation Pass |
| Supersedes | All prior CLaaS2SaaS architecture documents (v1–v3) |
| Architecture Bar | Microsoft Entra Admin Center / Azure Portal / M365 Admin Center |
| Review Standard | Microsoft Principal Architect — Control-Plane Engineering Bar |
| Status | APPROVED — Engineering builds directly from this document |
| Audience | Full-stack engineering team — implement directly, no further refinement passes |
| Date | February 2026 |

⚠  ARCHITECTURAL AUTHORITY
This document supersedes all prior architecture documents without exception. Engineers implement directly from this reference. Zero ambiguity is the target. Where this document is silent, apply the principle: "How would Microsoft build this in 2026?"

# Section 1 — Executive Architecture Verdict
Assessment prepared as a Microsoft Principal Architect reviewing this platform before Fortune 500 customer onboarding. Direct, opinionated, and actionable.
## 1.1  What Is Architecturally Strong
| Item | Detail |
| --- | --- |
| Identity-First Design | Anchoring on Microsoft Entra ID with MSAL.js PKCE is the correct enterprise decision. PKCE eliminates implicit-flow token leakage. SSO as the sole auth vector removes password management debt permanently. Mock JWT for local dev correctly mirrors Entra claim shape (oid, tid only) — zero rewrites on promotion. |
| IPermissionEvaluator Facade | The domain-level evaluator service — ASP.NET Core policy handler as a thin 5-line adapter — is the correct architectural cut. All permission logic, audit emission, and telemetry centralise in one evaluable, testable service callable from any context (HTTP, background jobs, SignalR, gRPC). |
| Fluent 2 + Griffel Discipline | Commitment to Fluent UI React v9 with Griffel as the primary styling system is correct. Griffel generates deterministic atomic CSS, supports SSR, and has zero runtime injection penalty. Fluent Design Tokens provide accessibility, high-contrast, and density compliance by inheritance. |
| Clean Architecture Backbone | Onion / Clean Architecture correctly separates domain logic from infrastructure. RBAC policy evaluation belongs in the domain. The local-to-Dataverse promotion is a swap at the infrastructure boundary only — zero domain or application layer changes. |
| PermissionContext Versioning | PermissionsVersion Guid stamped on SecurityUser and propagated through EvaluationResult to every AuditActionLog entry is enterprise-grade forensic design. Answers the compliance question: "Exactly what permission set was active when this action executed?" definitively. |
| Multi-Tenant from Day One | TenantId as a required column on every security entity with EF Core global query filters enforced in OnModelCreating is the correct non-deferrable decision. Retrofitting tenancy requires migrations, cache key redesign, and API contract changes — weeks of unplanned work. |
| RoutePermissionMap Pattern | Single-source-of-truth for routes, nav visibility, breadcrumbs, and route guards is architecturally clean. Adding a page is one ROUTE_MAP entry — protection, nav, and breadcrumbs update automatically with zero risk of orphaned unprotected routes. |
| Authorization Telemetry | Structured metric events from IPermissionEvaluator on every evaluation separate telemetry ("what is trending wrong") from audit ("what happened"). Both are required for a Microsoft-grade control plane. This distinction is architecturally correct. |

## 1.2  What Was Hardened in This Version (v4.0)
| Hardening | Prior Gap | Resolution |
| --- | --- | --- |
| Authorization Budget SLO | No hard latency contract. Authorization could silently dominate API response time. | Hard SLO defined: P50 cache <1ms, P99 cache <5ms, P99 DB <50ms, cache dominance ≥95%. KQL monitoring, Performance Review Gate enforced. |
| Permission Cache Cold-Start | Stampede risk after deployment, cache flush, Redis failover, large tenant onboarding not documented. | Phased stampede mitigation strategy defined for MVP (monitor burst rate, DB headroom) and MMP (request coalescing, jitter TTL, soft TTL refresh, per-user lock). |
| JWT Clock Skew Handling | ClockSkew not explicitly configured — default 5-minute tolerance is too permissive for RBAC operations. | ClockSkew = TimeSpan.FromMinutes(2) mandated in Program.cs with justification documented so it is never removed. |
| GLOBAL_ADMIN Blast Radius | GLOBAL_ADMIN bypass scope boundaries not formally specified. Abuse scenarios not documented. | Explicit invariants: bypasses module scope only. Never bypasses tenant boundary, soft delete, audit, or authentication. Abuse scenarios documented. |
| Permission Drift Detection | Orphaned UI permissions (route declares permission, no API enforcement) possible without CI guardrail. | CI guardrail defined with full script specification. Not required for MVP. Required before enterprise scale. |
| GLOBAL_ADMIN Telemetry | GLOBAL_ADMIN path existed but had no break-glass documentation, elevated session tagging, or audit flag. | IsBreakGlass=true on every GLOBAL_ADMIN AuditEvent. ElevatedAccess=true on AuditSession. Dedicated high-priority audit stream. |
| PermissionContext Size Risk | Union-of-roles with ImmutableHashSet correct for MVP but no monitoring for context growth at scale. | PermissionCount monitoring with App Insights alert: median >50 per user triggers scale review. Bitset option documented for MMP. |
| Tenant Resolver Precedence | Multiple resolver strategies noted but resolution precedence order not formalised. | Explicit precedence: (1) JWT tid — primary; (2) X-Tenant-Id header — admin override only; (3) subdomain — future SaaS; (4) API key — service scenarios. |

## 1.3  Why This Architecture Scales to Enterprise
Three decisions separate platforms that reach enterprise scale from those that require rewrites:
The security boundary is exclusively the API. React UI is UX convenience only. Every permission enforcement decision is made once, in IPermissionEvaluator, behind a named ASP.NET policy. No controller checks roles. No React component is a security control.
Tenancy is structural, not behavioural. TenantId is on every entity, enforced by EF Core global query filters, and resolved by TenantMiddleware before any business logic executes. Cross-tenant data leakage requires bypassing three independent structural controls.
Every external dependency is behind an interface designed for swapping. Entra, Dataverse, Redis, and Service Bus are not wired to business logic. Each swap is hours, not sprints.
## 1.4  Remaining Watch Items
These items are addressed in the roadmap but require active vigilance during execution.
Dataverse throttling under audit write load — batching strategy documented in Section 6. Must be verified under load test before enterprise onboarding.
Griffel token discipline decay — ESLint rules and axe-core CI gate address this. Requires enforcement in code review culture, not just tooling.
Bundle bloat from Fluent UI barrel imports — tree-shaking config and CI size gate in place. Monitor after each Sprint as component library grows.
MSAL Conditional Access error handling — InteractionRequiredAuthError must trigger acquireTokenRedirect(), not be swallowed. Must be explicit in MsalAuthProvider.
PermissionsVersion race window — async invalidation reduces but does not eliminate the window. Acceptable for MVP. Redis Pub/Sub eliminates it at MMP.

# Section 2 — MVP vs MMP Ruthless Cut Line
Inclusion test: "Would a Fortune 500 security officer reject the platform if this were missing?" Yes → MVP. No → MMP or later.
## 2.1  MUST Be in MVP
| Priority | Feature | Technical Non-Negotiable |
| --- | --- | --- |
| P0 | Entra SSO / Mock JWT (local) | MSAL.js PKCE in production. MockJwt middleware local. Backend JWT validation always on. Same claim shape (oid, tid) in both paths. |
| P0 | Multi-tenant data model | TenantId required column on all security entities. TenantMiddleware resolves per request from tid claim. EF Core global query filters enforce isolation. Non-negotiable from migration 001. |
| P0 | IPermissionEvaluator facade | Domain-level auth service. Policy handler is a thin 5-line adapter. All audit emission, cross-cutting rules, and instrumentation live inside the evaluator only. |
| P0 | Policy-based authorization | IAuthorizationHandler for every protected operation. [Authorize(Policy="...")] on every non-public endpoint. Zero role checks in controllers. |
| P0 | IPermissionCache interface | InMemoryPermissionCache at MVP. Interface contract locked. Redis binding is a one-line DI swap at MMP. No codebase change. |
| P0 | Async audit pipeline | Channel<T> + BackgroundService locally. Audit failures NEVER surface as API errors. Never synchronous in request path. |
| P0 | PermissionsVersion stamp | Guid on SecurityUser. Bumped on every assignment/revocation. Stamped on every AuditActionLog entry. Answers forensic permission question. |
| P0 | Authorization telemetry | Structured metric events from IPermissionEvaluator on every call: permission_code, result (allow/deny), source (cache/db), tenant, module, latency bucket. Serilog console locally; App Insights sink at MMP. |
| P0 | RoutePermissionMap | Single source of truth for all routes, nav visibility, breadcrumbs, and PermissionGuard. Defined before first page. Every new page is one ROUTE_MAP entry. |
| P0 | ClockSkew = 2 minutes | TimeSpan.FromMinutes(2) in JwtBearerOptions. Explicitly set — never rely on framework default. |
| P1 | Role & Permission CRUD | Permission code model (ROLE:CREATE not boolean flags). Full CRUD APIs behind named policies. Permission matrix seeded at startup. |
| P1 | User-Role Assignment | Assign and revoke with async cache invalidation and PermissionsVersion bump. Assignment history never hard-deleted. |
| P1 | Module Management | Soft delete (DeletedAt, not boolean). Solution hierarchy. 14 modules seeded. |
| P1 | Access Request Flow | Submit, admin notification, approve/reject with reason. Pending/Approved/Rejected status lifecycle. |
| P1 | Session + Action Audit Log Viewer | Filterable. Append-only. PermissionsVersion stamped on every action entry. |
| P1 | SCC Dashboard | KPI cards, role distribution, anomaly counts, compliance score. Chart.js registered per-component only. |
| P1 | ECC Landing Page | Locked/unlocked module grid. Access request modal. First-time user flow. |
| P1 | RBAC Regression Test Suite | Permission matrix tests: every role × every permission code, allow AND deny assertions. Part of Definition of Done from Sprint 1. Non-negotiable CI gate. |

## 2.2  Architecturally Prepared — Deferred to MMP
These are designed at MVP (interfaces, columns, seams exist) but implementations are deferred. Nothing gets retrofitted.
Redis permission cache — IPermissionCache interface and invalidation logic complete at MVP. RedisPermissionCache class (~40 lines) swaps in. Zero business logic changes.
Azure Service Bus audit pipeline — Channel<T> at local MVP. Service Bus replaces with guaranteed delivery and dead-letter queue. IAuditQueue interface unchanged.
Azure API Management — direct App Service acceptable at MVP behind Entra auth. APIM adds rate limiting per tenant, API versioning, WAF at MMP.
Azure Front Door — single-region App Service at MVP. Front Door provides global anycast, WAF (OWASP ruleset), and CDN at MMP.
SoD conflict detection engine — ISodRuleEngine interface seam and permission code model at MVP. Conflict evaluation loop and SCC surface at MMP.
Access recertification campaigns — RecertificationDueDate column on UserRoleAssignment at MVP. Campaign workflow and reviewer portal at MMP.
Audit log export (CSV/JSON) — SCC dashboard at MVP. Async compliance export job with async download link at MMP.
Redis Pub/Sub cache invalidation across instances — in-process InvalidateAsync sufficient for single-instance MVP. Pub/Sub eliminates cross-instance stale window at MMP.
GLOBAL_ADMIN JIT elevation and MFA step-up enforcement — model designed, audit flag present, session tagging documented. Entra PIM integration and Conditional Access enforcement are MMP.
Permission drift detection CI guardrail — not required for MVP. Required before enterprise scale (see §7.1.A).
## 2.3  MUST NOT Be Built Yet — Over-Engineering Traps
These are traps. Building them before MMP validation adds months of work with zero user value and introduces architectural complexity that impedes the MVP.
Custom identity provider — Entra is the IdP. No exceptions. Building a custom IdP adds months and zero enterprise credibility.
GraphQL API — REST with policy-based authorization is correct for a control plane. GraphQL authorization complexity is not justified.
Event sourcing / CQRS infrastructure — standard append-only audit tables are sufficient. Full event sourcing is weeks of infrastructure for zero additional audit value.
Microservices decomposition — a well-structured monolith is the correct MVP and MMP shape.
Real-time push notifications (SignalR / WebSockets) — polling is sufficient for admin surfaces at this scale.
Custom Griffel theme engine for white-labeling — Fluent token overrides cover all MVP and MMP needs.
Global state library (Zustand, Redux, Jotai) — React Query + Context covers all state requirements. ESLint-banned.

# Section 3 — End-to-End System Architecture
## 3.1  Layered Architecture — Definitive Reference
| Layer | Technology | Responsibility |
| --- | --- | --- |
| Browser Client | React 18 + Fluent UI v9 + MSAL/Mock Auth | UI rendering, token acquisition via PKCE, route protection via PermissionGuard, permission-gated UI via usePermission(), server state via React Query. |
| API Gateway (MMP) | Azure API Management | Rate limiting per tenant, auth header normalisation, API versioning, developer portal. Not present at MVP. |
| Application API | ASP.NET Core .NET 8 | Business logic, permission enforcement via [Authorize(Policy)], controller orchestration, data access via repositories. |
| RBAC Engine | C# Domain + Application layers | IPermissionEvaluator, PermissionContext, EvaluationResult, policy evaluation, authorization telemetry emission, audit event enqueue. |
| Tenant Resolution | TenantMiddleware + ITenantResolver | Extracts TenantId from JWT tid claim per request. Populates scoped TenantContext. Structured log scope per request. Precedence: JWT tid → X-Tenant-Id header → subdomain → API key. |
| Permission Cache | IPermissionCache → IMemoryCache (MVP) / Redis (MMP) | Sub-millisecond permission context lookup. 5-minute TTL. Invalidation triggered on every role assignment/revocation with PermissionsVersion bump. |
| Identity | Mock JWT (local) / Microsoft Entra ID (prod) | Token issuance. MFA, Conditional Access, PKCE flow. JWT carries oid and tid only — roles never in token. |
| Data Store | SQLite + EF Core (local) / Dataverse (prod) | Roles, users, assignments, modules, audit. EF Core global query filters enforce TenantId and soft delete. Audit repos expose Add() only. |
| Audit Pipeline | Channel<T> + BackgroundService (MVP) / Service Bus (MMP) | Async, fire-and-forget from IPermissionEvaluator. Audit failures never surface as API errors. Append-only writes. |
| Secrets | dotnet user-secrets (local) / Azure Key Vault (prod) | Connection strings, signing keys, Entra client secrets. Never in source. Key Vault with Managed Identity in production. |
| Observability | Serilog console (local) / App Insights (prod) | Structured logging, authorization telemetry, RBAC denial events, request tracing. TenantId in every log scope. |

## 3.2  Complete Request Flow — Step by Step
### Authentication Path
Local: user selects persona on login page → POST /api/auth/mock-login → Backend issues JWT signed with local HMAC key → Token stored in sessionStorage.
Production: MSAL.js initiates Entra ID redirect → PKCE flow with code_verifier/code_challenge → Access token returned → Stored in sessionStorage (MSAL default — do not change).
Both: Token attached as Bearer header on every API request via Axios request interceptor. Token refresh handled silently by MSAL; acquireTokenRedirect() on InteractionRequiredAuthError.
### API Request Pipeline — Identical Local and Production
HTTP Request (Bearer JWT)
↓
JwtBearerMiddleware
Validates: issuer, audience, signature algorithm, expiry, not-before
ClockSkew = TimeSpan.FromMinutes(2)   ← §3.3 JWT Clock Skew Handling
On failure: 401 Unauthorized (no detail leaked)
↓
TenantMiddleware  ← LOAD-BEARING MIDDLEWARE ORDER
ITenantResolver.ResolveAsync(HttpContext)
Strategy 1: JWT tid claim → validate tenant active in DB
Strategy 2 (future): X-Tenant-Id header (admin override, elevated audit)
Strategy 3 (future): subdomain hostname
Strategy 4 (future): API key → lookup tenant
On success: TenantContext.Set(tenantId) + log scope
On failure (non-public endpoint): 400 tenant-resolution-failed
↓
[Authorize(Policy="ROLE:CREATE")]  ← named policy on every endpoint
Triggers ASP.NET Core authorization pipeline
↓
PermissionRequirementHandler (thin adapter — 5 lines)
Extracts userId from oid claim, moduleId from route/claim
Delegates to IPermissionEvaluator.EvaluateAsync()
↓
IPermissionEvaluator.EvaluateAsync(tenantId, userId, moduleId, code)
Step 1: IPermissionCache.GetAsync(tenantId, userId, moduleId)
→ cache HIT (<1ms): use cached PermissionContext
→ cache MISS: IPermissionRepository.ResolveAsync()
→ resolve active role assignments
→ expand permission codes from RolePermission table
→ union codes (additive), apply explicit denies
→ stamp PermissionsVersion from SecurityUser
→ IPermissionCache.SetAsync(ctx, TTL=5min)
Step 2: Check ADMIN:GLOBAL bypass (skips module scope check only)
Step 3: ctx.HasPermission(code) → IsGranted
Step 4: Emit authorization telemetry metric event
Step 5: IAuditQueue.Enqueue(AuditEvent) → async, never blocks
Step 6: Return EvaluationResult(IsGranted, Reason, PermissionsVersion)
↓
if (result.IsGranted):
ctx.Succeed(requirement) → Controller executes → 200 OK
else:
ctx remains not-succeeded → 403 Forbidden (ProblemDetails RFC 7807)
## 3.3  JWT Clock Skew Handling
MANDATORY: ClockSkew must be explicitly configured. Do not rely on the framework default (5 minutes — too permissive for RBAC operations).
// Program.cs — JWT Bearer configuration
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
options.TokenValidationParameters = new TokenValidationParameters
{
ValidateIssuer           = true,
ValidateAudience         = true,
ValidateLifetime         = true,
ValidateIssuerSigningKey = true,
ClockSkew                = TimeSpan.FromMinutes(2), // ← REQUIRED
// Clock skew rationale:
// Server clocks in distributed systems drift by up to 30-90 seconds.
// 2 minutes absorbs legitimate drift without permitting replayed
// near-expired tokens. Default 5 minutes is too permissive for
// RBAC operations where revocation must be near-immediate.
};
});
Why 2 minutes, not zero: NTP synchronisation is imperfect. Azure VMs and client machines legitimately drift ±60 seconds. A skew of zero produces spurious 401s under normal operation. 2 minutes is the Microsoft-standard tolerance balancing operational reliability against security posture.
Operational check: Monitor App Insights for authentication errors with "Lifetime validation failed" in structured logs. Spikes indicate clock drift exceeding tolerance — trigger a platform NTP audit.
## 3.4  Trust Boundaries
| Item | Detail |
| --- | --- |
| Browser → API | Bearer JWT. HTTPS only. Validated issuer / audience / signature / expiry / not-before. ClockSkew = 2 min. 401 on any failure — no detail leaked. |
| API → Database | Managed Identity in production. Connection string in dotnet user-secrets locally. Never in source control. Never in environment variables in production. |
| Tenant Isolation | TenantId EF Core global query filter applied in OnModelCreating. Applied before every query. Cannot be bypassed by caller code. Cross-tenant visibility is a catastrophic failure — not a bug. |
| Admin Operations | ADMIN:GLOBAL bypass is an explicit code path in IPermissionEvaluator — not an implicit escape. It emits an elevated-scope audit event with IsBreakGlass=true. Break-glass usage is always flagged. |
| API Internal Layers | IAuthorizationService — all domain operations require explicit permission check. No controller routes business logic directly without going through IPermissionEvaluator. |
| Zero Trust Posture | No implicit trust between layers. Every API call validates the full JWT regardless of origin. React UI is explicitly not a security boundary. Documented in architecture and code comments. |

## 3.5  Zero-Trust Enforcement Points (Diagram Form)
BROWSER TIER (UX boundary only — not security):
PermissionGuard → pre-flight check via PermissionContext before navigation
usePermission() → hides nav items user cannot access (UX convenience only)
AuthGuard → redirects to /login if no valid token in sessionStorage

NETWORK BOUNDARY:
HTTPS enforced at App Service / Front Door (MMP)
HSTS headers. No mixed content.

API TIER (security boundary — enforced here, not in UI):
JwtBearerMiddleware → every request authenticated
TenantMiddleware → every request scoped to tenant
[Authorize(Policy)] → every protected endpoint has a named policy
IPermissionEvaluator → single point of permission truth

DATA TIER:
EF Core global query filter → TenantId + DeletedAt enforced on all reads
Managed Identity → no passwords in connection strings
Audit repos → Add() only, no Update/Delete possible at code level

# Section 4 — RBAC Engine — Microsoft-Grade Design
This is the architectural core of the platform. Weakness here produces cascading failures that are expensive to fix under production load. Read this section before writing any auth or permission code. Every decision here is load-bearing.
## 4.1  Permission Code Model
Production RBAC evaluates against named permission codes — versioned string identifiers for discrete operations. This mirrors Microsoft Entra RBAC and Azure RBAC exactly. Boolean flags (create_permission, etc.) are BANNED in this codebase — ESLint and Roslyn analyzers enforce this.
| Item | Detail |
| --- | --- |
| Roles | ROLE:CREATE  ROLE:READ  ROLE:UPDATE  ROLE:DELETE |
| Users | USER:READ  USER:CREATE  USER:UPDATE  USER:DELETE  USER:ASSIGN_ROLE  USER:REVOKE_ROLE |
| Modules | MODULE:READ  MODULE:CREATE  MODULE:UPDATE  MODULE:DELETE |
| Audit | AUDIT:VIEW_SESSIONS  AUDIT:VIEW_ACTIONS  AUDIT:EXPORT |
| Access Requests | ACCESS_REQUEST:SUBMIT  ACCESS_REQUEST:REVIEW  ACCESS_REQUEST:RESOLVE |
| Admin | ADMIN:MODULE_SCOPED  ADMIN:GLOBAL  (break-glass session flag applied to GLOBAL) |

## 4.2  IPermissionEvaluator — The Authorization Facade
The ASP.NET Core policy handler is a 5-line adapter. All evaluation logic, audit emission, and telemetry live inside IPermissionEvaluator exclusively.
// Kernel.Application/Authorization/IPermissionEvaluator.cs
public interface IPermissionEvaluator
{
Task<EvaluationResult> EvaluateAsync(
Guid tenantId, Guid userId, Guid moduleId,
string permissionCode, CancellationToken ct = default);

Task<PermissionContext> GetContextAsync(
Guid tenantId, Guid userId, CancellationToken ct = default);
}

// Kernel.Application/Authorization/EvaluationResult.cs
public sealed record EvaluationResult(
bool IsGranted,
string PermissionCode,
string Reason,            // "CacheHit" | "Resolved" | "Denied" | "GlobalAdmin"
DateTimeOffset EvaluatedAt,
Guid PermissionsVersion,  // stamped on every AuditActionLog entry
string Source,            // "cache" | "db" — feeds telemetry
long LatencyMs            // feeds latency bucket telemetry
);
// Kernel.Infrastructure/Authorization/PermissionEvaluator.cs
public class PermissionEvaluator : IPermissionEvaluator
{
private readonly IPermissionCache _cache;
private readonly IPermissionRepository _repo;
private readonly IAuditQueue _audit;
private readonly IAuthTelemetry _telemetry;
private readonly ILogger<PermissionEvaluator> _log;

public async Task<EvaluationResult> EvaluateAsync(
Guid tenantId, Guid userId, Guid moduleId, string code, CancellationToken ct)
{
var sw = Stopwatch.StartNew();

// 1. GLOBAL_ADMIN bypass — explicit code path, elevated audit
var isGlobalAdmin = await _cache.IsGlobalAdminAsync(tenantId, userId);
if (isGlobalAdmin)
{
EmitTelemetry("GlobalAdmin", tenantId, moduleId, code, true, "cache", sw.ElapsedMilliseconds);
_audit.Enqueue(new AuditEvent(tenantId, userId, moduleId, code, "Success",
Guid.Empty, "Source=GlobalAdmin IsBreakGlass=true"));
return new EvaluationResult(true, code, "GlobalAdmin",
DateTimeOffset.UtcNow, Guid.Empty, "cache", sw.ElapsedMilliseconds);
}

// 2. Try permission cache
var ctx = await _cache.GetAsync(tenantId, userId, moduleId);
var source = "cache";

// 3. Cache miss: resolve from repository
if (ctx is null)
{
ctx = await _repo.ResolveAsync(tenantId, userId, moduleId, ct);
await _cache.SetAsync(tenantId, userId, moduleId, ctx, TimeSpan.FromMinutes(5));
source = "db";
}

// 4. Evaluate — future: apply SoD rules here via ISodRuleEngine
var granted = ctx.HasPermission(code);
var reason  = granted ? source : "Denied";

// 5. Emit structured authorization telemetry (separate from audit)
EmitTelemetry(reason, tenantId, moduleId, code, granted, source, sw.ElapsedMilliseconds);

// 6. Enqueue audit event — fire-and-forget, never throws
_audit.Enqueue(new AuditEvent(tenantId, userId, moduleId, code,
granted ? "Success" : "Denied", ctx.PermissionsVersion, $"Source={source}"));

return new EvaluationResult(granted, code, reason,
DateTimeOffset.UtcNow, ctx.PermissionsVersion, source, sw.ElapsedMilliseconds);
}
}

// Policy handler — thin adapter (5 lines of business logic)
protected override async Task HandleRequirementAsync(
AuthorizationHandlerContext ctx, PermissionRequirement req)
{
var result = await _evaluator.EvaluateAsync(
_tenant.TenantId, ctx.User.GetUserId(), ctx.User.GetModuleId(), req.Code);
if (result.IsGranted) ctx.Succeed(req);
// Denied: ctx remains not-succeeded → 403 returned automatically
}
## 4.3  IPermissionEvaluator — What It Unlocks
| Item | Detail |
| --- | --- |
| Testable in isolation | Unit test IPermissionEvaluator with mocked IPermissionCache and IPermissionRepository. No ASP.NET Core required. 100x faster than integration tests. |
| Background job support | Inject IPermissionEvaluator into any BackgroundService. No HttpContext dependency. Background RBAC checks identical to HTTP checks. |
| SoD rules home | Inject ISodRuleEngine inside EvaluateAsync at MMP. The policy handler never knows it exists. One place for all cross-cutting auth rules. |
| Time-bound access | Check UserRoleAssignment.DisabledAt inside EvaluateAsync. One place, always enforced, across all callers. |
| Authorization telemetry | IAuthTelemetry emits structured metric events per evaluation. Feeds App Insights, KQL anomaly detection, Defender for Cloud integrations. |
| Break-glass audit | GLOBAL_ADMIN path emits elevated audit event with IsBreakGlass=true flag. Never invisible in audit trail. Queryable separately. |

## 4.4  Permission Resolution Order
Resolve all active (IsActive=true, DisabledAt=null) UserRoleAssignments for (tenantId, userId, moduleId).
For each role, expand permission codes from RolePermission join via PermissionCode table.
Union all codes across roles (roles are additive, not override).
Apply explicit deny rules: if IsGranted=false on any RolePermission, that code is denied regardless of other roles.
Check ADMIN:GLOBAL bypass before module-scoped resolution — bypasses module scope check only, still audit-logged.
Stamp PermissionsVersion from SecurityUser.PermissionsVersion on the resulting PermissionContext.
Cache the PermissionContext keyed by (tenantId:userId:moduleId) with 5-minute TTL.
Return EvaluationResult with IsGranted, Reason, PermissionsVersion, Source, LatencyMs.
## 4.5  IPermissionCache — Two-Level Design
| Stage | Implementation | Behaviour |
| --- | --- | --- |
| Local MVP | InMemoryPermissionCache via IMemoryCache | 5-minute TTL. Invalidated on role change within the same process. Sufficient for single-instance dev. |
| MMP Phase 1 | RedisPermissionCache via StackExchange.Redis (~40 lines) | 5-minute TTL cross-instance. Same IPermissionCache interface. One DI line change. Zero business logic change. |
| MMP Phase 2 | Redis Pub/Sub cache invalidation | Immediate invalidation propagation across all instances. Eliminates stale-permission window under concurrent revocation. |

// Kernel.Application/Authorization/IPermissionCache.cs
public interface IPermissionCache
{
Task<PermissionContext?> GetAsync(Guid tenantId, Guid userId, Guid moduleId);
Task SetAsync(Guid tenantId, Guid userId, Guid moduleId, PermissionContext ctx, TimeSpan ttl);
Task InvalidateAsync(Guid tenantId, Guid userId);      // called on every role change
Task<bool> IsGlobalAdminAsync(Guid tenantId, Guid userId); // fast-path check
}
## 4.5.1  Permission Cache Cold-Start & Stampede Protection
Cold-start stampede is the most dangerous cache risk in a RBAC platform. A deployment, cache flush, Redis failover, or large tenant onboarding can produce a burst of concurrent cache misses that overwhelm the database. The architecture must be designed to absorb this now — not retrofitted under production pressure.
### Stampede Scenarios Requiring Mitigation
| Item | Detail |
| --- | --- |
| Deployment restart | All in-process IMemoryCache entries evicted. First 30–60 seconds: every request is a cache miss. DB load spikes. |
| Cache flush / Redis failover | Entire permission cache evicted simultaneously. All tenants cold-start concurrently. |
| Large tenant onboarding | 500+ users all authenticate for the first time within minutes. 500 simultaneous cache miss → DB resolution bursts. |
| PermissionsVersion bump | Bulk role revocation (org restructure) invalidates cache entries for hundreds of users simultaneously. |

### MVP Mitigation Strategy (Required)
Monitor cache miss burst rate as a structured log metric from IPermissionEvaluator. Alert if cache misses exceed 50/second for more than 30 seconds.
Ensure IPermissionRepository query path (UserRoleAssignment covering index) can sustain burst DB load. Load-test before production deploy.
Log PermissionContext.PermissionCount per user on every DB resolution to detect context growth trends early.
### MMP Mitigation Strategy (Prepared, Not Built at MVP)
Request coalescing (preferred approach): when multiple concurrent requests miss cache for the same (tenantId, userId, moduleId), only one DB resolution executes. All waiters receive the same result. Implement via SemaphoreSlim keyed by cache key. Zero duplicate DB calls under stampede.
Jittered TTL: add ±30 seconds random jitter to the 5-minute TTL. Prevents synchronised expiry of entries populated together (e.g., at tenant onboarding).
Soft TTL refresh: entries are refreshed asynchronously when they reach 75% of TTL. The cache never expires under steady traffic — only after genuine inactivity.
Per-user lock during DB resolution: SemaphoreSlim(1,1) per (tenantId, userId) ensures that a user authenticated across multiple instances does not trigger N parallel DB calls.
Architecture is prepared now. MMP implementation is a ~4-hour addition to PermissionEvaluator with no interface changes.
## 4.6  PermissionContext with Version Stamp
// Kernel.Application/Authorization/PermissionContext.cs
public sealed class PermissionContext
{
public Guid TenantId { get; init; }
public Guid UserId { get; init; }
public Guid ModuleId { get; init; }
public ImmutableHashSet<string> PermissionCodes { get; init; }
public Guid PermissionsVersion { get; init; }       // bumped on every role change
public DateTimeOffset LastEvaluatedAt { get; init; }
public int PermissionCount => PermissionCodes.Count; // monitor for growth

public bool HasPermission(string code) => PermissionCodes.Contains(code);

// Used by GetContextAsync for /me/permissions spanning all modules
public static PermissionContext Merge(IEnumerable<PermissionContext> contexts)
{
var all = contexts.ToList();
return new PermissionContext
{
PermissionCodes = all.SelectMany(c => c.PermissionCodes).ToImmutableHashSet(),
PermissionsVersion = all.Max(c => c.PermissionsVersion),
LastEvaluatedAt = DateTimeOffset.UtcNow
};
}
}
PermissionsVersion is generated (Guid.NewGuid()) on every UserRoleAssignment create/disable and stored on the SecurityUser entity. Every AuditActionLog entry carries this version, answering the forensic compliance question: "What permission set was active when this action was taken?"
## 4.7  GLOBAL_ADMIN Handling and Blast Radius Rules
GLOBAL_ADMIN Invariants — Absolute and Non-Negotiable. These invariants must be enforced structurally in IPermissionEvaluator, not by convention.
| Item | Detail |
| --- | --- |
| BYPASSES module scope | ADMIN:GLOBAL grants access across all modules within a tenant without module-scoped evaluation. |
| NEVER bypasses tenant boundary | A GLOBAL_ADMIN in Tenant A cannot access Tenant B data. TenantId filter at data layer is not overridden. |
| NEVER bypasses soft delete | Soft-deleted entities remain invisible to GLOBAL_ADMIN. EF Core global query filter is not overridden. |
| NEVER bypasses audit | Every GLOBAL_ADMIN evaluation emits IsBreakGlass=true AuditEvent. This cannot be suppressed by any code path. |
| NEVER bypasses authentication | GLOBAL_ADMIN is not a superuser that bypasses JWT validation. Authentication succeeds or fails independently. |

### 4.7.1  Abuse Scenarios Prevented
| Item | Detail |
| --- | --- |
| Lateral tenant movement | An attacker compromises a GLOBAL_ADMIN account. NEVER bypasses tenant boundary prevents cross-tenant data access. Impact contained to one tenant. |
| Soft-delete evasion | Escalated admin attempts to access soft-deleted records to recover sensitive data. NEVER bypasses soft delete prevents this. |
| Audit blind spot | Admin performs privileged operations expecting no audit trail. NEVER bypasses audit ensures every GLOBAL_ADMIN action is logged with IsBreakGlass=true. |
| Unauthenticated admin bypass | Attacker tries to forge GLOBAL_ADMIN claim. NEVER bypasses authentication means JwtBearerMiddleware rejects the request at 401 before RBAC evaluation. |

### Break-Glass Audit Controls
| Item | Detail |
| --- | --- |
| Audit flag | Every GLOBAL_ADMIN evaluation emits AuditEvent with IsBreakGlass=true. Queryable in SCC dashboard filtered view. Cannot be suppressed. |
| Elevated session tag | Session tagged with ElevatedAccess=true when GLOBAL_ADMIN bypass triggered. Visible in AuditSession record. |
| Dedicated audit stream | GLOBAL_ADMIN audit events routed to dedicated high-priority audit channel. Never batched or delayed. |
| MFA enforcement (MMP) | Entra Conditional Access policy requires step-up MFA for GLOBAL_ADMIN claim. Designed now; enforced at MMP. |
| JIT elevation (MMP) | Mirrors Entra PIM. Time-limited GLOBAL_ADMIN elevation with automated expiry. Designed now; implemented at MMP. |

## 4.8  PermissionContext Size Risk — Monitoring Plan
The union-of-roles model with ImmutableHashSet is correct for MVP. At enterprise scale, permission sets may grow. This has caused real performance cliffs in Microsoft-internal platforms.
Log PermissionContext.PermissionCount per user on every DB resolution as a structured log field.
Set App Insights alert: median permission count > 50 per user in any tenant triggers a scale review.
Backlog item (MMP): evaluate bitset representation or compressed permission map if median exceeds 100 codes.
Monitor IPermissionCache.GetAsync latency. If P99 > 5ms under load, Redis upgrade is mandatory.
## 4.9  Authorization Telemetry Contract
Separate from audit. Audit answers "what happened". Telemetry answers "what is trending wrong". Both are required for a Microsoft-grade control plane.
// Kernel.Application/Authorization/IAuthTelemetry.cs
public interface IAuthTelemetry
{
void RecordPermissionEvaluation(PermissionMetricEvent evt);
}

public sealed record PermissionMetricEvent
{
public string PermissionCode { get; init; }
public string Result { get; init; }         // "allow" | "deny"
public string Source { get; init; }         // "cache" | "db"
public Guid TenantId { get; init; }
public Guid ModuleId { get; init; }
public string LatencyBucket { get; init; }  // "<1ms" | "<10ms" | ">=10ms"
}

// KQL query — detect anomalous denial spikes
// customEvents
// | where name == "permission.evaluation"
// | where tostring(customDimensions.result) == "deny"
// | summarize DenyCount=count() by bin(timestamp, 5m),
//             tostring(customDimensions.permissionCode)
// | where DenyCount > 100
## 4.10  Common RBAC Failure Modes — Explicit Avoidance
| Mistake | Why It Breaks | Correct Pattern — Enforced Here |
| --- | --- | --- |
| Roles in JWT claims | Revoked role persists for up to 1 hour until token expiry. Permission revocation is invisible to the system. | JWT carries only oid and tid. Roles resolved from cache per request. Revocation is immediate. |
| Role checks in React | UI bypass via browser console. No security guarantee. The API continues to accept requests. | usePermission() for UX convenience only. API enforcement is the only security control. Documented in code. |
| No GLOBAL_ADMIN escape | Platform admins cannot perform break-glass operations. Operational crisis becomes architectural crisis. | ADMIN:GLOBAL bypass is explicit, audited, and controlled. Never implicit. |
| Audit on success only | Denials are the most security-relevant events. They disappear from the audit trail. | Every EvaluateAsync call emits an audit event regardless of outcome. Denials are priority-flagged. |
| No RBAC regression tests | Role model changes silently break permission logic. Discovered in production under customer pressure. | Permission matrix tests: every role × every code, allow AND deny assertions. Sprint 1. Non-negotiable CI gate. |
| Synchronous audit | Audit write failures break business operations. Audit latency adds to every API response time. | Async audit pipeline. IAuditQueue.Enqueue() never throws. Failures are logged, not propagated. |
| RoutePermissionMap drift | Permission code removed from API, route map not updated. Silent security gap introduced. | CI validation: every permission code must appear in ROUTE_MAP or API-only manifest. Build fails on violation. |

## 4.11  Authorization Budget SLO — Hard Latency Contract
RBAC evaluation sits in the critical path of every protected API request. Without a hard latency budget, authorization silently becomes the dominant contributor to API response time. This SLO is a first-class engineering commitment — not a monitoring aspiration.
### 4.11.1  Authorization Budget — Hard SLO
| Metric | Target | Alert Threshold | On Violation |
| --- | --- | --- | --- |
| P50 — permission evaluation (cache path) | < 1 ms | ≥ 2 ms | Log warning, review cache config |
| P99 — permission evaluation (cache path) | < 5 ms | ≥ 10 ms | Alert ops team |
| P99 — permission evaluation (DB path) | < 50 ms | ≥ 100 ms | Alert + create incident ticket |
| Cache path percentage | ≥ 95% of evaluations | < 90% | Alert — cache miss rate investigation |

### 4.11.2  Performance Review Gate
If P99 cache-path authorization latency exceeds 10ms for two consecutive weeks OR cache dominance drops below 90% for any 24-hour period, a mandatory Performance Review Gate is triggered. Engineering must present root cause analysis and remediation plan before new feature work resumes.
### 4.11.3  App Insights / KQL Monitoring
// KQL — Authorization latency distribution by source
customMetrics
| where name == "rbac.evaluation.latency"
| extend source = tostring(customDimensions.source)
| summarize
P50=percentile(value, 50),
P99=percentile(value, 99)
by bin(timestamp, 5m), source
| where P99 > 10 and source == "cache"    // alert threshold

// KQL — Cache miss rate trend
customMetrics
| where name == "rbac.evaluation.latency"
| extend source = tostring(customDimensions.source)
| summarize CacheHits=countif(source=="cache"), Total=count() by bin(timestamp, 1h)
| extend CachePct = 100.0 * CacheHits / Total
| where CachePct < 90    // alert threshold

# Section 5 — Frontend Architecture — Fluent + Griffel Discipline
The bar is Microsoft Entra Admin Center UX quality. Every decision is evaluated against that standard.
## 5.1  Technology Stack — Locked
| Package | Version | Purpose & Constraint |
| --- | --- | --- |
| react + react-dom | 18.2.0 | Core framework. Concurrent features enabled. StrictMode in development. |
| typescript | 5.x strict | Strict mode. noImplicitAny. No `any` casts without explicit TODO comment + ticket. |
| vite | 5.x | Build tool, dev server, HMR, code splitting. Bundle analysis in CI. |
| @fluentui/react-components | 9.x | ALL UI components from this package only. No third-party UI libraries. No HTML-native styled elements. |
| @griffel/react | Latest | PRIMARY styling system. makeStyles() is the only approved CSS authoring method. |
| react-router-dom | 6.x | SPA routing. Lazy loading via React.lazy() and Suspense on every page chunk. |
| @tanstack/react-query | 5.x | All server state. Fetching, caching, invalidation. No manual fetch + useState for server data. |
| axios | 1.x | HTTP client. Auth header interceptor. No fetch() for API calls. |
| zod | 3.x | Runtime validation of API response shapes. Every API response validated against schema. |
| chart.js + react-chartjs-2 | 4.x / 5.x | SCC dashboard charts. Register ONLY used components — do not import Chart from "chart.js". |
| clsx | 2.x | Conditional class composition for non-Griffel cases (Fluent component className prop). |
| ❌ Zustand / Redux / Jotai | BANNED | ESLint no-restricted-imports error. React Query + Context covers all state requirements. |
| ❌ FontAwesome | BANNED | Fluent System Icons only. Use @fluentui/react-icons package. |

## 5.2  App Shell Component Tree
main.tsx
<QueryClientProvider client={queryClient}>
<FluentProvider theme={webLightTheme}>
<AuthProvider>          // env-driven: MockAuthProvider | MsalAuthProvider
<PermissionProvider>  // fetches /api/auth/me/permissions on login
<RouterProvider>
<AuthGuard>       // redirects to /login if no valid token
<AppLayout>     // NavRail + TopBar + main content area
<Suspense fallback={<PageSkeleton />}>
<Outlet />  // lazy-loaded page component
</Suspense>
</AppLayout>
</AuthGuard>
</RouterProvider>
</PermissionProvider>
</AuthProvider>
</FluentProvider>
</QueryClientProvider>
## 5.3  Auth Provider Abstraction
// src/auth/AuthContext.tsx — the contract both providers implement
export interface AuthContextValue {
user: AuthUser | null;
token: string | null;
login: (email?: string) => Promise<void>; // email param used by mock only
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

// main.tsx — env-driven switch, zero component changes required
const AuthProvider = import.meta.env.VITE_AUTH_MODE === 'mock'
? MockAuthProvider // calls POST /api/auth/mock-login
: MsalAuthProvider; // wraps useMsal(), acquireTokenSilent(), PKCE
## 5.4  PermissionProvider
// src/auth/PermissionProvider.tsx
export interface PermissionContextValue {
permissions: Set<string>;
isLoading: boolean;
hasPermission: (code: string) => boolean;
}

export function PermissionProvider({ children }) {
const { isAuthenticated } = useAuth();
const { data, isLoading } = useQuery({
queryKey: ['me', 'permissions'],
queryFn: () => authApi.getMyPermissions(), // GET /api/auth/me/permissions
enabled: isAuthenticated,
staleTime: 5 * 60 * 1000, // 5 minutes — matches backend cache TTL
});
const permissions = new Set(data?.permissionCodes ?? []);
return (
<PermissionContext.Provider value={{
permissions, isLoading, hasPermission: (code) => permissions.has(code),
}}>
{children}
</PermissionContext.Provider>
);
}

// Hook used in components
export const usePermission = (code: string): boolean => {
const { hasPermission } = usePermissionContext();
return hasPermission(code);
};
## 5.5  State Ownership — Hard Rules
| Quadrant | Tool | Owns | Must NOT Own |
| --- | --- | --- | --- |
| Server State | React Query | API data: roles, users, assignments, audit logs, SCC stats | Auth state, UI open/close, permission codes |
| Auth State | AuthContext | token, user identity, isAuthenticated, isLoading | Server data, permission codes, UI state |
| Permission State | PermissionContext | Set<string> of permission codes, permissions loading flag | User identity, server data, UI state |
| Ephemeral UI State | useState / useReducer | Modal open, form values, active tab, accordion state | Anything from the server or auth system |

There is no fifth category. If state does not fit one of these four quadrants, fix the design before adding state. No global state library (Zustand, Redux, Jotai) is permitted. ESLint no-restricted-imports blocks these. After any mutation: invalidate React Query keys. Never manually synchronise local state.
## 5.6  RoutePermissionMap — Single Source of Truth
// src/shell/RoutePermissionMap.ts
export interface RouteDefinition {
path: string;
pageKey: string;
label: string;
icon: string;           // Fluent System Icon name only
navSection: NavSection;
requiredPermission: string | null;  // null = public
showInNav: boolean;
}

export const ROUTE_MAP: RouteDefinition[] = [
{ path: '/login',            pageKey: 'login',              label: 'Sign In',
icon: '',                  navSection: 'none',            requiredPermission: null,                   showInNav: false },
{ path: '/ecc',              pageKey: 'ecc',                label: 'Enterprise Control Centre',
icon: 'GridRegular',       navSection: 'ecc',             requiredPermission: null,                   showInNav: false },
{ path: '/kernel',           pageKey: 'kernel-dashboard',   label: 'Kernel Dashboard',
icon: 'HomeRegular',       navSection: 'security',        requiredPermission: 'MODULE:READ',          showInNav: true },
{ path: '/modules',          pageKey: 'module-mgmt',        label: 'Module Management',
icon: 'AppsRegular',       navSection: 'security',        requiredPermission: 'MODULE:READ',          showInNav: true },
{ path: '/roles',            pageKey: 'role-mgmt',          label: 'Role Management',
icon: 'ShieldRegular',     navSection: 'security',        requiredPermission: 'ROLE:READ',            showInNav: true },
{ path: '/users',            pageKey: 'user-profile',       label: 'User Profiles',
icon: 'PeopleRegular',     navSection: 'security',        requiredPermission: 'USER:READ',            showInNav: true },
{ path: '/assignments',      pageKey: 'user-role-assign',   label: 'Role Assignments',
icon: 'PersonArrowRightRegular', navSection: 'security',  requiredPermission: 'USER:ASSIGN_ROLE',     showInNav: true },
{ path: '/scc',              pageKey: 'scc-dashboard',      label: 'Security Control Centre',
icon: 'DataTrendingRegular', navSection: 'security',      requiredPermission: 'AUDIT:VIEW_SESSIONS',  showInNav: true },
{ path: '/audit',            pageKey: 'audit-logs',         label: 'Audit Logs',
icon: 'ClipboardTaskListRegular', navSection: 'security', requiredPermission: 'AUDIT:VIEW_SESSIONS',  showInNav: true },
{ path: '/access-requests',  pageKey: 'admin-access-requests', label: 'Access Requests',
icon: 'KeyRegular',        navSection: 'governance',      requiredPermission: 'ACCESS_REQUEST:REVIEW', showInNav: true },
{ path: '/request-access',   pageKey: 'access-request',    label: 'Request Access',
icon: '',                  navSection: 'none',            requiredPermission: null,                   showInNav: false },
{ path: '/forbidden',        pageKey: 'forbidden',          label: 'Access Denied',
icon: '',                  navSection: 'none',            requiredPermission: null,                   showInNav: false },
];
## 5.7  Griffel Styling Rules — Non-Negotiable
| Rule | Required Pattern | Banned |
| --- | --- | --- |
| Colors | tokens.colorBrandBackground, tokens.colorNeutralForeground1, tokens.colorNeutralBackground1 | Any hex value (#RRGGBB) in makeStyles(). Any named color string. |
| Spacing | tokens.spacingVerticalM, tokens.spacingHorizontalL, tokens.spacingVerticalS | "16px", "1rem", any px/rem values in makeStyles() |
| Typography | tokens.fontSizeBase300, tokens.fontWeightSemibold, tokens.lineHeightBase300 | "bold", hardcoded font sizes, "font-size: 16px" |
| Conditional classes | mergeClasses(styles.base, isActive && styles.active) | Template literals for class names. Inline style={{}} on any element. |
| makeStyles() location | Module level, outside component function body | Inside component function body — recreated on every render. |
| Inline styles | Never | style={{ }} on any element, under any circumstance. |
| CSS Modules | Rare escape hatch for third-party component overrides only | Primary styling method. Never for new components. |

## 5.8  MSAL Integration Rules
Never store access tokens in localStorage. MSAL defaults to sessionStorage — accept this default. localStorage is XSS-accessible.
acquireTokenSilent() throws InteractionRequiredAuthError on Conditional Access policy changes. Handle it with acquireTokenRedirect(). Never swallow this error.
MSAL instance created once at application root. Re-creating it produces duplicate token cache entries and authentication loops.
Logout: msalInstance.logoutRedirect(). Clearing local state without this leaves the Entra session active. Users can re-authenticate without MFA.
Token expiry: MSAL handles silent refresh. Do not implement a custom timer. Do not read token expiry claims in application code.
## 5.9  Large Table Performance
Virtualisation: use @tanstack/react-virtual for any table that may exceed 100 rows. Do not wait for user complaints.
Server-side pagination: all list APIs accept page/pageSize parameters. Default page size: 25. Maximum: 100.
Debounced search: 300ms debounce on all filter inputs. Cancel in-flight React Query requests on new input.
Column sorting: server-side. Sort state in URL params (useSearchParams). Bookmarkable and shareable.
Column widths: fixed via Griffel. No layout shift on data load. Use skeleton loaders matching the exact column layout.
## 5.10  Bundle Strategy
Shell bundle < 100KB gzipped. Enforced as a CI gate. Build fails on violation.
No page chunk > 200KB gzipped. Every page is React.lazy() + Suspense.
Chart.js: register only used components. Never import Chart from "chart.js" (entire library). Use named imports.
Fluent UI: import from @fluentui/react-components per component, not barrel. Tree-shaking configured in vite.config.ts.
Bundle analysis: vite-bundle-visualizer runs in CI on every build. Size regressions are flagged and reviewed.

# Section 6 — Dataverse & Data Model
## 6.1  Entity Model — Canonical Reference
| Entity | Key Properties | Notes |
| --- | --- | --- |
| Tenant | TenantId (Guid PK), TenantCode, EntraObjectId, IsActive, CreatedAt | Seeded with 2 test tenants. EntraObjectId links to Entra tenant GUID for production promotion. |
| SecurityUser | UserId, TenantId, EntraObjectId, DisplayName, Email, OrgRole, ManagerEmail, IsActive, PermissionsVersion (Guid), CreatedAt, DeletedAt | PermissionsVersion bumped on every role change. EntraObjectId = oid claim. Soft delete via DeletedAt. |
| SolutionModule | ModuleId, TenantId, SolutionCode, ModuleCode, ModuleName, IsActive, Version, DeletedAt | Seeded with 14 modules. Soft delete. Version field for module versioning at MMP. |
| PermissionCode | CodeId, Code (e.g. ROLE:CREATE), Category, Description, IsActive | Global, not tenant-scoped. Seeded at startup. Drives RBAC regression test generation. |
| SecurityRole | RoleId, TenantId, ModuleId, RoleCode, RoleName, IsSystemRole, IsActive, DeletedAt | VIEWER / CONTRIBUTOR / COLLABORATOR / ADMIN / GLOBAL_ADMIN. IsSystemRole prevents accidental deletion. |
| RolePermission | Id, RoleId, PermissionCodeId, IsGranted (bool) | IsGranted supports explicit deny (false) — deny overrides any grant from other roles. |
| UserRoleAssignment | Id, TenantId, UserId, ModuleId, RoleId, AssignedAt, AssignedBy, Reason, DisabledAt, IsActive, RecertificationDueDate | Never hard-deleted. DisabledAt for revocation. RecertificationDueDate column present at MVP for MMP campaign feature. |
| AccessRequest | Id, TenantId, ModuleId, RequesterUserId, Reason, Justification, Status, CreatedAt, ResolvedAt, ResolvedBy | Status: Pending / Approved / Rejected. ResolvedBy for accountability trail. |
| AuditSession | Id, TenantId, UserId, ModuleId, StartTime, EndTime, IpAddress, UserAgent, IsSuccess, ElevatedAccess | Append-only. ElevatedAccess=true when GLOBAL_ADMIN bypass triggered in session. |
| AuditActionLog | Id, TenantId, UserId, ModuleId, ActionName, PermissionCode, Status, Timestamp, PermissionsVersion, IsBreakGlass, Info | Append-only. PermissionsVersion stamped on every entry. IsBreakGlass=true for GLOBAL_ADMIN evaluations. |

## 6.2  Indexing Strategy — Mandatory Before Production
| Entity | Index | Query Pattern |
| --- | --- | --- |
| All security entities | Composite: (TenantId, EntityId) — enforced as primary key pattern | Primary access pattern. Cross-tenant query is impossible without explicit bypass. |
| UserRoleAssignment | Covering: (TenantId, UserId, ModuleId, IsActive) | Hot path for permission resolution. Every EvaluateAsync call that misses cache hits this index. |
| AuditActionLog | (TenantId, Timestamp DESC) | Recency-ordered audit queries within tenant. Pagination on this index. |
| AuditActionLog | (TenantId, UserId, Timestamp DESC) | User-specific action history for compliance officer queries. |
| AuditSession | (TenantId, UserId, StartTime DESC) | User session history. Session search in SCC dashboard. |
| AccessRequest | (TenantId, Status, ModuleId) | Admin inbox queries. Pending requests by module. |

## 6.3  Soft Delete Model — Authoritative Rules
Every entity uses DeletedAt (nullable DateTimeOffset) + DeletedByUserId. Never a boolean IsDeleted column.
EF Core global query filter in OnModelCreating: .HasQueryFilter(e => e.DeletedAt == null && e.TenantId == _tenant.TenantId)
Audit repositories: .IgnoreQueryFilters() applied explicitly for forensic queries. Soft delete never applied to audit tables.
Role assignments use DisabledAt, not DeletedAt. Revoked assignment stays in history. Hard deletion is never performed on assignments.
IsSystemRole = true on built-in roles: soft delete is rejected at the service layer with a domain exception.
## 6.4  Audit Strategy
Audit records are append-only. AuditRepository exposes Add() only. No Update() or Delete() methods on audit repositories at any layer.
Every AuditActionLog entry carries PermissionsVersion — the exact permission snapshot active at time of action.
Retention: action logs 7 years, session logs 2 years (enterprise compliance baseline). Configurable per tenant at MMP.
Async pipeline ensures audit failures never surface as API errors. IAuditQueue.Enqueue() is fire-and-forget inside IPermissionEvaluator.
Audit batching at MMP: audit writes are batched (10–20 events per Dataverse call, not 1:1) to avoid service protection throttling.
## 6.5  SQLite Parity Rules
SQLite entity column names and data types are designed to match Dataverse table structures exactly. When Dataverse repositories are implemented, the domain entities require zero changes.
Column naming: use Dataverse logical names (all lowercase, underscored). No EF Core property convention renaming.
Guid primary keys match Dataverse record ID format. No auto-increment integer IDs.
DateTimeOffset stored as TEXT in SQLite ISO 8601 format. Dataverse DateTime fields normalise on read.
No SQLite-specific features: no partial indexes, no JSON columns. Stick to ANSI SQL that Dataverse supports.
## 6.6  Dataverse Pitfalls — Explicit Avoidance
| Item | Detail |
| --- | --- |
| Querying without indexes under load | Indexing strategy above is mandatory before any Dataverse connection. No "we'll add indexes later". |
| Dataverse throttling (service protection limits) | IPermissionCache prevents per-request Dataverse hits. Audit pipeline batches writes. No 1:1 API call per permission check. |
| Logical vs display name confusion | Repository layer normalises all column references to logical names. Display names never appear in query code. |
| Cascade delete removing audit records | Map all Dataverse relationship cascade behaviours explicitly. Audit tables: RestrictCascade or NoCascade. Never DeleteCascade. |
| Real-time RBAC evaluation against Dataverse | IPermissionCache is the sole reason this is acceptable at all. Evaluating permissions from Dataverse directly on every API call produces 50–200ms per call and triggers throttling under enterprise load. |

# Section 7 — DevSecOps & Quality Strategy
## 7.1  CI Pipeline Stages — Required Gates
| Stage | Tool | Gate (fails build on violation) |
| --- | --- | --- |
| Secret scanning | Gitleaks / pre-commit hook | Blocks commits containing secrets, credentials, connection strings, or API keys. |
| Static analysis (backend) | Roslyn analyzers + nullable refs | Zero CS8600 nullable dereference warnings. Zero security hotspots from analyzer ruleset. |
| Frontend type check | tsc --noEmit (strict) | Zero TypeScript errors. No any casts without explicit suppression comment. |
| ESLint | @typescript-eslint + custom rules | Zero errors. No hardcoded style values. No banned imports (Zustand, Redux, FontAwesome). No useState for server data. |
| RBAC unit tests | xUnit + SQLite in-memory | Permission matrix: every role × every permission code, allow AND deny. 100% of PermissionCode registry covered. |
| Integration tests | xUnit + TestServer | All endpoints: correct HTTP status for valid / invalid / unauthenticated / unauthorised requests. |
| Multi-tenant isolation tests | xUnit + TestServer | Tenant A data never visible from Tenant B token. Cross-tenant write attempts return 403. |
| RoutePermissionMap validation | Custom CI script | Every permission code in PermissionCode registry appears in ROUTE_MAP or API_ONLY_PERMISSIONS manifest. |
| Accessibility | axe-core (per page) | Zero critical or serious violations per page. High contrast mode tested. |
| Bundle size | Vite build + size check | Shell < 100KB gzipped. No page chunk > 200KB gzipped. |

## 7.1.A  Permission Drift Detection — CI Guardrail
Status: NOT REQUIRED for MVP. STRONGLY RECOMMENDED before enterprise scale. REQUIRED before Fortune 500 onboarding.
### 7.1.A.1  The Drift Problem
The RoutePermissionMap CI validation catches one class of drift: permission codes that exist in the PermissionCode registry but do not appear in ROUTE_MAP. Permission drift detection addresses the inverse problem:
| Item | Detail |
| --- | --- |
| Orphaned UI Permission | ROUTE_MAP declares requiredPermission: "ROLE:DELETE" but no API endpoint uses [Authorize(Policy="ROLE:DELETE")]. The UI hides the route, but the API is unprotected. This is a silent security gap — the most dangerous class. |
| Unused API Policy | [Authorize(Policy="AUDIT:EXPORT")] on an API endpoint but no ROUTE_MAP entry and no entry in API_ONLY_PERMISSIONS manifest. Orphaned policy — may indicate a deleted feature leaving a dangling permission check. |
| Bidirectional Mismatch | ROUTE_MAP and API use different codes for the same conceptual operation (e.g., ROUTE_MAP uses "ROLE:READ", API uses "ROLE:VIEW"). CI drift detection makes this structural. |

### 7.1.A.2  CI Check — Design Specification
# .github/workflows/permission-drift.yml
name: Permission Drift Detection
on:
pull_request:
paths:
- 'src/**/*.ts'            # RoutePermissionMap changes
- '**/Controller*.cs'      # API endpoint changes
- '**/AuthorizationPolicies.cs'

jobs:
permission-drift:
runs-on: ubuntu-latest
steps:
- name: Extract route permissions
run: node scripts/extract-route-permissions.js > /tmp/route-perms.json
- name: Extract API policies
run: dotnet script scripts/extract-api-policies.csx > /tmp/api-perms.json
- name: Compare and detect drift
run: node scripts/permission-drift-check.js --fail-on orphaned-ui,unused-api
// Drift Check Logic — Orphaned UI Detection
const routePerms = new Set(data.routePermissions);
const apiPerms   = new Set(data.apiPolicies);

const orphanedUi = [...routePerms].filter(p => !apiPerms.has(p));
const unusedApi  = [...apiPerms].filter(p => !routePerms.has(p) && !apiOnlyPerms.has(p));

if (orphanedUi.length > 0) {
console.error('DRIFT: Orphaned UI permissions (no API enforcement):', orphanedUi);
process.exit(1); // BLOCKS PR MERGE
}
## 7.2  RBAC Regression Test Suite — Sprint 1 Deliverable
Non-Negotiable — Part of Definition of Done from Sprint 1. This is the most important quality investment in the codebase. Adding a new permission code without a corresponding test pair FAILS THE BUILD.
Required test categories:
Role-permission matrix: positive (allow) AND negative (deny) per role/code pair — every role × every code.
Role assignment: assigning a role produces correct effective permission set in cache and API.
Role revocation: revoking clears cache, subsequent API calls denied.
Multi-tenant isolation: Tenant A assignments never influence Tenant B resolution.
PermissionsVersion: bumped on every assignment change, new version in EvaluationResult.
GLOBAL_ADMIN bypass: GLOBAL_ADMIN can access all codes, elevated audit event emitted.
Break-glass audit: GLOBAL_ADMIN evaluations produce IsBreakGlass=true in AuditActionLog.
## 7.3  Environment Promotion
| Environment | Trigger | What Changes |
| --- | --- | --- |
| Local Dev | Manual (dotnet watch run) | SQLite, Mock JWT, IMemoryCache, Serilog console, dotnet user-secrets |
| CI/CD | PR merge / push to main | Same as local but SQLite in-memory, test secrets from pipeline vault |
| Staging | Merge to release branch | Entra ID (staging app registration), Dataverse (dev environment), Redis, Key Vault |
| Production | Manual approval gate | Entra ID (production), Dataverse (production), Redis, Service Bus, App Insights, Front Door |

## 7.4  Secret Management
| Item | Detail |
| --- | --- |
| Local development | dotnet user-secrets (outside source tree). Never in appsettings.json. Never in .env files committed to source. |
| CI/CD | Secrets in pipeline vault (GitHub Secrets / Azure DevOps variable groups). Never in pipeline YAML. Never in build artifacts. |
| Production | Azure Key Vault with Managed Identity. @Microsoft.KeyVault() reference syntax in App Service configuration. No connection string in App Service settings. |

## 7.5  Observability Strategy
Structured logging via Serilog with JSON output in all environments. Every log line includes TenantId in scope from TenantMiddleware.
Authorization telemetry (IAuthTelemetry): permission evaluations emitted as custom events. Separate from audit log. KQL-queryable in App Insights. See §4.9 and §4.11 for full specification.
RBAC denial alerting: > 100 denials in 5 minutes for a specific permission code triggers an App Insights alert. Reviewed by security team.
Cache hit rate monitoring: IPermissionCache hit/miss ratio tracked. < 90% hit rate triggers a Performance Review Gate (see §4.11.2).
Audit pipeline monitoring: Channel<T> queue depth monitored. Backpressure alert if queue > 1000 events. Indicates background writer stalling.
Performance SLOs: P99 API response < 200ms for permission-protected endpoints. P99 permission evaluation targets per §4.11. Violated SLOs trigger on-call.

# Section 8 — Azure Production Topology (MVP → MMP)
## 8.1  MVP Minimal Footprint (Required Now)
| Service | Configuration | Rationale |
| --- | --- | --- |
| App Service (Backend) | P2v3 SKU, 2 instances minimum, single region | Supports auto-scale, deployment slots (blue-green), Managed Identity binding, custom domain + TLS. |
| Azure Static Web Apps (Frontend) | SWA Free or S1 | Global CDN, CI/CD integration, custom domain, preview environments per PR. |
| Microsoft Dataverse | Production + dev/staging environments | Isolated per environment. Separate App Registration per environment. |
| Azure Key Vault | Standard tier, 1 vault per environment | Soft delete + purge protection enabled from day one. Managed Identity access only. |
| Microsoft Entra ID | Separate App Registration per environment | Conditional Access applied to production only (stage and dev use simplified policies). |
| Azure Monitor + App Insights | Workspace-based, 90-day retention | Request, dependency, exception, custom RBAC metric events, authorization telemetry. |

## 8.2  MMP Hardened Footprint — Additions Only
| Service | Status | Rationale |
| --- | --- | --- |
| Azure API Management (Standard v2) | ADD AT MMP | Rate limiting per tenant, API versioning baseline, WAF policy integration, developer portal for partner integrations. |
| Azure Front Door (Standard) | ADD AT MMP | Global anycast routing, WAF with OWASP 3.2 ruleset, DDoS protection, CDN for React SPA static assets. |
| Azure Cache for Redis (C1 Standard) | ADD AT MMP | L2 permission cache. IPermissionCache Redis binding. Zero code change — one DI registration update. Enables Pub/Sub invalidation. |
| Azure Service Bus (Standard) | ADD AT MMP | Replaces Channel<T> audit queue. Guaranteed delivery, dead-letter queue, message replay for compliance. |
| App Service (second region) | ADD AT SCALE | Active-passive multi-region. Front Door routes to secondary on primary failure. RTO target < 15 minutes. |
| Microsoft Defender for Cloud | ADD AT MMP | Continuous security posture monitoring, threat detection, ISO 27001 / SOC 2 compliance dashboard. |

## 8.3  Network Architecture (Text Diagram)
MVP Architecture
─────────────────────────────────────────────────────────────────
Internet → Azure Static Web Apps (React SPA + CDN)
→ App Service (ASP.NET Core API + TLS)
→ Azure Key Vault (Managed Identity — no passwords)
→ Microsoft Dataverse (Managed Identity)
→ Azure Monitor + App Insights
→ Microsoft Entra ID (PKCE token issuance + validation)

MMP Architecture
─────────────────────────────────────────────────────────────────
Internet → Azure Front Door (WAF + anycast + DDoS + CDN)
→ Azure API Management (rate limiting + API versioning)
→ App Service Region 1 (primary)
| App Service Region 2 (passive failover)
→ Azure Cache for Redis (permission cache L2)
→ Azure Service Bus (audit pipeline)
→ Azure Key Vault (Managed Identity)
→ Microsoft Dataverse (Managed Identity)
→ Azure Monitor + App Insights + Defender for Cloud
→ Microsoft Entra ID (PKCE + Conditional Access + PIM for JIT)
## 8.4  Swap Guides — Local MVP to Production
| Item | Detail |
| --- | --- |
| Mock Auth → Entra ID (2–4 hours) | appsettings.Production.json: Auth:Mode = "Entra". Frontend: VITE_AUTH_MODE=msal. MsalAuthProvider activates. Zero changes to controllers, policy handlers, domain, or React page components. |
| SQLite → Dataverse (1–2 weeks) | Add Kernel.Infrastructure.Dataverse project with Dataverse repository implementations. DI registrations swapped: services.AddScoped<IRoleRepository, DataverseRoleRepository>(). Domain entities, use cases, controllers, frontend: zero changes. |
| IMemoryCache → Redis (2–3 hours) | New RedisPermissionCache implementing IPermissionCache (~40 lines). One DI registration change in Program.cs. Interface unchanged. IPermissionEvaluator unchanged. |
| Channel<T> → Service Bus (4–8 hours) | New ServiceBusAuditWriter implementing IAuditQueue. Register Service Bus namespace connection in Key Vault. One DI line change. |

# Section 9 — Top 10 Architectural Risks
Ranked by impact. The first three are existential — they require architectural rewrites if not mitigated. All mitigations are implemented in this architecture.
| Rank | Risk | Scenario | Mitigation — Implemented |
| --- | --- | --- | --- |
| 1 — Critical | Per-request RBAC evaluation against Dataverse | 50–200ms permission evaluation per API call. Under enterprise concurrent load: Dataverse throttling, cascading 429 errors, cascading API timeouts. | IPermissionCache from first API endpoint. No production deploy without cache in place. Verified under load test. |
| 2 — Critical | Missing TenantId in data model | Cross-tenant data leak. Tenant A user reads Tenant B roles. Enterprise customer data exposure. Regulatory breach. | TenantId required on all entities from migration 001. EF Core global query filter. Non-negotiable. |
| 3 — Critical | JWT tokens with embedded role claims | Revoked role persists for up to 1 hour until token expiry. GLOBAL_ADMIN revocation does not take effect immediately. | JWT carries only oid and tid. Roles resolved from cache per request. Revocation is immediate via cache invalidation. |
| 4 — High | Synchronous audit in request path | Audit write failure breaks business operation. Audit latency adds to every API response. Audit backlog blocks users. | Async audit pipeline. IAuditQueue.Enqueue() is fire-and-forget. Audit failures logged, never propagated to caller. |
| 5 — High | Griffel token discipline decay | Hardcoded colours fail in high contrast mode. Accessibility audit fails. Fluent token update breaks UI silently. | ESLint blocks hardcoded values. axe-core in CI catches high contrast failures. Enforced in code review. |
| 6 — High | MSAL access token in localStorage | XSS vulnerability extracts token. Attacker has full API access until token expiry. | MSAL configured with sessionStorage default. Strict CSP headers. No application code reads token directly. |
| 7 — High | GLOBAL_ADMIN as unguarded escape hatch | Lateral movement vector. Audit blind spot. Single compromised GLOBAL_ADMIN account = full platform access within tenant. | Break-glass audit flag (IsBreakGlass=true). Elevated session tagging. Separate audit stream. MFA enforcement (MMP). JIT elevation (MMP). Blast radius limited to one tenant. |
| 8 — Medium | React permission checks as security controls | Developer adds usePermission() check in React component. API endpoint has no [Authorize] policy. Security by convention. | Architecture docs state explicitly: UI is not the security boundary. Every API endpoint requires [Authorize(Policy)]. Integration tests verify. |
| 9 — Medium | No RBAC regression test suite | Role model changes (new code added, matrix modified) silently break permission logic. Discovered in production. | Permission matrix tests: every role × every code, allow AND deny. Sprint 1. CI gate. Adding a code without a test fails the build. |
| 10 — Medium | Dataverse throttling under audit write load | 1:1 audit write per evaluated permission. 100 concurrent users = 100 Dataverse writes/second. Service protection limits trigger. | Audit pipeline batches writes (10–20 events per Dataverse call). IPermissionCache prevents per-request hits. Verified under load test. |

# Section 10 — 12-Month Evolution Roadmap
## Phase 1: Local MVP — Months 1–3
| Sprint | Days | Backend | Frontend |
| --- | --- | --- | --- |
| Sprint 1 | 1–5 | Solution structure. Domain entities. EF Core + SQLite migrations + seed data. Mock JWT service. /api/auth/me + /api/auth/me/permissions. TenantMiddleware. IPermissionEvaluator. RBAC engine wired. Permission matrix tests (P0). ClockSkew=2min set. | Vite + TS + Fluent UI setup. MockAuthProvider. Login persona selector. PermissionProvider. NavRail shell. RoutePermissionMap. PermissionGuard. AppLayout. |
| Sprint 2 | 6–10 | Module CRUD API (all policies). Role CRUD API (all policies). PermissionCode listing endpoint. Role-to-permission assignment API. | Module Management page (full CRUD + permission gates). Role Management page (CRUD + permissions modal). |
| Sprint 3 | 11–15 | User Profile CRUD API. User Role Assignment API (with cache invalidation + PermissionsVersion bump). Async audit pipeline wired to all mutation endpoints. | User Profile page. User Role Assignment page. Audit pipeline integration smoke test. |
| Sprint 4 | 16–20 | Access Request API (submit / approve / reject). SCC stats endpoint. Authorization telemetry wired. | Access Request page. Admin Access Requests page. SCC Dashboard (KPIs + Chart.js charts + audit feed). ECC landing page. |
| Sprint 5 | 21–25 | Audit log viewer API (sessions + actions, filter, search). Soft delete verification. Multi-tenant isolation tests. Full RBAC regression suite. | Audit Log Viewer (sessions + actions, filter UI). ECC locked-app modal flow. First-time user page. All placeholder pages. End-to-end persona smoke tests (all 6 personas). |

Phase 1 Decision Gate — Proceed to Phase 2 When: All 6 persona smoke tests pass. RBAC regression suite covers 100% of PermissionCode registry with allow AND deny assertions. Multi-tenant isolation tests pass. Async audit pipeline verified under 100 concurrent operations. Bundle size gate passing. Zero axe-core critical/serious accessibility violations.
## Phase 2: Credential Integration — Months 4–5
Entra ID swap: 2–4 hours. JwtBearerMiddleware + MSAL. MsalAuthProvider activated. Mock path inactivated. Zero business logic change.
Dataverse swap: 1–2 weeks. Dataverse repository implementations. Domain entities and use cases unchanged.
Redis swap: 2–3 hours. RedisPermissionCache (~40 lines). One DI line change.
Azure Key Vault integration. Managed Identity binding. All secrets migrated from user-secrets.
Application Insights telemetry activated. Serilog AI sink. Authorization telemetry flowing to App Insights.
Phase 2 Decision Gate: Full RBAC regression suite passes against Entra ID + Dataverse (no mocks). P99 API response < 200ms under 100 concurrent users. IPermissionCache hit rate > 90% under load. Authorization telemetry flowing in App Insights, KQL queries validated.
## Phase 3: Hardening — Months 5–7
Azure APIM integration. Rate limiting per tenant. API versioning baseline (v1).
Penetration test: auth flows, RBAC bypass, injection, multi-tenant isolation. Resolve all High/Critical findings before enterprise onboarding.
Service Bus audit pipeline. Guaranteed delivery, dead-letter queue, message replay.
SoD conflict detection engine Phase 1. Conflict rule model, detection, SCC surface.
Audit log export (CSV/JSON). Async job-based. Compliance officer download workflow.
GLOBAL_ADMIN MFA enforcement via Conditional Access policy.
Permission Drift Detection CI guardrail implemented (§7.1.A). MMP entry gate.
## Phase 4: Scale Readiness — Months 8–9
Azure Front Door + WAF. Global routing, OWASP 3.2 ruleset, DDoS protection, CDN.
Multi-region passive failover. Front Door health-based routing. RTO target < 15 minutes.
Access recertification campaigns. Reviewer portal. Bulk approve/deny. Expiry enforcement.
Governance reporting. Compliance posture per tenant. SoD violation report. Orphaned assignment detection.
Redis Pub/Sub cache invalidation. Eliminates stale-permission window under concurrent revocation.
Cold-start stampede protection fully implemented (request coalescing, jittered TTL, soft TTL refresh — §4.5.1).
## Phase 5: Enterprise Expansion — Months 10–11
Just-in-time (JIT) access. Time-limited GLOBAL_ADMIN elevations with automated expiry. Mirrors Entra PIM.
Risk-based access controls. Deny or step-up MFA on anomaly signals from authorization telemetry.
Data Lake audit export. SIEM integration. Long-term compliance reporting.
Advanced SoD engine. Exception workflow. Periodic recertification of exceptions.
## Phase 6: Intelligent Governance — Month 12+
RBAC Copilot assistant. Natural language queries: "Who can export audit logs in module X?" "What roles does user Y hold across all modules?"
Anomaly detection. ML-based access pattern baseline. Risk signals surfaced in SCC dashboard.
AI-assisted role design. Suggest role compositions from peer group patterns. Flag over-privileged accounts.
Automated compliance mapping. Permission codes to ISO 27001 / SOC 2 controls. Gap surfacing in SCC.

# Closing Principles — Non-Negotiable
This platform will be judged not by its MVP features, but by whether it holds its architectural integrity as enterprise customers stress it with scale, compliance audits, and adversarial security testing.
| Item | Detail |
| --- | --- |
| Identity First | Entra ID is the only trust anchor. No application-managed identities. No custom IdP. |
| API Is the Security Boundary | React UI is a UX surface. All permission enforcement occurs in the API via IPermissionEvaluator. Documented in code, architecture, and onboarding. |
| Permission Codes Over Role Names | Code against ROLE:CREATE, not against "ADMIN". Permission codes are stable identifiers. Role names and role compositions change. |
| Cache Is Not Optional | IPermissionCache from the first API endpoint. No direct Dataverse / DB evaluation in the permission hot path. |
| Tenant Isolation Is Absolute | TenantId filter at repository layer via EF Core global query filters. Cross-tenant data visibility is a catastrophic failure — not a bug. |
| Evaluator Owns All Logic | IPermissionEvaluator is the only place permission logic lives. Policy handlers are 5-line adapters. SoD rules, time-bound access, break-glass — all inside the evaluator. |
| Audit Is Append-Only | Audit records are never updated or deleted. PermissionsVersion stamped on every AuditActionLog entry. Async pipeline — never in request path. |
| Griffel Tokens Are Law | No hardcoded values in makeStyles(). This is the foundation of accessibility and high contrast support. |
| Authorization Telemetry Is Mandatory | Structured metric events from IPermissionEvaluator on every evaluation. Audit answers "what happened". Telemetry answers "what is trending wrong". |
| Authorization Latency Is a First-Class SLO | P50 cache <1ms, P99 cache <5ms, P99 DB <50ms, cache dominance ≥95%. Performance Review Gate triggered on violation. See §4.11. |
| Tests Are Not Optional | RBAC regression suite is a Sprint 1 deliverable. Permission matrix coverage is a CI gate. Adding a permission code without a test pair fails the build. |
| Nothing Gets Thrown Away | Every local implementation is a swappable binding behind an interface. Entra, Dataverse, Redis, Service Bus — all hours to swap. Architecture is stable from day one. |

CLaaS2SaaS · Security Kernel — Multi-Tenant RBAC Control Centre · Master Architecture v4.0 · February 2026
This document supersedes all prior architecture documents without exception.

🔧 Polish 1 — Metric namespace standardization
You use good metric names, but Microsoft services usually declare a formal namespace.
Optional addition:
Metric Namespace: SCC.Authorization
Primary Event: permission.evaluation
Why it helps:
cross-service dashboards
long-term telemetry hygiene
avoids naming drift
Priority: Low

🔧 Polish 2 — Explicit per-tenant alert wording
Your cache burst monitoring is good.
Tiny clarity improvement:
Explicitly state alerts must be dimensioned by TenantId to avoid noisy global alerts.
Priority: Low

🔧 Polish 3 — Performance Review Gate ownership
You defined the gate well.
Optional Microsoft-style addition:
on-call engineer triage
service owner sign-off for repeated violations
Purely process clarity.
Priority: Low
