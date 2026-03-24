# ECC-Kernel Backend Instructions — .NET 10 API Layer

> **Scope:** This file applies only when Copilot is working within `apps/api/**`. It complements the workspace-wide instructions in `.github/copilot-instructions.md` with backend-specific patterns.
>
> **applyTo:** `apps/api/**`
>
> **Tech Stack:** Refer to **KERNEL_TechStack_KnowledgeBase.md** for all technology and version details.

---

## Purpose

This file gives Copilot precise, ECC-Kernel-specific backend patterns so that generated C# code aligns with Clean Architecture and SecurityDB v2.3 on the first pass. The workspace-wide instructions establish the rules; this file shows exactly how those rules are implemented in the .NET API layer.

---

## Clean Architecture Project Boundaries

**Kernel.Domain:** Pure C# entities and value objects. No EF Core references. `SecurityUser`, `SecurityRolePermission`, `SolutionModule`, `MapSecurityUsersRoles`, `AuditSession`, `AuditActionLog`, and `HandoffToken` are domain entities here. `EntraObjectId` is a value object (not a raw string). No `[Column]` or `[Table]` attributes — Fluent API configuration lives in `Kernel.Infrastructure`.

**Kernel.Application:** MediatR commands, queries, handlers, and FluentValidation validators. Interfaces: `IPermissionEvaluator`, `IAuditQueue`, `ITenantContext`. Feature folders: `Authentication/`, `Users/`, `Roles/`, `Permissions/`, `UserRoleAssignments/`, `GoldenHandshake/`. No EF Core references, no HTTP references.

**Kernel.Infrastructure:** `ApplicationDbContext`, `IEntityTypeConfiguration<T>` classes, repository implementations, `PermissionEvaluatorService`, `AuditWriterService`, `HandoffTokenCleanupService`. This is the only project that references EF Core packages.

**Kernel.API:** Controllers calling `ISender` (MediatR) only. Maximum 5 lines of orchestration per action. `Program.cs` is frozen.

**Constraint 1:** Never import `Kernel.Infrastructure` namespaces from `Kernel.API` controllers. Controllers inject `ISender` and call `Send(command)`. The MediatR pipeline resolves the handler, which lives in `Kernel.Application`, which calls interfaces implemented in `Kernel.Infrastructure`.

**Constraint 2:** Never place EF Core attributes (`[Column]`, `[Table]`, `[Key]`) on any class in `Kernel.Domain`. All ORM configuration uses Fluent API in `Kernel.Infrastructure.Persistence.Configurations`.

---

## MSAL Middleware Integration

`Microsoft.Identity.Web` is wired in `Program.cs` with explicit clock skew of `TimeSpan.FromMinutes(2)`. It validates JWT signature, issuer (`tid`), audience (`AZUREAD_CLIENT_ID`), and expiry automatically. Your code's responsibility is extracting the Entra Object ID via `User.FindFirst("oid").Value` and passing it to MediatR commands.

**Constraint 3:** Never write custom JWT validation logic. No `JwtSecurityTokenHandler`, no manual signature verification. The middleware handles all of this.

**Constraint 4:** Never access `HttpContext.Request.Headers["Authorization"]` to extract tokens manually. Use `User.FindFirst("oid")` on the `ClaimsPrincipal` the middleware has already populated.

---

## Controller Pattern

Controllers are thin orchestrators that delegate everything to MediatR. Every protected action carries `[Authorize(Policy = PermissionCode.XxxYyy)]`. Every async action accepts `CancellationToken ct`. All responses use `ApiResponseFactory.Create(result)`.

```csharp
// Kernel.API/Controllers/UsersController.cs
[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ISender _sender;

    public UsersController(ISender sender) => _sender = sender;

    [Authorize(Policy = nameof(PermissionCode.UserRead))]
    [HttpGet("{entraObjectId}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public async Task<IActionResult> GetUser(string entraObjectId, CancellationToken ct)
    {
        var result = await _sender.Send(new GetUserQuery(entraObjectId), ct);
        return ApiResponseFactory.Create(result);
    }
}
```

**Constraint 5:** Never use `[FromBody]` on primitive types. Always use a MediatR command or query record with a validator.

**Constraint 6:** Never return `IActionResult` when `ActionResult<T>` is possible — the typed return enables OpenAPI and Copilot to understand the response shape.

---

## MediatR Command/Query Pattern

Every feature operation is a MediatR command (state-changing) or query (read-only). Commands have FluentValidation validators that run as a pipeline behaviour. Handlers call `IPermissionEvaluator` for authorization and `IAuditQueue` for audit dispatch.

```csharp
// Kernel.Application/Features/UserRoleAssignments/AssignRole/AssignRoleCommand.cs
public record AssignRoleCommand(
    string EntraObjectId,
    string SolutionCode,
    string ModuleCode,
    string RoleCode,
    string AssignedByEntraObjectId,
    string AssignmentReason) : IRequest<RoleAssignmentResult>;

// Kernel.Application/Features/UserRoleAssignments/AssignRole/AssignRoleCommandValidator.cs
public class AssignRoleCommandValidator : AbstractValidator<AssignRoleCommand>
{
    public AssignRoleCommandValidator()
    {
        RuleFor(x => x.EntraObjectId)
            .NotEmpty().WithMessage("Entra Object ID is required.")
            .Matches(@"^[0-9a-fA-F\-]{36}$").WithMessage("Entra Object ID must be a valid GUID.");

        RuleFor(x => x.RoleCode)
            .NotEmpty().WithMessage("Role code is required.")
            .Matches(@"^[A-Z_]{2,50}$").WithMessage("Role code must be uppercase letters and underscores only.");

        RuleFor(x => x.AssignmentReason)
            .NotEmpty().WithMessage("Assignment reason is required for audit trail.")
            .MaximumLength(500);
    }
}
```

**Constraint 7:** The validator class must live in the same feature folder as the command/query it validates. Co-location ensures validators are always found, always updated, and never orphaned.

---

## EF Core Configuration and Repository Pattern

Repositories are defined as interfaces in `Kernel.Application` and implemented in `Kernel.Infrastructure`. No `DbContext` is injected outside of `Kernel.Infrastructure`. Permission evaluation queries use projection (`.Select()`) rather than full entity materialisation.

```csharp
// Kernel.Infrastructure/Persistence/Configurations/SecurityUserConfiguration.cs
public class SecurityUserConfiguration : IEntityTypeConfiguration<SecurityUser>
{
    public void Configure(EntityTypeBuilder<SecurityUser> builder)
    {
        builder.ToTable("security_users");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("security_user_pid");
        builder.Property(u => u.EntraObjectId).HasColumnName("entra_oid").HasMaxLength(36).IsRequired();
        builder.HasIndex(u => u.EntraObjectId).IsUnique();
        builder.Property(u => u.EntraEmailId).HasColumnName("entra_email_id").HasMaxLength(255).IsRequired();
        builder.HasIndex(u => u.EntraEmailId).IsUnique();
        builder.HasQueryFilter(u => !u.DeletedFlag); // Soft-delete global filter
    }
}
```

**Constraint 8:** Global query filters for `deleted_flag` must be applied on all entities except `AuditSession` and `AuditActionLog` (which are append-only and must always return all records).

**Constraint 9:** Any use of `.IgnoreQueryFilters()` requires the containing controller action to carry `[Authorize(Policy = PermissionCode.AdminRecoveryAccess)]`.

---

## Exception Handling — Domain Exception Reference

Domain exceptions in `Kernel.Application` map to HTTP status codes via the `IExceptionHandler` middleware in `Program.cs`. Never throw raw `System.Exception` from any handler.

| Exception Type | HTTP Status | When to Use |
|---|---|---|
| `PermissionDeniedException` | 403 | The user's role does not have sufficient permission flags for the operation |
| `ResourceNotFoundException` | 404 | The Entra Object ID or entity PID does not match any record |
| `ValidationException` | 400 | FluentValidation failure or business rule violation |
| `TenantResolutionException` | 400 | The TenantMiddleware could not resolve a tenant from JWT/header/subdomain |
| `ConflictException` | 409 | The target state already exists (e.g., role already active for that user-module) |

**Constraint 10:** All exceptions carry a correlation ID for Application Insights lookup. Stack traces never appear in API responses in any environment.

---

## IAuditQueue Usage

Every state-changing handler must enqueue an audit entry after the successful database operation. The queue is fire-and-forget — never `await` the enqueue on the request path. The audit entry includes `action_type`, `entity_type`, `entity_pid`, `old_value` (JSON before-state), and `new_value` (JSON after-state).

```csharp
// Inside a command handler, after successful DB write
_auditQueue.Enqueue(new AuditActionLogEntry
{
    SessionReferenceId = sessionId,
    SolutionModulePid = solutionModulePid,
    ActionType = "CREATE",
    EntityType = "MapSecurityUsersRoles",
    EntityPid = newAssignment.Id,
    OldValue = null,
    NewValue = JsonSerializer.Serialize(newAssignment),
    ActionTimestamp = DateTimeOffset.UtcNow
});
```

**Constraint 11:** `audit_sessions` and `audit_action_logs` are append-only. No `UPDATE` or `DELETE` statements may be generated for these tables. The application database login has `INSERT` privilege only on audit tables.

---

## Logging Standards

Structured logging uses `ILogger<T>` enriched with Application Insights. Every authorization-related log entry includes `security_user_pid`, `solution_module_pid`, `permission_code`, `evaluation_result`, and `duration_ms`. Request correlation IDs (from `X-Correlation-Id` header or auto-generated) are propagated through all log entries.

**Constraint 12:** Never log PII: no emails, display names, Entra Object IDs, JWT tokens, or SQL query text. Use `security_user_pid` (integer) or correlation IDs for tracing.

---

## Golden Handshake Exchange Endpoint

The `POST /api/v1/exchange/handshake` endpoint has a specific security-critical implementation order. The `is_used = 1` flag on the `handoff_tokens` record must be set as the **first** database operation (before any other validation) to prevent TOCTOU race conditions. Then validate expiry (`expires_at > GETUTCDATE()`), then validate `session_reference_id` against an active `audit_sessions` record, then validate the calling module's identity via `app_secret_hash` comparison. If any validation fails after `is_used = 1`, the code is consumed and invalidated.

**Constraint 13:** The `handoff_tokens` cleanup job (`HandoffTokenCleanupService : BackgroundService`) runs every 60 seconds and deletes expired tokens. This is one of the few places where `DELETE` is permitted — `handoff_tokens` is a short-lived operational table, not an audit table.

---

## xUnit Testing with Moq

**Constraint 14:** Every test class targets exactly one handler or service. Test class naming: `[TargetClass]Tests`. The test class constructor sets up all mock dependencies and creates the SUT.

**Constraint 15:** Each test method follows Arrange-Act-Assert with explicit section comments and one blank line between sections. One behavior per test.

**Constraint 16:** Never use `[Theory]` with `[InlineData]` for tests requiring different mock setups. Each distinct mock configuration is a separate `[Fact]`.

**Constraint 17:** RBAC matrix tests must cover all five roles (GLOBAL_ADMIN, ADMIN, COLLABORATOR, CONTRIBUTOR, VIEWER) across CRUD operations for every new permission code.

---

## Common Mistakes — What Not to Do

**Constraint 18:** Never use `Task.Run()` inside a handler to offload work — this creates thread pool pressure.

**Constraint 19:** Never catch `Exception` broadly at the handler level — catch only specific expected exceptions.

**Constraint 20:** Never use `HttpClient` directly — use `IHttpClientFactory` registered in DI.

**Constraint 21:** Never use synchronous blocking calls (`.Result`, `.Wait()`) on async operations.

**Constraint 22:** Never use `[AllowAnonymous]` on any endpoint that reads or mutates SecurityDB data. The only anonymous endpoint is `GET /health`.

---

## Backend Folder Structure

```
apps/api/
  Kernel.Domain/
    Entities/           # SecurityUser, SecurityRolePermission, etc.
    ValueObjects/       # EntraObjectId, PermissionCode, etc.
    Events/             # Domain events
  Kernel.Application/
    Authorization/      # IPermissionEvaluator, EvaluationResult
    Audit/              # IAuditQueue, AuditEntry
    Features/           # MediatR Commands and Queries per feature cluster
      Authentication/
      Users/
      Roles/
      Permissions/
      UserRoleAssignments/
      GoldenHandshake/
    Validators/         # Shared validation extensions
  Kernel.Infrastructure/
    Persistence/
      ApplicationDbContext.cs
      Configurations/   # EF Core IEntityTypeConfiguration classes
      Migrations/       # YYYYMMDD_<description> naming
    Authorization/      # PermissionEvaluatorService.cs
    Audit/              # AuditWriterService.cs (BackgroundService)
    BackgroundJobs/     # HandoffTokenCleanupService.cs
  Kernel.API/
    Controllers/
    Middleware/          # TenantMiddleware
    Program.cs           # FROZEN — middleware pipeline order
```
