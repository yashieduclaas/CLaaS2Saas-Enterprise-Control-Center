using ECC.Application.DTOs.Audit;
using ECC.Application.DTOs.Common;
using ECC.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECC.API.Controllers;

/// <summary>
/// Audit session and action log query endpoints.
/// </summary>
[ApiController]
[Route("api/audit")]
[Authorize]
public sealed class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    /// <summary>
    /// Retrieves audit sessions for a user.
    /// </summary>
    [HttpGet("sessions/{userId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AuditSessionDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AuditSessionDto>>>> GetSessions(Guid userId)
    {
        var sessions = await _auditService.GetSessionsByUserAsync(userId);
        return Ok(ApiResponse<IReadOnlyList<AuditSessionDto>>.Ok(sessions));
    }

    /// <summary>
    /// Retrieves audit action logs for a user.
    /// </summary>
    [HttpGet("actions/{userId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AuditActionLogDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AuditActionLogDto>>>> GetActions(Guid userId)
    {
        var actions = await _auditService.GetActionsByUserAsync(userId);
        return Ok(ApiResponse<IReadOnlyList<AuditActionLogDto>>.Ok(actions));
    }
}
