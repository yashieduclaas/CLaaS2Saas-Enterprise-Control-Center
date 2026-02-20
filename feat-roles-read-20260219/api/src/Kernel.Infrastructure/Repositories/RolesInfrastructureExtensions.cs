// apps/api/src/Kernel.Infrastructure/Repositories/RolesInfrastructureExtensions.cs
using Kernel.Application.Features.Roles.Queries;
using Kernel.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Kernel.Infrastructure.Repositories;

/// <summary>
/// Additive DI registration for the Roles feature infrastructure.
///
/// Integration instruction:
///   In InfrastructureServiceExtensions.AddInfrastructureServices(), add:
///     services.AddRolesInfrastructure();
///
/// MMP caching note: To add a Redis-backed caching decorator, replace the
/// direct Scoped registration with:
///     services.AddScoped&lt;RoleRepository&gt;();
///     services.AddScoped&lt;IRoleRepository, CachedRoleRepository&gt;();
///   CachedRoleRepository wraps RoleRepository and adds Redis read-through.
///   No other code changes are required.
/// </summary>
public static class RolesInfrastructureExtensions
{
    public static IServiceCollection AddRolesInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IRoleRepository, RoleRepository>();
        return services;
    }
}
