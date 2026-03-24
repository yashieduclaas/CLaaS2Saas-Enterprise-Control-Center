using ECC.Domain.Entities;

namespace ECC.Domain.Interfaces;

/// <summary>
/// Repository interface for SecurityUserRole entity operations.
/// </summary>
public interface ISecurityUserRoleRepository
{
    /// <summary>Retrieves a user-role assignment by its primary key.</summary>
    Task<SecurityUserRole?> GetByIdAsync(Guid userRoleId);

    /// <summary>Retrieves all role assignments for a given user.</summary>
    Task<IReadOnlyList<SecurityUserRole>> GetByUserIdAsync(Guid userId);

    /// <summary>Retrieves active role assignments for a user, including navigation properties.</summary>
    Task<IReadOnlyList<SecurityUserRole>> GetActiveByUserIdAsync(Guid userId);

    /// <summary>Checks if an active assignment exists for user + module + role combination.</summary>
    Task<bool> ExistsActiveAssignmentAsync(Guid userId, Guid solutionModuleId, Guid secRoleId);

    /// <summary>Creates a new user-role assignment.</summary>
    Task<SecurityUserRole> CreateAsync(SecurityUserRole userRole);

    /// <summary>Updates an existing user-role assignment.</summary>
    Task UpdateAsync(SecurityUserRole userRole);
}
