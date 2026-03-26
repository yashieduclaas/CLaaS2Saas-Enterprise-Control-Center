using Kernel.Application.Abstractions;
using Kernel.Application.Audit;
using Kernel.Application.Features.Users;
using Kernel.Application.Features.BulkAssignment;
using Kernel.Infrastructure.Audit;
using Kernel.Infrastructure.Auth;
using Kernel.Infrastructure.Authorization;
using Kernel.Infrastructure.Middleware;
using Kernel.Infrastructure.Persistence;
using Kernel.Infrastructure.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
    /// <param name="dataMode">DATA_MODE env: "InMemory" or "Sql".</param>
    /// <param name="configuration">Application configuration for connection strings.</param>
    public static IServiceCollection AddKernelInfrastructure(
        this IServiceCollection services,
        Action<TenantMiddlewareOptions>? configureTenant = null,
        string authMode = "Demo",
        string dataMode = "InMemory",
        IConfiguration? configuration = null)
    {
        services.AddHttpContextAccessor();

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

        services.AddScoped<ICurrentPrincipalAccessor, HttpContextCurrentPrincipalAccessor>();

        if (string.Equals(dataMode, "Sql", StringComparison.OrdinalIgnoreCase))
        {
            if (configuration is null)
                throw new InvalidOperationException("Configuration is required when DATA_MODE=Sql.");

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException("ConnectionStrings:DefaultConnection must be configured when DATA_MODE=Sql.");

            services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<IAuditQueue, SqlAuditWriter>();
            services.AddScoped<ISecurityUserRepository, SqlSecurityUserRepository>();
        }
        else
        {
            services.AddSingleton<IAuditQueue, InMemoryAuditQueue>();
            services.AddSingleton<ISecurityUserRepository, InMemorySecurityUserRepository>();
        }

        // Authorization handler
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

        // BulkAssignment application services
        services.AddBulkAssignmentServices();

        return services;
    }
}
