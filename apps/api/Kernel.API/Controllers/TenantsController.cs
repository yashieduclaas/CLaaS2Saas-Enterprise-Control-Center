using Kernel.Application.Abstractions;
using Kernel.Application.Authorization;
using Kernel.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kernel.API.Controllers;

/// <summary>
/// Reference controller — gold template for all feature pods.
///
/// Rules:
/// - Always [Authorize(Policy = …)] using Policies constants
/// - Always accept CancellationToken
/// - Always return ApiResponse&lt;T&gt;
/// - Log with tenant context
/// - No business logic here
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Policy = Policies.TenantRead)]
public sealed class TenantsController : ControllerBase
{
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<TenantsController> _logger;

    public TenantsController(
        ITenantContext tenantContext,
        ILogger<TenantsController> logger)
    {
        _tenantContext = tenantContext;
        _logger        = logger;
    }

    /// <summary>Returns the resolved tenant context for the current caller.</summary>
    [HttpGet("current")]
    [ProducesResponseType(typeof(ApiResponse<TenantSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public ActionResult<ApiResponse<TenantSummaryDto>> GetCurrentTenant(
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "TenantsController.GetCurrentTenant tenant={TenantId}", _tenantContext.TenantId);

        return Ok(ApiResponse<TenantSummaryDto>.Ok(new TenantSummaryDto(_tenantContext.TenantId!)));
    }
}

public sealed record TenantSummaryDto(string TenantId);
