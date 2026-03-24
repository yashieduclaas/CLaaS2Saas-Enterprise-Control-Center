using ECC.Domain.Entities;

namespace ECC.Domain.Interfaces;

/// <summary>
/// Repository interface for AuditSession entity operations.
/// </summary>
public interface IAuditSessionRepository
{
    /// <summary>Retrieves an audit session by its primary key.</summary>
    Task<AuditSession?> GetByIdAsync(Guid auditSessionId);

    /// <summary>Retrieves all audit sessions for a given user.</summary>
    Task<IReadOnlyList<AuditSession>> GetByUserIdAsync(Guid userId);

    /// <summary>Creates a new audit session.</summary>
    Task<AuditSession> CreateAsync(AuditSession session);

    /// <summary>Updates an existing audit session.</summary>
    Task UpdateAsync(AuditSession session);
}
