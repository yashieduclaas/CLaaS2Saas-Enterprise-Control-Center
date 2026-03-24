using ECC.Application.DTOs.Audit;
using ECC.Application.Interfaces;
using ECC.Domain.Entities;
using ECC.Domain.Events;
using ECC.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECC.Application.Services;

/// <summary>
/// Manages audit session and action log operations.
/// </summary>
public sealed class AuditService : IAuditService
{
    private readonly IAuditSessionRepository _sessionRepository;
    private readonly IAuditActionLogRepository _actionLogRepository;
    private readonly IEventDispatcher _eventDispatcher;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        IAuditSessionRepository sessionRepository,
        IAuditActionLogRepository actionLogRepository,
        IEventDispatcher eventDispatcher,
        ILogger<AuditService> logger)
    {
        _sessionRepository = sessionRepository;
        _actionLogRepository = actionLogRepository;
        _eventDispatcher = eventDispatcher;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<AuditSessionDto> CreateSessionAsync(Guid userId, string ipAddress, string? deviceInfo, Guid? solutionModuleId)
    {
        var session = new AuditSession
        {
            AuditSessionId = Guid.NewGuid(),
            UserId = userId,
            SessionStartTime = DateTimeOffset.UtcNow,
            IpAddress = ipAddress,
            DeviceInfo = deviceInfo,
            SolutionModuleId = solutionModuleId,
            IsSuccess = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = userId.ToString()
        };

        session = await _sessionRepository.CreateAsync(session);

        await _eventDispatcher.Dispatch(new AuditSessionCreatedEvent(session.AuditSessionId, userId));

        _logger.LogInformation("Audit session created: sessionId={SessionId}", session.AuditSessionId);

        return MapSessionToDto(session);
    }

    /// <inheritdoc />
    public async Task<AuditActionLogDto> LogActionAsync(Guid auditSessionId, Guid userId, string actionName, string? permissionCode, string actionStatus, string? additionalInfo)
    {
        var actionLog = new AuditActionLog
        {
            AuditActionId = Guid.NewGuid(),
            AuditSessionId = auditSessionId,
            UserId = userId,
            ActionTimestamp = DateTimeOffset.UtcNow,
            ActionName = actionName,
            PermissionCode = permissionCode,
            ActionStatus = actionStatus,
            AdditionalInfo = additionalInfo,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = userId.ToString()
        };

        actionLog = await _actionLogRepository.CreateAsync(actionLog);

        _logger.LogInformation("Audit action logged: actionId={ActionId}, action={ActionName}",
            actionLog.AuditActionId, actionName);

        return MapActionToDto(actionLog);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<AuditSessionDto>> GetSessionsByUserAsync(Guid userId)
    {
        var sessions = await _sessionRepository.GetByUserIdAsync(userId);
        return sessions.Select(MapSessionToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<AuditActionLogDto>> GetActionsByUserAsync(Guid userId)
    {
        var actions = await _actionLogRepository.GetByUserIdAsync(userId);
        return actions.Select(MapActionToDto).ToList();
    }

    private static AuditSessionDto MapSessionToDto(AuditSession s) => new(
        s.AuditSessionId, s.UserId, s.SessionStartTime, s.SessionEndTime,
        s.IpAddress, s.DeviceInfo, s.SolutionModuleId, s.IsSuccess, s.Reason);

    private static AuditActionLogDto MapActionToDto(AuditActionLog a) => new(
        a.AuditActionId, a.AuditSessionId, a.UserId, a.ActionTimestamp,
        a.SolutionModuleId, a.ActionName, a.PermissionCode, a.ActionStatus, a.AdditionalInfo);
}
