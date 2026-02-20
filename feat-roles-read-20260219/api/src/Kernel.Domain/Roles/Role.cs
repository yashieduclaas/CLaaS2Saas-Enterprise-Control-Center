// apps/api/src/Kernel.Domain/Roles/Role.cs
namespace Kernel.Domain.Roles;

/// <summary>
/// Role entity — tenant-scoped aggregate root.
///
/// TenantId is set at creation and is immutable — EF global query filter
/// enforces tenant isolation at the database level.
///
/// Permission codes are not exposed on this projection. The role list endpoint
/// returns name/description/system-flag only.
/// </summary>
public sealed class Role
{
    // EF Core requires parameterless constructor for proxies / owned types.
    // Marked private to enforce creation via factory method.
    private Role() { }

    public Guid Id { get; private set; }

    /// <summary>Entra tenant ID — immutable after creation.</summary>
    public string TenantId { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    /// <summary>
    /// True for built-in platform roles (GLOBAL_ADMIN, SECURITY_ADMIN etc.).
    /// System roles cannot be deleted via the API.
    /// </summary>
    public bool IsSystemRole { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset UpdatedAt { get; private set; }

    /// <summary>Factory method — enforces invariants at creation time.</summary>
    public static Role Create(
        string tenantId,
        string name,
        string? description,
        bool isSystemRole,
        DateTimeOffset now)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new Role
        {
            Id           = Guid.NewGuid(),
            TenantId     = tenantId,
            Name         = name,
            Description  = description,
            IsSystemRole = isSystemRole,
            CreatedAt    = now,
            UpdatedAt    = now,
        };
    }
}
