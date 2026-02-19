namespace Kernel.Application.Authorization;

/// <summary>
/// Authorization policy name constants.
/// Must correspond 1-to-1 with Permissions constants.
/// </summary>
public static class Policies
{
    public const string AdminGlobal = "Policy:ADMIN:GLOBAL";
    public const string UsersRead   = "Policy:USERS:READ";
    public const string UsersWrite  = "Policy:USERS:WRITE";
    public const string TenantRead  = "Policy:TENANT:READ";
    public const string RoleRead   = "Policy:ROLE:READ";
    public const string AuditViewActions = "Policy:AUDIT:VIEW_ACTIONS";
}
