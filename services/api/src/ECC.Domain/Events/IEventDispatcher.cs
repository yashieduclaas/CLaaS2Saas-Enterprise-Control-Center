namespace ECC.Domain.Events;

/// <summary>
/// Dispatches domain events after state-changing operations for audit trail.
/// </summary>
public interface IEventDispatcher
{
    /// <summary>
    /// Dispatches a domain event. Must be called after every state-changing operation.
    /// </summary>
    /// <param name="domainEvent">The domain event to dispatch.</param>
    Task Dispatch(DomainEvent domainEvent);
}
