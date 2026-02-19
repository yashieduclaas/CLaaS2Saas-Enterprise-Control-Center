using Kernel.Application.Abstractions;
using Kernel.Application.Authorization;
using Microsoft.Extensions.Logging;

namespace Kernel.Infrastructure.Authorization;

/// <summary>
/// ⚠️ STUB IMPLEMENTATION — TEMPORARY ⚠️
///
/// This evaluator is a placeholder until the real RBAC engine is wired.
/// It DENIES all requests except ADMIN:GLOBAL.
///
/// REPLACE THIS with the real IPermissionEvaluator implementation
/// before any production deployment.
///
/// DO NOT add business logic here. This class will be deleted.
/// </summary>
internal sealed class StubPermissionEvaluator : IPermissionEvaluator
{
    private readonly ILogger<StubPermissionEvaluator> _logger;

    public StubPermissionEvaluator(ILogger<StubPermissionEvaluator> logger)
    {
        _logger = logger;
    }

    public Task<bool> EvaluateAsync(
        string tenantId,
        string principalId,
        string permission,
        CancellationToken cancellationToken = default)
    {
        var granted = string.Equals(permission, Permissions.AdminGlobal,
            StringComparison.OrdinalIgnoreCase);

        _logger.LogDebug(
            "[STUB EVALUATOR] tenant={TenantId} principal={PrincipalId} permission={Permission} granted={Granted}",
            tenantId, principalId, permission, granted);

        if (!granted)
        {
            _logger.LogWarning(
                "[STUB EVALUATOR] DENIED — replace StubPermissionEvaluator with real implementation. " +
                "tenant={TenantId} principal={PrincipalId} permission={Permission}",
                tenantId, principalId, permission);
        }

        return Task.FromResult(granted);
    }
}
