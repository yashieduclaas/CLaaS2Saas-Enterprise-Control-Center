namespace ECC.Domain.Events;

/// <summary>
/// Raised when a new audit session is created.
/// </summary>
public sealed class AuditSessionCreatedEvent : DomainEvent
{
    public override string EventType => "AuditSessionCreated";
    public Guid AuditSessionId { get; }
    public Guid UserId { get; }

    public AuditSessionCreatedEvent(Guid auditSessionId, Guid userId)
    {
        AuditSessionId = auditSessionId;
        UserId = userId;
    }
}
