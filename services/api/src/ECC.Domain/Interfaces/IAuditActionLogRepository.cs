using ECC.Domain.Entities;

namespace ECC.Domain.Interfaces;

/// <summary>
/// Repository interface for AuditActionLog entity operations.
/// </summary>
public interface IAuditActionLogRepository
{
    /// <summary>Retrieves an audit action log by its primary key.</summary>
    Task<AuditActionLog?> GetByIdAsync(Guid auditActionId);

    /// <summary>Retrieves all audit action logs for a given session.</summary>
    Task<IReadOnlyList<AuditActionLog>> GetBySessionIdAsync(Guid auditSessionId);

    /// <summary>Retrieves all audit action logs for a given user.</summary>
    Task<IReadOnlyList<AuditActionLog>> GetByUserIdAsync(Guid userId);

    /// <summary>Creates a new audit action log.</summary>
    Task<AuditActionLog> CreateAsync(AuditActionLog actionLog);
}
