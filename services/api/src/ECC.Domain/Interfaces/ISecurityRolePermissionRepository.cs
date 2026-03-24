using ECC.Domain.Entities;

namespace ECC.Domain.Interfaces;

/// <summary>
/// Repository interface for SecurityRolePermission entity operations.
/// </summary>
public interface ISecurityRolePermissionRepository
{
    /// <summary>Retrieves a role-permission record by its primary key.</summary>
    Task<SecurityRolePermission?> GetByIdAsync(Guid secRoleId);

    /// <summary>Retrieves all role-permissions for a given solution module.</summary>
    Task<IReadOnlyList<SecurityRolePermission>> GetByModuleIdAsync(Guid solutionModuleId);

    /// <summary>Retrieves a role-permission by role code and module ID.</summary>
    Task<SecurityRolePermission?> GetByRoleCodeAndModuleIdAsync(string roleCode, Guid solutionModuleId);

    /// <summary>Creates a new role-permission record.</summary>
    Task<SecurityRolePermission> CreateAsync(SecurityRolePermission rolePermission);

    /// <summary>Updates an existing role-permission record.</summary>
    Task UpdateAsync(SecurityRolePermission rolePermission);
}
