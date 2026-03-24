# ECC Backend Instructions — ASP.NET Core API Layer

> **Scope:** This file applies only when Copilot is working within `src/ECC.API/**`. It complements the workspace-wide instructions in `.github/copilot-instructions.md` with backend-specific detail that is too granular for the global file.
>
> **applyTo:** `src/ECC.API/**`

---

## Purpose

This file exists to give Copilot precise, ECC-specific backend patterns so that generated C# code is architecturally correct on the first pass. The workspace-wide instructions establish the rules; this file shows exactly how those rules are implemented in the ASP.NET Core API layer.

---

## MSAL Middleware Integration

Microsoft.Identity.Web is wired in `Program.cs` and handles all JWT validation automatically. Understanding what the middleware does is essential to avoiding redundant or conflicting code.

**What the middleware validates automatically (you must not re-implement any of this):**
The JWT signature is verified against Entra ID's published signing keys. The `aud` (audience) claim is checked against ECC's registered Application ID. The `iss` (issuer) claim is checked against the Entra ID tenant. Token expiry is enforced — expired tokens are rejected before your controller code runs.

**What your code is responsible for:**
Extracting the Entra Object ID from the validated claims via `User.FindFirst("oid").Value`. Passing that Object ID to the service layer for user resolution and role evaluation. Never parsing, decoding, or validating the JWT yourself — the middleware has already done this.

**Constraint 1:** Never write custom JWT validation logic. No `JwtSecurityTokenHandler`, no manual signature verification, no custom `TokenValidationParameters` outside of `Program.cs`. The middleware handles all of this. Custom validation code introduces security risk and maintenance burden.

**Constraint 2:** Never access `HttpContext.Request.Headers["Authorization"]` to extract the token manually. Use `User.FindFirst("oid")` on the `ClaimsPrincipal` that the middleware has already populated.

---

## FluentValidation Structure

Every request DTO must have a corresponding FluentValidation `AbstractValidator<T>` class. This is not optional — DTOs without validators fail Gate 3 review.

**Constraint 3:** The validator class must live in the same file as the DTO it validates. This co-location ensures validators are always found, always updated when the DTO changes, and never orphaned.

**Constraint 4:** The validator class is named `[DtoName]Validator`. For example, `AssignRoleRequestDto` has a validator named `AssignRoleRequestDtoValidator`.

**Constraint 5:** Use FluentValidation's rule builder methods (`RuleFor`, `NotEmpty`, `MaximumLength`, `Must`, `WithMessage`, `WithErrorCode`). Never use raw `ModelState.IsValid` checks in controllers — FluentValidation is registered in the DI pipeline and validation happens automatically before the controller action executes.

**Constraint 6:** Every validation rule must include a `.WithErrorCode()` that maps to an ECC error code (e.g., `VALIDATION_FAILED`). This error code flows through to the standard error envelope and is consumed by the frontend for user-facing messages.

```csharp
// Example: DTO and Validator co-located in the same file
namespace ECC.API.DTOs.Identity;

public class AssignRoleRequestDto
{
    public string EntraObjectId { get; set; } = string.Empty;
    public string SolutionCode { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string RoleCode { get; set; } = string.Empty;
    public string AssignedByEntraObjectId { get; set; } = string.Empty;
    public string AssignmentReason { get; set; } = string.Empty;
}

public class AssignRoleRequestDtoValidator : AbstractValidator<AssignRoleRequestDto>
{
    public AssignRoleRequestDtoValidator()
    {
        RuleFor(x => x.EntraObjectId)
            .NotEmpty().WithMessage("Entra Object ID is required.")
            .WithErrorCode("VALIDATION_FAILED");

        RuleFor(x => x.SolutionCode)
            .NotEmpty().WithMessage("Solution code is required.")
            .MaximumLength(10).WithMessage("Solution code must not exceed 10 characters.")
            .WithErrorCode("VALIDATION_FAILED");

        RuleFor(x => x.RoleCode)
            .NotEmpty().WithMessage("Role code is required.")
            .WithErrorCode("VALIDATION_FAILED");

        RuleFor(x => x.AssignmentReason)
            .NotEmpty().WithMessage("Assignment reason is required for audit trail.")
            .MaximumLength(500).WithMessage("Assignment reason must not exceed 500 characters.")
            .WithErrorCode("VALIDATION_FAILED");
    }
}
```

---

## xUnit Test Organization with Moq

**Constraint 7:** Every test class targets exactly one service or repository class. The test class is named `[TargetClass]Tests` and lives in the `tests/` directory mirroring the `src/` path structure. For example, tests for `ECC.API.Services.Identity.RoleAssignmentService` live in `tests/ECC.API.Tests/Services/Identity/RoleAssignmentServiceTests.cs`.

**Constraint 8:** The test class constructor sets up all mock dependencies and creates the system under test (SUT). This avoids duplication across test methods and ensures every test starts from a consistent mock state.

**Constraint 9:** Each test method follows Arrange-Act-Assert with explicit section comments and one blank line between sections.

```csharp
public class RoleAssignmentServiceTests
{
    private readonly Mock<ISecurityUserRepository> _mockUserRepo;
    private readonly Mock<ISecurityUserRoleRepository> _mockUserRoleRepo;
    private readonly Mock<ISecurityRolePermissionRepository> _mockRolePermRepo;
    private readonly Mock<IEventDispatcher> _mockEventDispatcher;
    private readonly RoleAssignmentService _sut;

    public RoleAssignmentServiceTests()
    {
        _mockUserRepo = new Mock<ISecurityUserRepository>();
        _mockUserRoleRepo = new Mock<ISecurityUserRoleRepository>();
        _mockRolePermRepo = new Mock<ISecurityRolePermissionRepository>();
        _mockEventDispatcher = new Mock<IEventDispatcher>();
        _sut = new RoleAssignmentService(
            _mockUserRepo.Object,
            _mockUserRoleRepo.Object,
            _mockRolePermRepo.Object,
            _mockEventDispatcher.Object);
    }

    [Fact]
    public async Task AssignRole_ValidRequest_ReturnsSuccessAndDispatchesEvent()
    {
        // Arrange
        var request = new AssignRoleRequestDto { /* ... */ };
        _mockUserRepo.Setup(r => r.GetByEntraObjectIdAsync(It.IsAny<string>()))
            .ReturnsAsync(new SecurityUser { /* ... */ });
        _mockRolePermRepo.Setup(r => r.GetByRoleCodeAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(new SecurityRolePermission { /* ... */ });

        // Act
        var result = await _sut.AssignRoleAsync(request);

        // Assert
        Assert.True(result.Success);
        _mockEventDispatcher.Verify(
            d => d.Dispatch(It.Is<RoleAssignedEvent>(e => e.EntraObjectId == request.EntraObjectId)),
            Times.Once());
    }
}
```

**Constraint 10:** Never use `[Theory]` with `[InlineData]` for tests that require different mock setups. Each distinct mock configuration is a separate `[Fact]` method. `[Theory]` is appropriate only when the mock setup is identical and only the input parameters differ.

---

## SQL Server Query Patterns with SqlCommand

**Constraint 11:** Every repository method follows this exact pattern for database access: open connection, create command, add parameters, execute, read results, return mapped domain objects. No shortcuts, no variations.

```csharp
public async Task<SecurityUser?> GetByEntraObjectIdAsync(string entraObjectId)
{
    await using var connection = new SqlConnection(_connectionString);
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        "SELECT Id, EntraObjectId, EntraEmail, DisplayName, IsActive " +
        "FROM Security_User WHERE EntraObjectId = @EntraObjectId",
        connection);

    // Every parameter added via SqlCommand.Parameters — never interpolated
    command.Parameters.AddWithValue("@EntraObjectId", entraObjectId);

    await using var reader = await command.ExecuteReaderAsync();

    if (!await reader.ReadAsync())
        return null;

    return new SecurityUser
    {
        Id = reader.GetInt32(reader.GetOrdinal("Id")),
        EntraObjectId = reader.GetString(reader.GetOrdinal("EntraObjectId")),
        EntraEmail = reader.GetString(reader.GetOrdinal("EntraEmail")),
        DisplayName = reader.GetString(reader.GetOrdinal("DisplayName")),
        IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
    };
}
```

**Constraint 12:** SQL strings use plain string concatenation (`"SELECT " + "FROM"`) for multi-line readability only — never with variable values. The `+` operator joins literal string segments; variables go into `Parameters` exclusively.

**Constraint 13:** Always use `reader.GetOrdinal("ColumnName")` for column access rather than integer index positions. Ordinal-based access is fragile when column order changes in the query; name-based access is self-documenting and resilient.

**Constraint 14:** Wrap the entire database operation in a try-catch that catches `SqlException` and rethrows as `AppException`:

```csharp
try
{
    // ... database operations ...
}
catch (SqlException ex)
{
    throw new AppException("DATABASE_ERROR",
        $"Failed to retrieve user record. SQL Error: {ex.Number}",
        ex);
}
```

**Constraint 15:** Never log the SQL query text, parameter values, or `SqlException.Message` in production log statements — these may contain PII or reveal schema details. Log only the error code and a sanitized description.

---

## AppException Usage — Error Code Reference

`AppException` (from `ECC.Shared.Errors`) is the only exception type that services may throw. Each error code maps to a specific HTTP status code in the controller layer's exception handling middleware.

**Constraint 16:** Use the correct error code for each failure scenario. Using the wrong code produces the wrong HTTP status code, which breaks frontend error handling.

| Error Code | HTTP Status | When to Use |
|-----------|------------|-------------|
| `IDENTITY_NOT_FOUND` | 404 | The Entra Object ID does not match any record in Security_User. This is the expected case for unprovisioned users. |
| `INSUFFICIENT_AUTHORITY` | 403 | The authenticated user does not hold a role with sufficient permission flags for the requested operation. For example, a Contributor attempting to assign a role (an Admin-only operation). |
| `VALIDATION_FAILED` | 400 | The request DTO failed FluentValidation. This code is also used for business rule validation failures (e.g., assigning a role that the target user already holds in an active state). |
| `ROLE_ALREADY_ACTIVE` | 409 | A role assignment was requested but the target user already has an active assignment for that role in that module. This is a conflict, not an error — the system state already satisfies the request. |
| `DATABASE_ERROR` | 500 | A SqlException occurred in the repository layer. The original exception is wrapped — the SQL details are not exposed to the caller. |

**Constraint 17:** Never throw `System.Exception`, `InvalidOperationException`, `ArgumentException`, or any other framework exception type from service methods. Always use `AppException` with the appropriate error code. This ensures the exception handling middleware can produce a consistent error envelope for every failure.

**Constraint 18:** The `AppException` constructor requires three arguments: `(string errorCode, string message, Exception? innerException)`. Always pass the inner exception when wrapping a caught exception — this preserves the stack trace for debugging while presenting a clean error to the caller.

---

## Common Mistakes — What Not to Do

**Constraint 19:** Never return `IActionResult` from a controller when you can return `ActionResult<T>`. The typed return enables Copilot and the OpenAPI generator to understand the response type.

**Constraint 20:** Never use `[FromBody]` on primitive types (string, int). Always use a DTO class with a validator. Primitive binding bypasses FluentValidation and leaves input unvalidated.

**Constraint 21:** Never use `Task.Run()` inside a service method to offload synchronous work. If the work is CPU-bound, document it and discuss with the Engineering Lead — `Task.Run` in ASP.NET Core creates thread pool pressure that degrades request throughput.

**Constraint 22:** Never catch `Exception` at the service layer "just in case." Catch only the specific exceptions you expect (e.g., `SqlException` in repositories, `AppException` propagated from dependencies). Broad catches hide bugs and make debugging impossible.

**Constraint 23:** Never use `HttpClient` directly in a service. Use `IHttpClientFactory` registered in DI. Direct `HttpClient` instantiation causes socket exhaustion under load.

---

## How This File Improves Copilot Output

This file gives Copilot precise, non-ambiguous patterns for every backend concern. When Copilot generates a repository method, it follows Constraint 11's exact pattern. When it generates a DTO, it co-locates the validator per Constraint 3. When it generates a test, it follows the mock setup pattern in Constraint 8. The specificity of these constraints eliminates the ambiguity that causes Copilot to fall back on generic ASP.NET Core patterns that violate ECC's architecture.
