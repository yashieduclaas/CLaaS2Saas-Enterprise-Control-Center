using System.Text.Json.Serialization;
using Kernel.Application.Abstractions;
using Kernel.Application.Authorization;
using Kernel.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kernel.API.Controllers;

/// <summary>
/// GET /api/v1/roles — List all roles in the current tenant.
///
/// MVP: Returns empty list until RoleRepository/EF is integrated.
/// Tenant scope enforced via ITenantContext from TenantMiddleware.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class RolesController : ControllerBase
{
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<RolesController> _logger;

    public RolesController(
        ITenantContext tenantContext,
        ILogger<RolesController> logger)
    {
        _tenantContext = tenantContext;
        _logger = logger;
    }

    /// <summary>
    /// Returns all roles defined in the caller's tenant.
    /// Requires ROLE:READ permission via IPermissionEvaluator.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = Policies.RoleRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RoleDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public ActionResult<ApiResponse<IReadOnlyList<RoleDto>>> ListRoles(CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "ListRoles: tenant={TenantId} correlationId={CorrelationId}",
            _tenantContext.TenantId,
            HttpContext.TraceIdentifier);

        // MVP: Empty list until feat-roles-read RoleRepository is integrated
        IReadOnlyList<RoleDto> roles = Array.Empty<RoleDto>();

        return Ok(ApiResponse<IReadOnlyList<RoleDto>>.Ok(roles));
    }
}

/// <summary>
/// DTO matching contracts/rbac/RoleDto. Id and UpdatedAt are strings per contract.
/// </summary>
public sealed record RoleDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("isSystemRole")] bool IsSystemRole,
    [property: JsonPropertyName("updatedAt")] string UpdatedAt);
