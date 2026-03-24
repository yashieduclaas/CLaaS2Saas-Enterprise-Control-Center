using ECC.Application.DTOs.Rbac;

namespace ECC.Application.Interfaces;

/// <summary>
/// Service interface for RBAC operations — role assignment, revocation, and permission queries.
/// </summary>
public interface IRbacService
{
    /// <summary>
    /// Assigns a role to a target user. Includes privilege escalation guard.
    /// </summary>
    /// <param name="request">The role assignment request.</param>
    /// <param name="assignerEntraObjectId">The Entra Object ID of the assigner.</param>
    /// <returns>The assignment result.</returns>
    Task<RoleAssignmentResultDto> AssignRoleAsync(AssignRoleRequestDto request, string assignerEntraObjectId);

    /// <summary>
    /// Revokes a role assignment from a user.
    /// </summary>
    /// <param name="request">The revocation request.</param>
    /// <param name="revokerEntraObjectId">The Entra Object ID of the revoker.</param>
    Task RevokeRoleAsync(RevokeRoleRequestDto request, string revokerEntraObjectId);

    /// <summary>
    /// Retrieves all role-permission definitions for a solution + module combination.
    /// </summary>
    Task<IReadOnlyList<RolePermissionDto>> GetRolePermissionsByModuleAsync(string solutionCode, string moduleCode);

    /// <summary>
    /// Retrieves authorized modules for a user.
    /// </summary>
    Task<IReadOnlyList<ECC.Application.DTOs.Identity.AuthorizedModuleDto>> GetAuthorizedModulesAsync(string entraObjectId);
}
