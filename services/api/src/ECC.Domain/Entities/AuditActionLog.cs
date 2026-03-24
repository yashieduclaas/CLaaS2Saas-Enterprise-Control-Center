namespace ECC.Domain.Entities;

/// <summary>
/// Represents an individual audit action log entry within a session.
/// Maps to SecurityDB_Audit_Action_Log table.
/// </summary>
public class AuditActionLog
{
    public Guid AuditActionId { get; set; }
    public Guid AuditSessionId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset ActionTimestamp { get; set; } = DateTimeOffset.UtcNow;
    public Guid? SolutionModuleId { get; set; }
    public string ActionName { get; set; } = string.Empty;
    public string? PermissionCode { get; set; }
    public string ActionStatus { get; set; } = string.Empty;
    public string? AdditionalInfo { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public AuditSession AuditSession { get; set; } = null!;
}
