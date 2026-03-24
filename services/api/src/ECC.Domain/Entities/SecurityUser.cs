namespace ECC.Domain.Entities;

/// <summary>
/// Represents a security user in the ECC platform.
/// Maps to SecurityDB_Security_User table.
/// </summary>
public class SecurityUser
{
    public Guid UserId { get; set; }
    public string EntraObjectId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? LastLoginDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    public ICollection<SecurityUserRole> UserRoles { get; set; } = new List<SecurityUserRole>();
}
