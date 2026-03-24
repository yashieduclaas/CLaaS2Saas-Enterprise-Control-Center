namespace ECC.Domain.Events;

/// <summary>
/// Raised when a role is revoked from a user.
/// </summary>
public sealed class RoleRevokedEvent : DomainEvent
{
    public override string EventType => "RoleRevoked";
    public Guid UserRoleId { get; }
    public Guid UserId { get; }
    public Guid SecRoleId { get; }
    public Guid SolutionModuleId { get; }
    public Guid RevokedByUserId { get; }

    public RoleRevokedEvent(Guid userRoleId, Guid userId, Guid secRoleId, Guid solutionModuleId, Guid revokedByUserId)
    {
        UserRoleId = userRoleId;
        UserId = userId;
        SecRoleId = secRoleId;
        SolutionModuleId = solutionModuleId;
        RevokedByUserId = revokedByUserId;
    }
}
