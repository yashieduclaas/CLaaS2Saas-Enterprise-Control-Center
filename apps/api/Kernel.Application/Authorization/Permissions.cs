namespace Kernel.Application.Authorization;

/// <summary>
/// Authoritative permission key registry.
/// 
/// Format: DOMAIN:ACTION
/// 
/// These constants are the source of truth for all permission checks.
/// Feature pods may ADD to this class but must never modify existing values.
/// </summary>
public static class Permissions
{
    // ── Global admin ────────────────────────────────────────────────────────
    /// <summary>Unrestricted platform administration. Stub evaluator always allows this.</summary>
    public const string AdminGlobal = "ADMIN:GLOBAL";

    // ── User management ──────────────────────────────────────────────────────
    public const string UsersRead   = "USERS:READ";
    public const string UsersWrite  = "USERS:WRITE";
    public const string UsersDelete = "USERS:DELETE";

    // ── Tenant management ────────────────────────────────────────────────────
    public const string TenantRead   = "TENANT:READ";
    public const string TenantWrite  = "TENANT:WRITE";

    // ── Role management ──────────────────────────────────────────────────────
    /// <summary>Read roles for the current tenant. Aligns with contracts PermissionCode.ROLE_READ.</summary>
    public const string RoleRead = "ROLE:READ";

    // ── Audit ───────────────────────────────────────────────────────────────
    /// <summary>View audit action records.</summary>
    public const string AuditViewActions = "AUDIT:VIEW_ACTIONS";
}
