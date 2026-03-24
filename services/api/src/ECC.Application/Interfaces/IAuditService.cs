using ECC.Application.DTOs.Audit;

namespace ECC.Application.Interfaces;

/// <summary>
/// Service interface for audit logging operations.
/// </summary>
public interface IAuditService
{
    /// <summary>Creates a new audit session.</summary>
    Task<AuditSessionDto> CreateSessionAsync(Guid userId, string ipAddress, string? deviceInfo, Guid? solutionModuleId);

    /// <summary>Logs an action within an existing audit session.</summary>
    Task<AuditActionLogDto> LogActionAsync(Guid auditSessionId, Guid userId, string actionName, string? permissionCode, string actionStatus, string? additionalInfo);

    /// <summary>Retrieves audit sessions for a user.</summary>
    Task<IReadOnlyList<AuditSessionDto>> GetSessionsByUserAsync(Guid userId);

    /// <summary>Retrieves audit action logs for a user.</summary>
    Task<IReadOnlyList<AuditActionLogDto>> GetActionsByUserAsync(Guid userId);
}
