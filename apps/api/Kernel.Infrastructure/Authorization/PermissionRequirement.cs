using Kernel.Application.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace Kernel.Infrastructure.Authorization;

/// <summary>
/// Authorization requirement that delegates to IPermissionEvaluator.
/// </summary>
public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }
    public PermissionRequirement(string permission) => Permission = permission;
}

/// <summary>
/// Handles PermissionRequirement by calling IPermissionEvaluator.
/// Every authorization check in the platform flows through this handler.
/// </summary>
public sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IPermissionEvaluator _evaluator;
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<PermissionAuthorizationHandler> _logger;

    public PermissionAuthorizationHandler(
        IPermissionEvaluator evaluator,
        ITenantContext tenantContext,
        ILogger<PermissionAuthorizationHandler> logger)
    {
        _evaluator    = evaluator;
        _tenantContext = tenantContext;
        _logger       = logger;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var tenantId    = _tenantContext.TenantId ?? "UNRESOLVED";
        var principalId = context.User.FindFirst("oid")?.Value
                       ?? context.User.FindFirst("sub")?.Value
                       ?? "UNKNOWN";

        _logger.LogDebug(
            "Evaluating permission={Permission} for principal={PrincipalId} tenant={TenantId}",
            requirement.Permission, principalId, tenantId);

        var granted = await _evaluator.EvaluateAsync(tenantId, principalId, requirement.Permission);

        if (granted)
            context.Succeed(requirement);
        else
            _logger.LogInformation(
                "Authorization DENIED permission={Permission} principal={PrincipalId} tenant={TenantId}",
                requirement.Permission, principalId, tenantId);
    }
}
