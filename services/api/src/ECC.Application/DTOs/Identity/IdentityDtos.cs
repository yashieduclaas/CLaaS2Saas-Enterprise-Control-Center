namespace ECC.Application.DTOs.Identity;

/// <summary>
/// Complete security profile returned after user resolution.
/// </summary>
public sealed record UserSecurityProfileDto(
    Guid UserId,
    string EntraObjectId,
    string DisplayName,
    string Email,
    bool IsActive,
    DateTimeOffset? LastLoginDate,
    IReadOnlyList<AuthorizedModuleDto> AuthorizedModules);

/// <summary>
/// A module the user is authorized to access, with their role and permissions.
/// </summary>
public sealed record AuthorizedModuleDto(
    Guid SolutionModuleId,
    string SolutionCode,
    string ModuleCode,
    string ModuleName,
    string RoleCode,
    string RoleName,
    ModulePermissionsDto Permissions);

/// <summary>
/// Permission flags for a specific module.
/// </summary>
public sealed record ModulePermissionsDto(
    bool CanRead,
    bool CanCreate,
    bool CanUpdate,
    bool CanDelete,
    bool FullAccessAllModules);

/// <summary>
/// Summary DTO for user listing endpoints.
/// </summary>
public sealed record UserListItemDto(
    Guid UserId,
    string DisplayName,
    string Email,
    bool IsActive,
    DateTimeOffset? LastLoginDate,
    int ActiveRoleCount);
