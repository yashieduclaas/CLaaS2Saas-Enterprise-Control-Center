using ECC.Domain.Events;
using Microsoft.Extensions.Logging;

namespace ECC.Infrastructure.Services;

/// <summary>
/// Logs domain events. In future, this will publish to a message bus.
/// </summary>
public sealed class EventDispatcher : IEventDispatcher
{
    private readonly ILogger<EventDispatcher> _logger;

    public EventDispatcher(ILogger<EventDispatcher> logger) => _logger = logger;

    public Task Dispatch(DomainEvent domainEvent)
    {
        _logger.LogInformation(
            "Domain event dispatched: type={EventType}, id={EventId}, occurredAt={OccurredAt}",
            domainEvent.EventType, domainEvent.EventId, domainEvent.OccurredAt);

        return Task.CompletedTask;
    }
}
