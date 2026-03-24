using ECC.Application.DTOs.Common;
using ECC.Application.DTOs.Identity;
using ECC.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECC.API.Controllers;

/// <summary>
/// Identity resolution and user management endpoints.
/// </summary>
[ApiController]
[Route("api/identity")]
[Authorize]
public sealed class IdentityController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public IdentityController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    /// <summary>
    /// Resolves the current user's security profile from their Entra Object ID.
    /// </summary>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(ApiResponse<UserSecurityProfileDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<UserSecurityProfileDto>>> GetProfile()
    {
        var entraObjectId = User.FindFirst("oid")!.Value;
        var profile = await _identityService.ResolveUserProfileAsync(entraObjectId);
        return Ok(ApiResponse<UserSecurityProfileDto>.Ok(profile));
    }

    /// <summary>
    /// Retrieves a paginated list of users.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<UserListItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<UserListItemDto>>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _identityService.GetUsersAsync(page, pageSize);
        return Ok(ApiResponse<PagedResult<UserListItemDto>>.Ok(result));
    }

    /// <summary>
    /// Retrieves a user by their internal ID.
    /// </summary>
    [HttpGet("users/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserSecurityProfileDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<UserSecurityProfileDto>>> GetUserById(Guid id)
    {
        var profile = await _identityService.GetUserByIdAsync(id);
        return Ok(ApiResponse<UserSecurityProfileDto>.Ok(profile));
    }
}
