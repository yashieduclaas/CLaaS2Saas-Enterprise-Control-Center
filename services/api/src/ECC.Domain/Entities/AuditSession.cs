namespace ECC.Domain.Entities;

/// <summary>
/// Represents an audit session logged when a user accesses the platform.
/// Maps to SecurityDB_Audit_Session table.
/// </summary>
public class AuditSession
{
    public Guid AuditSessionId { get; set; }
    public Guid UserId { get; set; }
    public string EntraEmailId { get; set; } = string.Empty;
    public DateTimeOffset SessionStartTime { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? SessionEndTime { get; set; }
    public string? IpAddress { get; set; }
    public string? DeviceInfo { get; set; }
    public string? Location { get; set; }
    public Guid? SolutionModuleId { get; set; }
    public string? SessionTokenId { get; set; }
    public bool IsSuccess { get; set; } = true;
    public string? Reason { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public SecurityUser User { get; set; } = null!;
    public SolutionModule? SolutionModule { get; set; }
    public ICollection<AuditActionLog> ActionLogs { get; set; } = new List<AuditActionLog>();
}
