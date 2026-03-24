namespace ECC.Domain.Entities;

/// <summary>
/// Represents the assignment of a role to a user for a specific solution module.
/// Maps to SecurityDB_Security_User_Role table.
/// </summary>
public class SecurityUserRole
{
    public Guid UserRoleId { get; set; }
    public Guid UserId { get; set; }
    public Guid SolutionModuleId { get; set; }
    public Guid SecRoleId { get; set; }
    public Guid AssignedByUserId { get; set; }
    public DateTimeOffset AssignedDate { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? DisabledDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public SecurityUser User { get; set; } = null!;
    public SolutionModule SolutionModule { get; set; } = null!;
    public SecurityRolePermission RolePermission { get; set; } = null!;
}
