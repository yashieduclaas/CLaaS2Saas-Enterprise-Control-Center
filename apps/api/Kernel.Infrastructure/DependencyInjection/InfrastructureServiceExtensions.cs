using Kernel.Application.Abstractions;
using Kernel.Infrastructure.Authorization;
using Kernel.Infrastructure.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Kernel.Infrastructure.DependencyInjection;

public static class InfrastructureServiceExtensions
{
    /// <summary>
    /// Registers all infrastructure services. Called from Program.cs.
    /// </summary>
    /// <param name="services">Service collection.</param>
    /// <param name="configureTenant">Optional tenant middleware config.</param>
    /// <param name="authMode">AUTH_MODE env: "Demo" or "Entra". When Demo, registers DemoPermissionEvaluator.</param>
    public static IServiceCollection AddKernelInfrastructure(
        this IServiceCollection services,
        Action<TenantMiddlewareOptions>? configureTenant = null,
        string authMode = "Demo")
    {
        // Tenant middleware
        services.Configure<TenantMiddlewareOptions>(opt =>
        {
            opt.RequireResolved = true;
            configureTenant?.Invoke(opt);
        });
        services.AddScoped<ITenantContext, TenantContext>();

        // Permission evaluator — Demo uses static matrix; Entra uses stub (MMP: real evaluator + DB)
        if (string.Equals(authMode, "Demo", StringComparison.OrdinalIgnoreCase))
            services.AddScoped<IPermissionEvaluator, DemoPermissionEvaluator>();
        else
            services.AddScoped<IPermissionEvaluator, StubPermissionEvaluator>();

        // Authorization handler
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

        return services;
    }
}
