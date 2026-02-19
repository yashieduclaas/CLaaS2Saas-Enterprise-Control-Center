using System.Text.Json.Serialization;
using Kernel.Application.Abstractions;
using Kernel.Application.Authorization;
using Kernel.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kernel.API.Controllers;

/// <summary>
/// GET /api/v1/audit/actions — Paginated audit action logs.
/// Tenant scope from ITenantContext (never from user input).
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class AuditController : ControllerBase
{
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<AuditController> _logger;

    public AuditController(
        ITenantContext tenantContext,
        ILogger<AuditController> logger)
    {
        _tenantContext = tenantContext;
        _logger = logger;
    }

    /// <summary>
    /// Returns paginated audit action logs for the current tenant.
    /// Requires AUDIT:VIEW_ACTIONS permission.
    /// </summary>
    [HttpGet("actions")]
    [Authorize(Policy = Policies.AuditViewActions)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AuditActionLogDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public ActionResult<ApiResponse<IReadOnlyList<AuditActionLogDto>>> GetActions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "GetAuditActions: tenant={TenantId} page={Page}",
            _tenantContext.TenantId, page);

        // MVP: Empty list until IAuditRepository/EF is integrated
        IReadOnlyList<AuditActionLogDto> items = Array.Empty<AuditActionLogDto>();
        return Ok(ApiResponse<IReadOnlyList<AuditActionLogDto>>.Ok(items));
    }
}

public sealed record AuditActionLogDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("tenantId")] string TenantId,
    [property: JsonPropertyName("userId")] string UserId,
    [property: JsonPropertyName("action")] string Action,
    [property: JsonPropertyName("resource")] string Resource,
    [property: JsonPropertyName("result")] string Result,
    [property: JsonPropertyName("permissionsVersion")] string? PermissionsVersion,
    [property: JsonPropertyName("timestamp")] string Timestamp);
