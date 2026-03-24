namespace ECC.Application.DTOs.Audit;

/// <summary>
/// Response DTO for audit session data.
/// </summary>
public sealed record AuditSessionDto(
    Guid AuditSessionId,
    Guid UserId,
    DateTimeOffset SessionStartTime,
    DateTimeOffset? SessionEndTime,
    string? IpAddress,
    string? DeviceInfo,
    Guid? SolutionModuleId,
    bool IsSuccess,
    string? Reason);

/// <summary>
/// Response DTO for audit action log data.
/// </summary>
public sealed record AuditActionLogDto(
    Guid AuditActionId,
    Guid AuditSessionId,
    Guid UserId,
    DateTimeOffset ActionTimestamp,
    Guid? SolutionModuleId,
    string ActionName,
    string? PermissionCode,
    string ActionStatus,
    string? AdditionalInfo);
