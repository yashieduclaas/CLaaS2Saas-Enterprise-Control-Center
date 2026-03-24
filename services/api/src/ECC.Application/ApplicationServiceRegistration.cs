using ECC.Application.Interfaces;
using ECC.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECC.Application;

/// <summary>
/// Registers all application-layer services in the DI container.
/// </summary>
public static class ApplicationServiceRegistration
{
    /// <summary>
    /// Adds ECC application services to the service collection.
    /// </summary>
    public static IServiceCollection AddEccApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IRbacService, RbacService>();
        services.AddScoped<IRegistryService, RegistryService>();
        services.AddScoped<IAuditService, AuditService>();
        return services;
    }
}
