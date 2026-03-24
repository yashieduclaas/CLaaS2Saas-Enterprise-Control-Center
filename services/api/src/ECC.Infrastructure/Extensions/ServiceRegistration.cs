using ECC.Domain.Events;
using ECC.Domain.Interfaces;
using ECC.Infrastructure.Persistence;
using ECC.Infrastructure.Repositories;
using ECC.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ECC.Infrastructure.Extensions;

/// <summary>
/// Registers all infrastructure services: DbContext, repositories, and event dispatcher.
/// </summary>
public static class ServiceRegistration
{
    /// <summary>
    /// Adds ECC infrastructure services to the DI container.
    /// </summary>
    public static IServiceCollection AddEccInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext with SQL Server
        services.AddDbContext<EccDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("SecurityDb")));

        // Repositories
        services.AddScoped<ISecurityUserRepository, SecurityUserRepository>();
        services.AddScoped<ISecurityRolePermissionRepository, SecurityRolePermissionRepository>();
        services.AddScoped<ISecurityUserRoleRepository, SecurityUserRoleRepository>();
        services.AddScoped<ISolutionModuleRepository, SolutionModuleRepository>();
        services.AddScoped<IAuditSessionRepository, AuditSessionRepository>();
        services.AddScoped<IAuditActionLogRepository, AuditActionLogRepository>();

        // Event Dispatcher
        services.AddScoped<IEventDispatcher, EventDispatcher>();

        return services;
    }
}
