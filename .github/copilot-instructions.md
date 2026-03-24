# ECC-Kernel GitHub Copilot — Primary Workspace Instructions

> **Scope:** This file is loaded automatically by GitHub Copilot for every code generation request across the entire ECC-Kernel repository — inline suggestions, Copilot Chat, agent mode, and plan mode. Every rule here applies to every interaction, always.
>
> **Change Control:** This file must not be modified without Engineering Lead approval via a reviewed PR. Changes to this file affect every developer's Copilot behavior across the entire codebase.
>
> **Source of Truth:** All architecture rules, security constraints, and coding standards in this file are derived from the ECC-Kernel Product Engineering Blueprint, Engineering SOP, Implementation Guides, SecurityDB v2.3 schema, and SCC Feature List v1.0. If any rule here conflicts with those documents, the source-of-truth documents take precedence.

---

## Tech Stack Reference

For all technology names, versions, packages, and environment configuration, refer to the **KERNEL_TechStack_KnowledgeBase.md**. That document is the single source of truth for the tech stack. Do not duplicate version numbers or package lists in any other Copilot file. The current stack is .NET 10 with ASP.NET Core, React 18 with Vite 5, Entity Framework Core 9, Fluent UI v9, and Azure SQL Database, all secured via Microsoft Entra ID. See the TechStack KB for exact versions and dependency details.

---

## Architecture Rules — Clean Architecture with Zero Exceptions

ECC-Kernel follows **Clean Architecture** with four projects: `Kernel.Domain`, `Kernel.Application`, `Kernel.Infrastructure`, and `Kernel.API`. The dependency rule is absolute — inner layers know nothing about outer layers. This means the `IPermissionEvaluator` interface lives in `Kernel.Application`, its EF Core implementation lives in `Kernel.Infrastructure`, and `Kernel.API` controllers call the application layer via MediatR without knowing which infrastructure backs it. This makes the authorization core testable in complete isolation from the database.

### Kernel.Domain

Domain entities, value objects, domain events, and business rules live here. This project has zero external dependencies — no EF Core attributes, no ASP.NET references, no NuGet packages beyond the .NET base class library. The SecurityDB entities (`SecurityUser`, `SecurityRolePermission`, `SolutionModule`, `MapSecurityUsersRoles`, `AuditSession`, `AuditActionLog`, `HandoffToken`) are defined as pure C# classes. EF Core configuration is deferred entirely to `Kernel.Infrastructure` via Fluent API. The `entra_oid` field is modeled as a strongly-typed `EntraObjectId` value object, not a raw string, so the compiler enforces that Entra OIDs and arbitrary strings are never mixed.

### Kernel.Application

Command and query handlers (CQRS via MediatR), application services, and all critical interfaces live here, including `IPermissionEvaluator`, `IAuditQueue`, and `ITenantContext`. FluentValidation validators for MediatR commands live here and run as a MediatR pipeline behaviour before the handler executes. This layer contains all business logic. It has no knowledge of EF Core, HTTP, or any infrastructure concern.

### Kernel.Infrastructure

EF Core `ApplicationDbContext` with Fluent API configuration, repository implementations, `PermissionEvaluatorService`, `AuditWriterService` (the `Channel<T>` background consumer), and all external service clients (Azure Key Vault, Application Insights) live here. This is the only project that references EF Core, Azure SDK packages, or any external infrastructure.

### Kernel.API

Controllers, middleware registrations, and `Program.cs` live here. Controllers are thin orchestrators that call `ISender` (MediatR) only — they do not directly instantiate application services or inject repositories. The maximum logic in a controller action is 5 lines of orchestration. `Program.cs` defines the frozen middleware pipeline order and must not be modified without Principal Architect sign-off.

---

## Frozen Artifacts — Do Not Touch Without Approval

The following artifacts are frozen and must not be modified by Copilot or any engineer without explicit Principal Architect sign-off via an Architecture Review Request (ARR):

`Program.cs` middleware pipeline order, `TenantMiddleware`, `IPermissionEvaluator` interface, `AppLayout`, `PermissionProvider`, `AuthProvider`, `MsalAuthProvider`, `MockAuthProvider`, `ROUTE_MAP` in `routeMap.ts`, and all definitions in `packages/contracts`.

If Copilot detects that a prompt or suggestion would modify any frozen artifact, it must stop and alert the developer rather than proceeding.

---

## Authorization — IPermissionEvaluator as the Sole Boundary

ECC-Kernel delegates authentication to Microsoft Entra ID and handles authorization internally through `IPermissionEvaluator`. This component is the most critical in the entire system. Every downstream application (AIW, ADLT, ACRM, AESS) depends on it to answer: "Is this user permitted to perform this action in this module?"

Every protected controller action must carry `[Authorize(Policy = PermissionCode.XxxYyy)]`. The bare `[Authorize]` attribute alone is insufficient — it only confirms authentication, not authorization. The `PermissionCode` enum lives in `packages/contracts` and is the shared contract between frontend and backend. Do not use `User.IsInRole()` anywhere in the codebase — this is banned and causes an immediate CI pipeline failure.

The `IPermissionEvaluator` evaluation flow is deterministic: first check the in-memory cache (`{security_user_pid}:{solution_module_pid}:{permission_code}`), then check GLOBAL_ADMIN bypass (`view_all_data_plus_admin_for_all_module = 1`), then execute `HasPermission()` against `map__security_users__roles` joined to `security_role_permissions`, then emit telemetry, then enqueue an audit entry via `IAuditQueue` (fire-and-forget), then return the result. The cache key must use `solution_module_pid` (integer), not `module_code` (string), because two modules from different solutions could share a code string.

---

## Authentication — Microsoft Entra ID

`Microsoft.Identity.Web` handles all JWT validation in `Program.cs`. No custom token parsing code is permitted anywhere. The middleware validates signature, audience, issuer, expiry, and enforces a clock skew of `TimeSpan.FromMinutes(2)`. The `tid` claim feeds the `TenantMiddleware` resolution chain (JWT `tid` → `X-Tenant-Id` header → subdomain → API key). The Entra Object ID is extracted from `User.FindFirst("oid").Value` and is the sole identity anchor for all downstream operations. Do not use email, display name, or UPN as identity keys — these can change; the Object ID cannot.

---

## API Design Standards

All responses use `ApiResponseFactory.Create(result)` — never construct response envelopes manually. Error responses follow RFC 7807 `ProblemDetails`. All endpoints are versioned from day one: `/api/v1/{resource}`. HTTP method semantics are strictly followed: GET is idempotent, POST creates, PUT replaces, PATCH updates fields, DELETE soft-deletes (sets `deleted_flag = 1`, never physically deletes). The only anonymous endpoint permitted is the health check (`GET /health`).

---

## Audit Trail — IAuditQueue (Non-Blocking)

`IAuditQueue` is implemented as a `System.Threading.Channels.Channel<AuditEntry>` consumed by `AuditWriterService : BackgroundService`. It is fire-and-forget — audit writes never block the request path. `audit_sessions` records are created for every login attempt (success and failure). `audit_action_logs` records are created for every CRUD operation with `action_type`, `entity_type`, `entity_pid`, `old_value`, and `new_value` populated as JSON. These audit tables are append-only: no application code may execute `UPDATE` or `DELETE` against them. The database login has `INSERT` privilege only on audit tables.

---

## Security Rules — NON-NEGOTIABLE

These rules exist because ECC-Kernel is the authorization authority for the entire CLaaS2SaaS platform. A security violation here is a platform-wide governance failure. Every rule is enforced in CI and verified during architecture review.

1. **Policy-Based Authorization:** Every protected controller action carries `[Authorize(Policy = PermissionCode.XxxYyy)]`. A bare `[Authorize]` is not sufficient. An unprotected endpoint is an unguarded gate in the enterprise's authorization perimeter.

2. **Input Validation:** Every MediatR command has a FluentValidation `AbstractValidator<T>` that runs as a pipeline behaviour. No raw `ModelState` checks, no validation logic in controllers. Validators enforce column-level constraints from the SecurityDB schema (GUID format for `entra_oid`, email format for `entra_email_id`, `^[A-Z_]{2,50}$` pattern for `sec_role_code`).

3. **No PII in Logs:** Never log email addresses, display names, Entra Object IDs, JWT tokens, or SQL queries. Use correlation IDs or internal non-PII identifiers only.

4. **Parameterized Queries Only:** All database access uses EF Core LINQ or explicitly parameterized queries via `FromSqlInterpolated`. No string concatenation in SQL under any circumstances. No raw `SELECT *` queries — all queries use explicit column projection.

5. **Audit Completeness:** Every state-changing operation must enqueue an audit entry via `IAuditQueue` after the successful database write. Missing audit entries break the governance contract that ECC-Kernel exists to fulfill.

6. **Authorization Before Data Access:** The pattern is always: authenticate → authorize via `IPermissionEvaluator` → execute → audit. Never execute before authorizing.

7. **No Secrets in Source Control:** All secrets are in Azure Key Vault accessed via Managed Identity. The `.env` file is in `.gitignore`. No connection strings, API keys, or hash values in any committed file.

---

## C# Code Requirements

Nullable reference types are enabled project-wide — all reference parameters must be explicitly annotated. Never use `object` as a parameter or return type. XML documentation comments (`<summary>`, `<param>`, `<returns>`, `<exception>`) are required on all public methods. All service and handler methods use `async/await` with `CancellationToken ct` accepted on every async action. Zero `.Result` or `.Wait()` calls. Use `record` types for immutable response DTOs and `class` types for request DTOs/commands. No `DbContext` injection outside of `Kernel.Infrastructure`. No direct `new` instantiation of service dependencies — constructor injection only. Service lifetimes follow: scoped for `DbContext` and services with `TenantContext`, singleton for stateless services, transient for validators and mappers.

---

## EF Core and Database Access

EF Core Fluent API configurations live in `Kernel.Infrastructure.Persistence.Configurations` as `IEntityTypeConfiguration<T>` classes. Global query filters enforce soft-delete (`deleted_flag = 0`) on all entities except audit tables (which are append-only and must always return all records). The only code permitted to use `.IgnoreQueryFilters()` must be behind `[Authorize(Policy = PermissionCode.AdminRecoveryAccess)]`. Migration naming follows `YYYYMMDD_<description>`. Every migration includes a tested `Down()` method. Migrations run as pre-deployment steps, never on application startup.

---

## Exception Handling

Global exception handling uses ASP.NET Core's `IExceptionHandler` middleware. Domain exceptions map to HTTP status codes: `PermissionDeniedException` → `403`, `ResourceNotFoundException` → `404`, `ValidationException` → `400`, `TenantResolutionException` → `400`, unhandled → `500` with correlation ID only (no stack traces in any environment's response body). All exceptions include a correlation ID for Application Insights lookup.

---

## React Frontend Rules

The ECC-Kernel frontend is a React 18 + TypeScript strict SPA that renders the SCC admin control plane. Its primary constraint is that it must never make authorization decisions — it renders only what the API authorizes via the permission profile.

Functional components with hooks only. No class components. All styling uses Griffel `makeStyles()` with Fluent UI `tokens.*` — no hardcoded hex values, no pixel values, no CSS-in-JS alternatives. All server state uses React Query (`@tanstack/react-query`) exclusively — no `useEffect` + `fetch` patterns. Auth state uses `AuthContext` (platform-owned, frozen). Permission state uses `PermissionContext` and the `usePermission(PermissionCode.XxxYyy)` hook — never check role names as strings. All routes use `ROUTE_MAP` (frozen) with `React.lazy()` and `Suspense`. Every route is wrapped in `PermissionGuard` which renders a Skeleton until permission resolution completes.

All API calls go through typed client modules in `src/api/` built on Axios. Zod validates response shapes at the API boundary. Components never call `fetch()` or `axios` directly. No `any` type. No `localStorage` for tokens (MSAL manages token storage). No `dangerouslySetInnerHTML`. No banned packages (styled-components, @emotion/*, tailwindcss, zustand, redux, lodash, moment, material-ui, bootstrap).

Unauthorized modules are not rendered at all — no hidden elements, no disabled states, no `display: none`. If a user is not authorized, the component renders `null`. Feature-flagged components also render `null` when disabled, not a placeholder.

---

## Testing Standards

ECC-Kernel follows TDD with xUnit and Moq for the backend, Vitest and Testing Library for the frontend. The five-role RBAC hierarchy (Global Admin, Admin, Collaborator, Contributor, Viewer) must be covered by RBAC matrix tests for every permission code. Test method naming: `MethodName_Condition_ExpectedResult`. Every test follows Arrange-Act-Assert with one blank line between sections and exactly one behavior per test.

Unit tests cover: domain entity behavior, `IPermissionEvaluator` evaluation paths, FluentValidation validators, and `ApiResponseFactory` output shape. Integration tests cover: every API endpoint via `WebApplicationFactory<Program>` with at minimum happy path, invalid JWT (401), insufficient permissions (403), and inactive user (403). End-to-end tests cover the Golden Handshake exchange flow. New code must have >80% branch coverage.

---

## Feature Pod Delivery Model

All work is delivered as self-contained Feature Pods with a `MANIFEST.json`. Pods are submitted to `/feature-pods/inbox/` and validated by the `pod-validate.yml` pipeline. No direct commits to `main` or `develop`. All `agentDeclarations` in the manifest must be `true`. Pods must not touch frozen artifacts without a prior ARR. The `packages/contracts` package is additive-only — no renaming or removal without a 2-sprint deprecation window.

---

## PROMPT-ID Header Requirement

Every AI-generated file must include a PROMPT-ID header block immediately after the namespace declaration (C#) or file-level imports (TypeScript/React):

```
// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-[layer]-[entity]
// Generated:  YYYY-MM-DD | ChatGPT REVIEW: PENDING
// ============================================================
```

Files missing this header block fail the `prompt-check` CI step and block merge.

---

## Architecture Drift Warning Signs

If Copilot encounters or is about to generate any of the following patterns, **stop and alert the developer** rather than proceeding:

- **Any file in `Kernel.API` importing from `Kernel.Infrastructure`** — controllers must go through `Kernel.Application` via MediatR, never directly to infrastructure.
- **Any file in `Kernel.Domain` referencing EF Core** — domain entities are pure C# with no ORM attributes.
- **`DbContext` injected in a controller** — `DbContext` lives in `Kernel.Infrastructure` only.
- **A controller with more than 5 lines of logic** — controllers are thin orchestrators calling `ISender`.
- **`User.IsInRole()` anywhere** — this is banned; use `IPermissionEvaluator` and `PermissionCode`.
- **A bare `[Authorize]` without a `Policy`** — every protected endpoint needs `[Authorize(Policy = PermissionCode.XxxYyy)]`.
- **`ApiResponseFactory.Create()` not used** — all responses go through the factory.
- **A React component calling `fetch()` or `axios` directly** — all calls go through `src/api/` typed client.
- **`useEffect` + `fetch` for data loading** — use React Query `useQuery` hooks.
- **Any SQL string containing an interpolated variable** — parameterized queries or EF Core LINQ only.
- **Any `UPDATE` or `DELETE` on `audit_sessions` or `audit_action_logs`** — these are append-only.
- **A modification to any frozen artifact** — requires ARR and Principal Architect sign-off.
- **A banned npm package import** — causes immediate pod rejection.
- **Role name string comparison in React** (`role === 'Admin'`) — use `usePermission(PermissionCode.XxxYyy)`.
