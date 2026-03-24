namespace ECC.Domain.Events;

/// <summary>
/// Raised when a role is assigned to a user.
/// </summary>
public sealed class RoleAssignedEvent : DomainEvent
{
    public override string EventType => "RoleAssigned";
    public Guid UserRoleId { get; }
    public Guid UserId { get; }
    public Guid SecRoleId { get; }
    public Guid SolutionModuleId { get; }
    public Guid AssignedByUserId { get; }

    public RoleAssignedEvent(Guid userRoleId, Guid userId, Guid secRoleId, Guid solutionModuleId, Guid assignedByUserId)
    {
        UserRoleId = userRoleId;
        UserId = userId;
        SecRoleId = secRoleId;
        SolutionModuleId = solutionModuleId;
        AssignedByUserId = assignedByUserId;
    }
}
