using ECC.Application.DTOs.Common;
using ECC.Application.DTOs.Identity;
using ECC.Application.DTOs.Rbac;
using ECC.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECC.API.Controllers;

/// <summary>
/// RBAC operations: role assignment, revocation, and permission queries.
/// </summary>
[ApiController]
[Route("api/rbac")]
[Authorize]
public sealed class RbacController : ControllerBase
{
    private readonly IRbacService _rbacService;

    public RbacController(IRbacService rbacService)
    {
        _rbacService = rbacService;
    }

    /// <summary>
    /// Assigns a role to a target user.
    /// </summary>
    [HttpPost("assign-role")]
    [ProducesResponseType(typeof(ApiResponse<RoleAssignmentResultDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<RoleAssignmentResultDto>>> AssignRole(
        [FromBody] AssignRoleRequestDto request)
    {
        var assignerEntraObjectId = User.FindFirst("oid")!.Value;
        var result = await _rbacService.AssignRoleAsync(request, assignerEntraObjectId);
        return Ok(ApiResponse<RoleAssignmentResultDto>.Ok(result));
    }

    /// <summary>
    /// Revokes a role assignment from a user.
    /// </summary>
    [HttpPost("revoke-role")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> RevokeRole(
        [FromBody] RevokeRoleRequestDto request)
    {
        var revokerEntraObjectId = User.FindFirst("oid")!.Value;
        await _rbacService.RevokeRoleAsync(request, revokerEntraObjectId);
        return Ok(new ApiResponse<object>(true, null));
    }

    /// <summary>
    /// Retrieves role-permission definitions for a solution + module combination.
    /// </summary>
    [HttpGet("permissions/{solution}/{module}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RolePermissionDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RolePermissionDto>>>> GetPermissions(
        string solution, string module)
    {
        var permissions = await _rbacService.GetRolePermissionsByModuleAsync(solution, module);
        return Ok(ApiResponse<IReadOnlyList<RolePermissionDto>>.Ok(permissions));
    }
}
