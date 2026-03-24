using ECC.Domain.Entities;

namespace ECC.Domain.Interfaces;

/// <summary>
/// Repository interface for SecurityUser entity operations.
/// </summary>
public interface ISecurityUserRepository
{
    /// <summary>Retrieves a user by their primary key.</summary>
    Task<SecurityUser?> GetByIdAsync(Guid userId);

    /// <summary>Retrieves a user by their Entra Object ID.</summary>
    Task<SecurityUser?> GetByEntraObjectIdAsync(string entraObjectId);

    /// <summary>Retrieves a paginated list of active users.</summary>
    Task<IReadOnlyList<SecurityUser>> GetAllActiveAsync(int page, int pageSize);

    /// <summary>Returns the count of active users.</summary>
    Task<int> GetActiveCountAsync();

    /// <summary>Creates a new security user.</summary>
    Task<SecurityUser> CreateAsync(SecurityUser user);

    /// <summary>Updates an existing security user.</summary>
    Task UpdateAsync(SecurityUser user);
}
