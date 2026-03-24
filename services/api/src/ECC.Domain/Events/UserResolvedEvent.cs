namespace ECC.Domain.Events;

/// <summary>
/// Raised when a user's security profile is resolved during login.
/// </summary>
public sealed class UserResolvedEvent : DomainEvent
{
    public override string EventType => "UserResolved";
    public Guid UserId { get; }
    public string EntraObjectId { get; }
    public int AuthorizedModuleCount { get; }

    public UserResolvedEvent(Guid userId, string entraObjectId, int authorizedModuleCount)
    {
        UserId = userId;
        EntraObjectId = entraObjectId;
        AuthorizedModuleCount = authorizedModuleCount;
    }
}
