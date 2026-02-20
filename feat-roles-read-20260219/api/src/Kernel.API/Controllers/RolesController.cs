// apps/api/src/Kernel.API/Controllers/RolesController.cs
using Kernel.Application.Authorization;
using Kernel.Application.Features.Roles.Queries;
using Kernel.Application.Tenant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kernel.API.Controllers;

/// <summary>
/// GET /api/v1/roles — List all roles in the current tenant.
///
/// CONSTITUTIONAL COMPLIANCE:
///   ✅ [ApiController]
///   ✅ [Route("api/v1/[controller]")] — versioned route
///   ✅ [Authorize(Policy = PolicyNames.RolesRead)] on every action
///   ✅ CancellationToken on every async action
///   ✅ ApiEnvelope response wrapper
///   ✅ ProblemDetails via AddProblemDetails() (platform-wired)
///   ✅ Zero business logic — one handler call + one response wrap
///   ✅ Structured logging with correlation ID
///   ✅ tenantId sourced exclusively from TenantContext (never querystring)
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class RolesController : ControllerBase
{
    private readonly ListRolesQueryHandler _handler;
    private readonly ITenantContextAccessor _tenantContextAccessor;
    private readonly ILogger<RolesController> _logger;

    public RolesController(
        ListRolesQueryHandler handler,
        ITenantContextAccessor tenantContextAccessor,
        ILogger<RolesController> logger)
    {
        _handler = handler;
        _tenantContextAccessor = tenantContextAccessor;
        _logger = logger;
    }

    /// <summary>
    /// Returns all roles defined in the caller's tenant.
    /// Requires the ROLES:READ permission evaluated via IPermissionEvaluator.
    /// </summary>
    /// <remarks>
    /// The response is an ApiEnvelope wrapping a read-only list of RoleDto.
    /// Tenant scope is enforced by:
    ///   1. TenantMiddleware resolves tenantId from the JWT tid claim.
    ///   2. The query handler passes tenantId to IRoleRepository.
    ///   3. EF global query filter enforces WHERE TenantId = @tenantId at the DB layer.
    /// </remarks>
    [HttpGet]
    [Authorize(Policy = PolicyNames.RolesRead)]
    [ProducesResponseType(typeof(ApiEnvelope<IReadOnlyList<RoleDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ListRolesAsync(CancellationToken cancellationToken)
    {
        var tenantContext = _tenantContextAccessor.GetRequiredContext();

        _logger.LogInformation(
            "ListRoles: tenant={TenantId} correlationId={CorrelationId}",
            tenantContext.TenantId,
            HttpContext.TraceIdentifier);

        var result = await _handler.HandleAsync(
            new ListRolesQuery(tenantContext.TenantId),
            cancellationToken);

        return Ok(ApiEnvelope<IReadOnlyList<RoleDto>>.Ok(result.Roles, HttpContext.TraceIdentifier));
    }
}

// ── Response envelope ──────────────────────────────────────────────────────
// Mirrors the TypeScript ApiEnvelope<T> in packages/contracts/src/api/index.ts.
// NOTE: Move this to a shared location (e.g. Kernel.API/Infrastructure/ApiEnvelope.cs)
// if a second controller needs it. Keep DRY.

/// <summary>
/// Typed API response envelope.
/// Aligns with contracts/api ApiEnvelope shape.
/// </summary>
public sealed record ApiEnvelope<T>
{
    public required T Data { get; init; }
    public required bool Success { get; init; }
    public string? CorrelationId { get; init; }

    public static ApiEnvelope<T> Ok(T data, string? correlationId = null) =>
        new() { Data = data, Success = true, CorrelationId = correlationId };
}
