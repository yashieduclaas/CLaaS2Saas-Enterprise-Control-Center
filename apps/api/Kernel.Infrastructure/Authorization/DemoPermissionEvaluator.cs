using System.Collections.Frozen;
using Kernel.Application.Abstractions;
using Kernel.Application.Authorization;
using Kernel.Infrastructure.Auth;
using Microsoft.Extensions.Logging;

namespace Kernel.Infrastructure.Authorization;

/// <summary>
/// Permission evaluator for AUTH_MODE=Demo.
/// Uses static RBAC matrix; resolves user by principalId (sub) from DemoUserStore.
/// GLOBAL_ADMIN gets ADMIN:GLOBAL bypass; tenant boundary never bypassed.
/// </summary>
public sealed class DemoPermissionEvaluator : IPermissionEvaluator
{
    private readonly ILogger<DemoPermissionEvaluator> _logger;

    private static readonly FrozenDictionary<string, FrozenSet<string>> RolePermissions = CreateMatrix();

    public DemoPermissionEvaluator(ILogger<DemoPermissionEvaluator> logger)
    {
        _logger = logger;
    }

    public Task<bool> EvaluateAsync(
        string tenantId,
        string principalId,
        string permission,
        CancellationToken cancellationToken = default)
    {
        var user = DemoUserStore.GetBySub(principalId);
        if (user is null)
        {
            _logger.LogDebug("[DEMO EVALUATOR] principal not found sub={Sub}", principalId);
            return Task.FromResult(false);
        }

        // Tenant boundary — never bypassed
        if (!string.Equals(user.TenantId, tenantId, StringComparison.Ordinal))
        {
            _logger.LogDebug("[DEMO EVALUATOR] tenant mismatch user={UserTenant} req={ReqTenant}", user.TenantId, tenantId);
            return Task.FromResult(false);
        }

        // GLOBAL_ADMIN bypass for module-scoped checks (ADMIN:GLOBAL)
        if (string.Equals(user.Role, "GLOBAL_ADMIN", StringComparison.Ordinal) &&
            string.Equals(permission, Permissions.AdminGlobal, StringComparison.Ordinal))
        {
            _logger.LogDebug("[DEMO EVALUATOR] GLOBAL_ADMIN grants {Permission}", permission);
            return Task.FromResult(true);
        }

        var role = user.Role;
        // Alias HELPDESK -> HELP_DESK for matrix lookup
        if (string.Equals(role, "HELPDESK", StringComparison.Ordinal))
            role = "HELP_DESK";

        var perms = RolePermissions.GetValueOrDefault(role, FrozenSet<string>.Empty);
        var allowed = perms.Contains(permission);

        _logger.LogDebug(
            "[DEMO EVALUATOR] tenant={TenantId} role={Role} permission={Permission} result={Result}",
            tenantId, role, permission, allowed);

        return Task.FromResult(allowed);
    }

    private static FrozenDictionary<string, FrozenSet<string>> CreateMatrix()
    {
        // RBAC matrix from rbac-permission-matrix.md
        var matrix = new Dictionary<string, FrozenSet<string>>(StringComparer.Ordinal)
        {
            ["GLOBAL_ADMIN"] = CreateSet(
                "ROLE:CREATE", "ROLE:READ", "ROLE:UPDATE", "ROLE:DELETE",
                "USER:CREATE", "USER:READ", "USER:UPDATE", "USER:DELETE",
                "USER:ASSIGN_ROLE", "USER:REVOKE_ROLE",
                "USERS:READ", "USERS:WRITE", "USERS:DELETE",
                "TENANT:READ", "TENANT:WRITE",
                "MODULE:CREATE", "MODULE:READ", "MODULE:UPDATE", "MODULE:DELETE",
                "AUDIT:VIEW_SESSIONS", "AUDIT:VIEW_ACTIONS", "AUDIT:EXPORT",
                "ACCESS_REQUEST:SUBMIT", "ACCESS_REQUEST:REVIEW", "ACCESS_REQUEST:RESOLVE",
                "ADMIN:MODULE_SCOPED", "ADMIN:GLOBAL"),
            ["SECURITY_ADMIN"] = CreateSet(
                "ROLE:CREATE", "ROLE:READ", "ROLE:UPDATE", "ROLE:DELETE",
                "USER:CREATE", "USER:READ", "USER:UPDATE", "USER:DELETE",
                "USER:ASSIGN_ROLE", "USER:REVOKE_ROLE",
                "USERS:READ", "USERS:WRITE", "USERS:DELETE",
                "TENANT:READ", "TENANT:WRITE",
                "MODULE:CREATE", "MODULE:READ", "MODULE:UPDATE",
                "AUDIT:VIEW_SESSIONS", "AUDIT:VIEW_ACTIONS",
                "ACCESS_REQUEST:SUBMIT", "ACCESS_REQUEST:REVIEW", "ACCESS_REQUEST:RESOLVE"),
            ["MODULE_ADMIN"] = CreateSet(
                "ROLE:READ", "MODULE:READ", "TENANT:READ",
                "ACCESS_REQUEST:SUBMIT",
                "ADMIN:MODULE_SCOPED"),
            ["HELP_DESK"] = CreateSet(
                "ROLE:READ", "USER:READ", "MODULE:READ", "USERS:READ", "TENANT:READ",
                "ACCESS_REQUEST:SUBMIT", "ACCESS_REQUEST:REVIEW"),
            ["STANDARD_USER"] = CreateSet(
                "ROLE:READ", "USER:READ", "MODULE:READ", "USERS:READ", "TENANT:READ",
                "ACCESS_REQUEST:SUBMIT"),
        };

        return matrix.ToFrozenDictionary();
    }

    private static FrozenSet<string> CreateSet(params string[] items) =>
        items.ToFrozenSet(StringComparer.Ordinal);
}
