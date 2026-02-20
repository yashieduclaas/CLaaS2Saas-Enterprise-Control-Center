// apps/api/src/Kernel.Application/Authorization/PermissionCodes.cs
namespace Kernel.Application.Authorization;

/// <summary>
/// Authoritative backend mirror of the TypeScript PermissionCode union
/// in <c>packages/contracts/src/rbac/index.ts</c>.
///
/// RULES:
///   1. These string values MUST be byte-for-byte identical to the TypeScript union members.
///   2. Additions require an ARB-approved contracts PR that adds the code to both
///      the TypeScript union and this class simultaneously.
///   3. NEVER delete or rename — use [Obsolete] and the ARB deprecation process.
///   4. Controllers and policies reference these constants ONLY. No inline strings.
/// </summary>
public static class PermissionCodes
{
    public const string AdminGlobal         = "ADMIN:GLOBAL";
    public const string RolesRead           = "ROLES:READ";
    public const string RolesWrite          = "ROLES:WRITE";
    public const string RolesDelete         = "ROLES:DELETE";
    public const string UsersRead           = "USERS:READ";
    public const string UsersWrite          = "USERS:WRITE";
    public const string UsersAssignRole     = "USERS:ASSIGN_ROLE";
    public const string ModulesRead         = "MODULES:READ";
    public const string ModulesWrite        = "MODULES:WRITE";
    public const string AuditRead           = "AUDIT:READ";
    public const string AccessRequestsRead   = "ACCESS_REQUESTS:READ";
    public const string AccessRequestsApprove = "ACCESS_REQUESTS:APPROVE";
    public const string AccessRequestsReject  = "ACCESS_REQUESTS:REJECT";
}

/// <summary>
/// Named ASP.NET Core policy names — used as the string in [Authorize(Policy=...)].
/// Must stay in sync with the policy registration in ApplicationServiceExtensions.
/// </summary>
public static class PolicyNames
{
    public const string RolesRead = "Roles.Read";
}
