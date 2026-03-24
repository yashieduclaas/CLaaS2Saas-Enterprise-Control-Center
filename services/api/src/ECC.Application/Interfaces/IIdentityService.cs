using ECC.Application.DTOs.Common;
using ECC.Application.DTOs.Identity;

namespace ECC.Application.Interfaces;

/// <summary>
/// Service interface for identity resolution and user management.
/// </summary>
public interface IIdentityService
{
    /// <summary>
    /// Resolves a user's complete security profile by their Entra Object ID.
    /// Updates last login date and dispatches UserResolvedEvent.
    /// </summary>
    /// <param name="entraObjectId">The Entra Object ID of the user.</param>
    /// <returns>The user's complete security profile.</returns>
    /// <exception cref="ECC.Domain.Exceptions.AppException">IDENTITY_NOT_FOUND if user does not exist or is deactivated.</exception>
    Task<UserSecurityProfileDto> ResolveUserProfileAsync(string entraObjectId);

    /// <summary>
    /// Retrieves a paginated list of users.
    /// </summary>
    Task<PagedResult<UserListItemDto>> GetUsersAsync(int page, int pageSize);

    /// <summary>
    /// Retrieves a user by their internal ID.
    /// </summary>
    Task<UserSecurityProfileDto> GetUserByIdAsync(Guid userId);
}
