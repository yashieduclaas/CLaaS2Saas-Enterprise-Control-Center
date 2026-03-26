using System.Security.Claims;
using Kernel.Application.Abstractions;
using Kernel.Application.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kernel.API.Controllers;

/// <summary>
/// GET /api/v1/permissions/snapshot — Returns the set of permissions granted to the caller.
/// Used by frontend PermissionProvider. All checks flow through IPermissionEvaluator.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
[Produces("application/json")]
public sealed class PermissionsController : ControllerBase
{
    private readonly IPermissionEvaluator _evaluator;
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<PermissionsController> _logger;

    private static readonly string[] KnownPermissions =
    {
        Permissions.AdminGlobal,
        Permissions.UsersRead,
        Permissions.UsersWrite,
        Permissions.UsersDelete,
        Permissions.TenantRead,
        Permissions.TenantWrite,
        Permissions.RoleRead,
        Permissions.AuditViewActions,
    };

    public PermissionsController(
        IPermissionEvaluator evaluator,
        ITenantContext tenantContext,
        ILogger<PermissionsController> logger)
    {
        _evaluator = evaluator;
        _tenantContext = tenantContext;
        _logger = logger;
    }

    /// <summary>
    /// Returns the list of permission codes granted to the current principal in the current tenant.
    /// </summary>
    [HttpGet("snapshot")]
    [ProducesResponseType(typeof(PermissionSnapshotResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PermissionSnapshotResponse>> GetSnapshot(CancellationToken cancellationToken)
    {
        var tenantId = _tenantContext.TenantId ?? "UNRESOLVED";
        var principalId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("oid")?.Value
            ?? User.FindFirst("sub")?.Value
            ?? "UNKNOWN";

        var granted = new List<string>();
        foreach (var permission in KnownPermissions)
        {
            if (await _evaluator.EvaluateAsync(tenantId, principalId, permission, cancellationToken))
                granted.Add(permission);
        }

        _logger.LogDebug(
            "Permission snapshot: principal={PrincipalId} tenant={TenantId} count={Count}",
            principalId, tenantId, granted.Count);

        return Ok(new PermissionSnapshotResponse(granted));
    }
}

public sealed record PermissionSnapshotResponse(IReadOnlyList<string> Permissions);
