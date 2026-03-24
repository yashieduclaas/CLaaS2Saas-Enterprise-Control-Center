using ECC.Application.DTOs.Identity;
using ECC.Application.DTOs.Rbac;
using ECC.Application.Interfaces;
using ECC.Domain.Entities;
using ECC.Domain.Enums;
using ECC.Domain.Events;
using ECC.Domain.Exceptions;
using ECC.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECC.Application.Services;

/// <summary>
/// Implements RBAC operations including role assignment with privilege escalation guard.
/// </summary>
public sealed class RbacService : IRbacService
{
    private readonly ISecurityUserRepository _userRepository;
    private readonly ISecurityUserRoleRepository _userRoleRepository;
    private readonly ISecurityRolePermissionRepository _rolePermissionRepository;
    private readonly ISolutionModuleRepository _moduleRepository;
    private readonly IEventDispatcher _eventDispatcher;
    private readonly ILogger<RbacService> _logger;

    public RbacService(
        ISecurityUserRepository userRepository,
        ISecurityUserRoleRepository userRoleRepository,
        ISecurityRolePermissionRepository rolePermissionRepository,
        ISolutionModuleRepository moduleRepository,
        IEventDispatcher eventDispatcher,
        ILogger<RbacService> logger)
    {
        _userRepository = userRepository;
        _userRoleRepository = userRoleRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _moduleRepository = moduleRepository;
        _eventDispatcher = eventDispatcher;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<RoleAssignmentResultDto> AssignRoleAsync(AssignRoleRequestDto request, string assignerEntraObjectId)
    {
        // 1. Resolve target user (auto-provision if not found — BR-03)
        var targetUser = await _userRepository.GetByEntraObjectIdAsync(request.TargetEntraObjectId);
        if (targetUser is null)
        {
            targetUser = new SecurityUser
            {
                UserId = Guid.NewGuid(),
                EntraObjectId = request.TargetEntraObjectId,
                DisplayName = "Provisioned User",
                Email = string.Empty,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = assignerEntraObjectId
            };
            targetUser = await _userRepository.CreateAsync(targetUser);
            await _eventDispatcher.Dispatch(new UserProvisionedEvent(targetUser.UserId, targetUser.EntraObjectId));
        }

        // 2. Resolve assigner user
        var assignerUser = await _userRepository.GetByEntraObjectIdAsync(assignerEntraObjectId);
        if (assignerUser is null)
            throw new AppException(ErrorCodes.IdentityNotFound, "Assigner user not found.");

        // 3. Resolve solution-module by codes
        var module = await _moduleRepository.GetByCodesAsync(request.SolutionCode, request.ModuleCode);
        if (module is null)
            throw new AppException(ErrorCodes.ValidationFailed, "Solution module not found.");

        // 4. Resolve target role by code + module
        var rolePermission = await _rolePermissionRepository.GetByRoleCodeAndModuleIdAsync(request.RoleCode, module.SolutionModuleId);
        if (rolePermission is null)
            throw new AppException(ErrorCodes.ValidationFailed, "Role not found for the specified module.");

        // 5. PRIVILEGE ESCALATION GUARD: Admin/GlobalAdmin requires assigner to have FullAccessAllModules
        if (request.RoleCode is RoleCodes.Admin or RoleCodes.GlobalAdmin)
        {
            var assignerRoles = await _userRoleRepository.GetActiveByUserIdAsync(assignerUser.UserId);
            var hasFullAccess = assignerRoles.Any(r => r.RolePermission.FullAccessAllModules);
            if (!hasFullAccess)
                throw new AppException(ErrorCodes.InsufficientAuthority, "Assigner does not have authority to assign Admin or Global Admin roles.");
        }

        // 6. Check for existing active assignment
        var exists = await _userRoleRepository.ExistsActiveAssignmentAsync(
            targetUser.UserId, module.SolutionModuleId, rolePermission.SecRoleId);
        if (exists)
            throw new AppException(ErrorCodes.RoleAlreadyActive, "User already has an active assignment for this role and module.");

        // 7. Create assignment
        var assignment = new SecurityUserRole
        {
            UserRoleId = Guid.NewGuid(),
            UserId = targetUser.UserId,
            SolutionModuleId = module.SolutionModuleId,
            SecRoleId = rolePermission.SecRoleId,
            AssignedByUserId = assignerUser.UserId,
            AssignedDate = DateTimeOffset.UtcNow,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = assignerEntraObjectId
        };
        await _userRoleRepository.CreateAsync(assignment);

        // 8. Dispatch event
        await _eventDispatcher.Dispatch(new RoleAssignedEvent(
            assignment.UserRoleId,
            targetUser.UserId,
            rolePermission.SecRoleId,
            module.SolutionModuleId,
            assignerUser.UserId));

        _logger.LogInformation("Role assigned: userRoleId={UserRoleId}, role={RoleCode}, module={ModuleCode}",
            assignment.UserRoleId, request.RoleCode, request.ModuleCode);

        // 9. Return result
        return new RoleAssignmentResultDto(
            assignment.UserRoleId,
            targetUser.UserId,
            request.RoleCode,
            request.SolutionCode,
            request.ModuleCode,
            assignment.AssignedDate);
    }

    /// <inheritdoc />
    public async Task RevokeRoleAsync(RevokeRoleRequestDto request, string revokerEntraObjectId)
    {
        var assignment = await _userRoleRepository.GetByIdAsync(request.UserRoleId);
        if (assignment is null)
            throw new AppException(ErrorCodes.ValidationFailed, "Role assignment not found.");

        var revokerUser = await _userRepository.GetByEntraObjectIdAsync(revokerEntraObjectId);
        if (revokerUser is null)
            throw new AppException(ErrorCodes.IdentityNotFound, "Revoker user not found.");

        assignment.IsActive = false;
        assignment.DisabledDate = DateTimeOffset.UtcNow;
        assignment.UpdatedAt = DateTimeOffset.UtcNow;
        assignment.UpdatedBy = revokerEntraObjectId;
        await _userRoleRepository.UpdateAsync(assignment);

        await _eventDispatcher.Dispatch(new RoleRevokedEvent(
            assignment.UserRoleId,
            assignment.UserId,
            assignment.SecRoleId,
            assignment.SolutionModuleId,
            revokerUser.UserId));

        _logger.LogInformation("Role revoked: userRoleId={UserRoleId}", assignment.UserRoleId);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<RolePermissionDto>> GetRolePermissionsByModuleAsync(string solutionCode, string moduleCode)
    {
        var module = await _moduleRepository.GetByCodesAsync(solutionCode, moduleCode);
        if (module is null)
            throw new AppException(ErrorCodes.ValidationFailed, "Solution module not found.");

        var permissions = await _rolePermissionRepository.GetByModuleIdAsync(module.SolutionModuleId);

        return permissions.Select(rp => new RolePermissionDto(
            rp.SecRoleId,
            rp.RoleCode,
            rp.RoleName,
            rp.CanRead,
            rp.CanCreate,
            rp.CanUpdate,
            rp.CanDelete,
            rp.FullAccessAllModules)).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<AuthorizedModuleDto>> GetAuthorizedModulesAsync(string entraObjectId)
    {
        var user = await _userRepository.GetByEntraObjectIdAsync(entraObjectId);
        if (user is null)
            throw new AppException(ErrorCodes.IdentityNotFound, "User not found.");

        var activeRoles = await _userRoleRepository.GetActiveByUserIdAsync(user.UserId);

        return activeRoles.Select(ur => new AuthorizedModuleDto(
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
    }
}
