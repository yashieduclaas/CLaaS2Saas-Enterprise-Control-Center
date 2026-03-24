# ECC GitHub Copilot — Primary Workspace Instructions

> **Scope:** This file is loaded automatically by GitHub Copilot Pro+ for every code generation request across the entire ECC repository — inline suggestions, Copilot Chat, agent mode, and plan mode. Every rule here applies to every interaction, always.
>
> **Change Control:** This file must not be modified without Engineering Lead approval via a reviewed PR. Changes to this file affect every developer's Copilot behavior across the entire codebase.

---

## Architecture Rules — Three-Layer Pattern with Zero Exceptions

ECC enforces a strict Controller → Service → Repository architecture. No layer may bypass the layer directly below it, and no layer may assume the responsibilities of another. This pattern exists because ECC is a security-critical control plane — predictable, auditable code structure is a non-negotiable requirement for a system that governs authorization decisions across an entire enterprise platform.

### Controller Layer (`*.Controller.cs`)

Controllers handle HTTP concerns and nothing else. Their job is to receive a request, verify the caller is authenticated, extract identity, delegate to a service, and return a formatted response.

- Every protected endpoint must carry the `[Authorize]` attribute. There are no exceptions — ECC is an authorization authority, and its own endpoints must be secured.
- The Entra Object ID is extracted exclusively via `User.FindFirst("oid").Value` before any service call. This is the identity anchor for the entire security model — controllers must resolve it before delegating.
- Controllers must not contain business logic (no if/else domain decisions), must not access repositories directly (no repository constructor injection), and must not import repository namespaces.
- All responses use the ECC standard envelope: `{ success: bool, data: object|null, error: { code: string, message: string }|null }`. This ensures every API consumer — including the React frontend and external modules — can parse responses consistently.

### Service Layer (`*.Service.cs`)

Services contain all business logic and RBAC evaluation. They are the decision-making layer — the place where ECC determines what a user is allowed to do and enforces that determination.

- Repositories are injected via constructor through their interfaces (e.g., `ISecurityUserRepository`). Services never instantiate repository classes directly, because doing so defeats dependency injection and makes the service untestable.
- Services must not import `Microsoft.AspNetCore.Http` or `HttpRequest` — they must not be aware of HTTP concerns. If a service needs identity context, it receives the Entra Object ID as a parameter from the controller.
- Exceptions are thrown only as `AppException` from `ECC.Shared.Errors.AppException`. Never throw `System.Exception` directly — `AppException` carries structured error codes that the controller layer maps to appropriate HTTP status codes.
- `IEventDispatcher.Dispatch` must be called after every state-changing operation (role assignment, permission update, user provisioning, etc.). This is the audit trail mechanism — missing dispatch calls mean missing audit records, which breaks ECC's governance contract.
- All methods use `async/await` throughout. Zero `.Result` or `.Wait()` calls — these cause thread pool starvation under load and risk deadlocks in ASP.NET Core's synchronization context.

### Repository Layer (`*.Repository.cs`)

Repositories handle all SQL Server data access and nothing else. They translate between the relational data store and the domain objects that services work with.

- All SQL queries use `SqlCommand.Parameters` exclusively. Zero string interpolation, zero string concatenation in SQL statements. This is non-negotiable — ECC stores security-critical data (roles, permissions, audit records) and SQL injection in this codebase would be a catastrophic security breach.
- Repositories return mapped domain objects from `SqlDataReader`, never raw `DataReader` instances. Leaking database reader abstractions into the service layer couples the business logic to the data access implementation.
- `SqlException` is caught and rethrown as `AppException` with the appropriate error code (typically `DATABASE_ERROR`). Raw SQL exceptions must never propagate to the service layer.
- Repositories contain no business logic (no if/else domain decisions), no domain event emission (that is the service layer's responsibility), and no cross-module imports.

---

## Namespace Conventions

| Layer | Namespace Pattern | Example |
|-------|------------------|---------|
| API Controllers | `ECC.API.Controllers.[Module]` | `ECC.API.Controllers.Identity` |
| API Services | `ECC.API.Services.[Module]` | `ECC.API.Services.Identity` |
| API Repositories | `ECC.API.Repositories.[Module]` | `ECC.API.Repositories.Identity` |
| API DTOs | `ECC.API.DTOs.[Module]` | `ECC.API.DTOs.Identity` |
| Shared Errors | `ECC.Shared.Errors` | `ECC.Shared.Errors.AppException` |
| Shared Events | `ECC.Shared.Events` | `ECC.Shared.Events.IEventDispatcher` |

---

## C# Code Requirements

These rules ensure consistency across every C# file in the ECC codebase and make Copilot's output predictable and reviewable.

- Nullable reference types are enabled project-wide. All reference parameters must be explicitly annotated (`string?` for nullable, `string` for non-nullable). This catches null reference issues at compile time rather than at runtime in production.
- Never use `object` as a parameter type or return type. Define a proper DTO or domain model. The `object` type defeats the type system and makes code unreadable, untestable, and impossible for Copilot to reason about.
- XML documentation comments (`<summary>`, `<param>`, `<returns>`, `<exception>`) are required on all public methods. These comments are consumed by Copilot's semantic index and directly improve the quality of downstream code generation.
- All service and repository methods return `async Task` or `async Task<T>`. Synchronous methods in the data path create thread pool bottlenecks.
- Use `record` types for immutable response DTOs (data coming out of the API). Use `class` types for request DTOs (data coming in) with FluentValidation validators attached.

---

## Authentication and Authorization

ECC delegates authentication to Microsoft Entra ID and handles authorization internally. This separation is fundamental — Entra ID answers "who are you?" and ECC answers "what are you allowed to do?"

- `Microsoft.Identity.Web` handles all JWT validation in `Program.cs`. No custom token parsing code is permitted anywhere in the codebase. The middleware validates the signature, audience, issuer, and expiry automatically — reimplementing any of this is both unnecessary and dangerous.
- The `[Authorize]` attribute is the authorization mechanism for all protected controller actions. Do not implement custom authorization filters unless explicitly directed by an ADR.
- The Entra Object ID is extracted from `User.FindFirst("oid").Value` and is the sole identity anchor for all downstream operations. Do not use email, display name, or UPN as identity keys — these can change; the Object ID cannot.
- Role claims are extracted from ECC's scoped JWT claims, which are generated by the Security Kernel after evaluating the user's role assignments against the Security_User_Role and Security_Role_Permission tables.

---

## Security Rules — NON-NEGOTIABLE

These rules exist because ECC is the authorization authority for an entire enterprise platform. A security violation in ECC is not a bug — it is a platform-wide governance failure. Every rule here is enforced in CI and verified during Gate 3 architecture review.

1. **Input Validation:** All DTO fields must be validated via FluentValidation `AbstractValidator<T>`. Never use raw `ModelState` checks — FluentValidation provides structured, testable validation rules that can be shared across the codebase. Every request DTO must have a corresponding validator class.

2. **No PII in Logs:** Never log email addresses, display names, Entra Object IDs, JWT tokens, or SQL queries. If a log statement needs to reference a user, use a correlation ID or session ID. PII in logs creates compliance liability and violates data protection requirements.

3. **Parameterized SQL Only:** All SQL queries use `SqlCommand.Parameters` with zero tolerance for string concatenation or interpolation. This is the single most important security rule in the repository layer — violation of this rule is treated as a Critical severity finding in architecture review.

4. **Audit Event Dispatch:** `IEventDispatcher.Dispatch` must be called after every state-changing service operation. Missing dispatch calls break the audit trail and make access decisions untraceable. This is verified in unit tests and in Gate 3 review.

5. **Authorization on Every Endpoint:** `[Authorize]` must be present on every protected controller action. An unprotected endpoint in ECC's API is an unguarded gate in the enterprise's authorization perimeter.

6. **Authorization Before Data Access:** Authorization validation must be called before accessing or modifying any data. The pattern is always: authenticate → authorize → execute → audit. Never execute before authorizing.

---

## React Frontend Rules

The ECC frontend is a React 18 + TypeScript 5 application that renders the module discovery dashboard and administrative interfaces. Its primary architectural constraint is that it must never make authorization decisions — it renders only what the API tells it the user is allowed to see.

- Functional components with hooks only. No class components — they are not compatible with the hook-based patterns used throughout the codebase and they complicate testing.
- All API calls go through service modules in `src/ECC.UI/services/`. Components never call `fetch()` or `axios` directly. Service modules centralize error handling, token attachment, and response typing.
- All props are typed with named TypeScript interfaces using the `[ComponentName]Props` naming convention. No inline types, no `any` type. The `any` type defeats TypeScript's entire purpose and makes Copilot's suggestions unreliable.
- Authentication uses the `useMsalAuthentication` hook exclusively. No raw `fetch` with manually attached Bearer tokens — the MSAL library handles token acquisition, caching, and silent refresh.
- Unauthorized modules are not rendered at all. No hidden elements, no disabled states, no CSS `display: none`. If a user is not authorized to access a module, the module card does not exist in the DOM. This is a deliberate security decision — hiding UI elements is not access control.
- `useCallback` on every function passed as a prop to child components. `useMemo` on expensive computations. These prevent unnecessary re-renders in the module discovery dashboard, which can display many module cards.

---

## xUnit Testing Rules

ECC follows TDD with xUnit and Moq. Every feature begins with failing tests (Red phase), proceeds to minimal implementation (Green phase), and finishes with structural improvement (Refactor phase). The testing discipline is strict because ECC's authorization logic must be provably correct.

- All external dependencies are mocked via Moq. No real SQL Server connections, no real Entra ID calls in unit tests. Unit tests verify logic, not infrastructure.
- Test method naming convention: `MethodName_Condition_ExpectedResult`. Example: `AssignRole_UserNotFound_ThrowsIdentityNotFoundException`. This naming convention makes test output self-documenting — a failing test name tells you exactly what broke.
- Every test method follows Arrange-Act-Assert structure. Arrange sets up mocks and test data. Act calls the method under test. Assert verifies the expected outcome. One blank line separates each section.
- Exactly one behavior per test method. A test that verifies two things is two tests that should be separated. This ensures failures are precise and actionable.
- `IEventDispatcher.Dispatch` is verified after successful state changes. Every test for a state-changing operation must include a `mockEventDispatcher.Verify(d => d.Dispatch(...), Times.Once())` assertion.

---

## Canonical Examples — The Three-File Rule

Before pasting any micro-prompt into Copilot, open these example files in VS Code editor tabs. Copilot's semantic index weights open files heavily — these examples anchor its pattern generation to ECC conventions.

| New Code Type | Example File Path |
|---------------|------------------|
| ASP.NET Core Service | `src/ECC.API/Examples/example-service.cs` |
| Controller | `src/ECC.API/Examples/example-controller.cs` |
| Repository | `src/ECC.API/Examples/example-repository.cs` |
| DTO | `src/ECC.API/Examples/example-dto.cs` |
| xUnit Test Class | `src/ECC.API/Examples/example-test.cs` |
| React Component | `src/ECC.UI/examples/example-component.tsx` |
| React Service Module | `src/ECC.UI/examples/example-service.ts` |

**The Three-File Rule:** Before every Copilot generation session, open (1) the canonical example file for the type of code you are generating, (2) the most similar existing file in the module you are working in, and (3) any interface or DTO that the new code will depend on. These three files give Copilot the pattern context it needs to produce codebase-native output.

---

## PROMPT-ID Header Requirement

Every AI-generated file must include a PROMPT-ID header block immediately after the namespace declaration (C#) or file-level imports (TypeScript/React). This header links the generated code to its prompt registry entry and enables CI traceability.

```
// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-[layer]-[entity]
// Generated:  YYYY-MM-DD | ChatGPT REVIEW: PENDING
// ============================================================
```

Files missing this header block fail the `prompt-check` CI step and block merge. The `ChatGPT REVIEW` field is updated to `PASS` with a timestamp after Gate 3 review is completed. This traceability mechanism is what allows the team to know which code was AI-generated, which prompt produced it, and whether it passed architecture review.

---

## Architecture Drift Warning Signs

If Copilot encounters or is about to generate any of the following patterns, **stop and alert the developer** rather than proceeding. These patterns indicate an architecture boundary violation that will fail Gate 3 review.

- **A controller file importing from a repository namespace** — controllers must not know repositories exist. They talk to services, which talk to repositories.
- **A service file importing `Microsoft.AspNetCore.Http`** — services must not be aware of HTTP concerns. Identity context arrives as parameters from the controller.
- **A repository method containing if/else business logic** — repositories translate between SQL and domain objects. Decision-making belongs in the service layer.
- **A DTO calling any service method** — DTOs are data containers. They carry data; they do not perform operations.
- **An xUnit test with no Moq setup that connects to a real database** — unit tests verify logic through mocks. Integration tests (a separate concern) may use real infrastructure.
- **A React component calling `fetch()` directly without a service module** — all API calls go through `src/ECC.UI/services/` for centralized error handling and token management.
- **Any SQL string containing an interpolated variable** (`$"SELECT ... WHERE id = {id}"`) — this is a SQL injection vector and is the single most dangerous pattern that can appear in the ECC codebase.
