namespace Kernel.Domain.Entities;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-domain-users-security-user
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Represents a security user within the kernel domain.
/// </summary>
public sealed class SecurityUser
{
    /// <summary>Internal user identifier.</summary>
    public int SecurityUserPid { get; set; }

    /// <summary>Unique Entra email identifier for lookup.</summary>
    public string EntraEmailId { get; set; } = string.Empty;

    /// <summary>Tenant identifier for multi-tenancy isolation.</summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>Display name used on create.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Organization role enrichment value.</summary>
    public string? OrgRole { get; set; }

    /// <summary>Manager email enrichment value.</summary>
    public string? ManagerEmailId { get; set; }

    /// <summary>Manager display name enrichment value.</summary>
    public string? ManagerName { get; set; }

    /// <summary>Whether the user is active.</summary>
    public bool IsActive { get; set; }
}