using ECC.Application.DTOs.Common;
using ECC.Application.DTOs.Identity;
using ECC.Application.Interfaces;
using ECC.Domain.Enums;
using ECC.Domain.Events;
using ECC.Domain.Exceptions;
using ECC.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECC.Application.Services;

/// <summary>
/// Resolves user identity and builds security profiles.
/// </summary>
public sealed class IdentityService : IIdentityService
{
    private readonly ISecurityUserRepository _userRepository;
    private readonly ISecurityUserRoleRepository _userRoleRepository;
    private readonly IEventDispatcher _eventDispatcher;
    private readonly ILogger<IdentityService> _logger;

    public IdentityService(
        ISecurityUserRepository userRepository,
        ISecurityUserRoleRepository userRoleRepository,
        IEventDispatcher eventDispatcher,
        ILogger<IdentityService> logger)
    {
        _userRepository = userRepository;
        _userRoleRepository = userRoleRepository;
        _eventDispatcher = eventDispatcher;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<UserSecurityProfileDto> ResolveUserProfileAsync(string entraObjectId)
    {
        if (string.IsNullOrWhiteSpace(entraObjectId))
            throw new AppException(ErrorCodes.ValidationFailed, "Entra Object ID must not be empty.");

        var user = await _userRepository.GetByEntraObjectIdAsync(entraObjectId);
        if (user is null)
            throw new AppException(ErrorCodes.IdentityNotFound, "User not found.");

        if (!user.IsActive)
            throw new AppException(ErrorCodes.IdentityNotFound, "User account is deactivated.");

        // Update last login
        user.LastLoginDate = DateTimeOffset.UtcNow;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Load active role assignments with navigation
        var activeRoles = await _userRoleRepository.GetActiveByUserIdAsync(user.UserId);

        var authorizedModules = activeRoles.Select(ur => new AuthorizedModuleDto(
            ur.SolutionModuleId,
            ur.SolutionModule.SolutionCode,
            ur.SolutionModule.ModuleCode,
            ur.SolutionModule.ModuleName,
            ur.RolePermission.RoleCode,
            ur.RolePermission.RoleName,
            new ModulePermissionsDto(
                ur.RolePermission.CanRead,
                ur.RolePermission.CanCreate,
                ur.RolePermission.CanUpdate,
                ur.RolePermission.CanDelete,
                ur.RolePermission.FullAccessAllModules)
        )).ToList();

        // Dispatch audit event
        await _eventDispatcher.Dispatch(new UserResolvedEvent(
            user.UserId, entraObjectId, authorizedModules.Count));

        _logger.LogInformation("User profile resolved for userId={UserId}, modules={ModuleCount}",
            user.UserId, authorizedModules.Count);

        return new UserSecurityProfileDto(
            user.UserId,
            user.EntraObjectId,
            user.DisplayName,
            user.Email,
            user.IsActive,
            user.LastLoginDate,
            authorizedModules);
    }

    /// <inheritdoc />
    public async Task<PagedResult<UserListItemDto>> GetUsersAsync(int page, int pageSize)
    {
        var users = await _userRepository.GetAllActiveAsync(page, pageSize);
        var totalCount = await _userRepository.GetActiveCountAsync();

        var items = new List<UserListItemDto>();
        foreach (var user in users)
        {
            var roles = await _userRoleRepository.GetActiveByUserIdAsync(user.UserId);
            items.Add(new UserListItemDto(
                user.UserId,
                user.DisplayName,
                user.Email,
                user.IsActive,
                user.LastLoginDate,
                roles.Count));
        }

        return new PagedResult<UserListItemDto>(items, totalCount, page, pageSize);
    }

    /// <inheritdoc />
    public async Task<UserSecurityProfileDto> GetUserByIdAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
            throw new AppException(ErrorCodes.IdentityNotFound, "User not found.");

        var activeRoles = await _userRoleRepository.GetActiveByUserIdAsync(user.UserId);

        var authorizedModules = activeRoles.Select(ur => new AuthorizedModuleDto(
            ur.SolutionModuleId,
            ur.SolutionModule.SolutionCode,
            ur.SolutionModule.ModuleCode,
            ur.SolutionModule.ModuleName,
            ur.RolePermission.RoleCode,
            ur.RolePermission.RoleName,
            new ModulePermissionsDto(
                ur.RolePermission.CanRead,
                ur.RolePermission.CanCreate,
                ur.RolePermission.CanUpdate,
                ur.RolePermission.CanDelete,
                ur.RolePermission.FullAccessAllModules)
        )).ToList();

        return new UserSecurityProfileDto(
            user.UserId,
            user.EntraObjectId,
            user.DisplayName,
            user.Email,
            user.IsActive,
            user.LastLoginDate,
            authorizedModules);
    }
}
