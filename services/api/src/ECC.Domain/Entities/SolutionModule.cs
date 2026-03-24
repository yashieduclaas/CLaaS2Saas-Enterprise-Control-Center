namespace ECC.Domain.Entities;

/// <summary>
/// Registry of solutions and modules in the CLaaS2SaaS ecosystem.
/// Maps to SecurityDB_Solution_Module table.
/// Denormalized: combines Solution and Module (small record count per design doc).
/// </summary>
public class SolutionModule
{
    public Guid SolutionModuleId { get; set; }
    public string SolutionCode { get; set; } = string.Empty;
    public string SolutionName { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ModuleLead { get; set; }
    public string? DocumentationUrl { get; set; }
    public string? ModuleVersion { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public ICollection<SecurityRolePermission> RolePermissions { get; set; } = new List<SecurityRolePermission>();
    public ICollection<SecurityUserRole> UserRoles { get; set; } = new List<SecurityUserRole>();
}
