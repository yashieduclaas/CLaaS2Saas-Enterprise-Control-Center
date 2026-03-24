namespace ECC.Domain.Events;

/// <summary>
/// Base class for all domain events in the ECC platform.
/// </summary>
public abstract class DomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
    public abstract string EventType { get; }
}
