namespace ECC.Domain.Entities;

/// <summary>
/// Represents a role and its associated permission flags for a specific solution module.
/// Maps to SecurityDB_Security_Role_Permission table.
/// </summary>
public class SecurityRolePermission
{
    public Guid SecRoleId { get; set; }
    public Guid SolutionModuleId { get; set; }
    public string RoleCode { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
    public bool FullAccessAllModules { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public SolutionModule SolutionModule { get; set; } = null!;
    public ICollection<SecurityUserRole> UserRoles { get; set; } = new List<SecurityUserRole>();
}
