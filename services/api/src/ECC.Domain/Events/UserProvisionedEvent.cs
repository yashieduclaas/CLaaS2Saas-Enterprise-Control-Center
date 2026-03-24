namespace ECC.Domain.Events;

/// <summary>
/// Raised when a new user is auto-provisioned during first role assignment.
/// </summary>
public sealed class UserProvisionedEvent : DomainEvent
{
    public override string EventType => "UserProvisioned";
    public Guid UserId { get; }
    public string EntraObjectId { get; }

    public UserProvisionedEvent(Guid userId, string entraObjectId)
    {
        UserId = userId;
        EntraObjectId = entraObjectId;
    }
}
