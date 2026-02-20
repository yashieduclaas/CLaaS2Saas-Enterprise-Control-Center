// apps/api/src/Kernel.Application/Features/Roles/RolesFeatureServiceExtensions.cs
using Kernel.Application.Authorization;
using Kernel.Application.Features.Roles.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace Kernel.Application.Features.Roles;

/// <summary>
/// Additive DI registration for the Roles feature.
///
/// Call from ApplicationServiceExtensions.AddApplicationServices() — additive only.
/// DO NOT modify the existing AddApplicationAuthorization method.
///
/// Integration instruction:
///   In ApplicationServiceExtensions.AddApplicationServices(), add:
///     services.AddRolesFeature();
///
///   In ApplicationServiceExtensions.AddApplicationAuthorization(), inside the
///   options delegate, add:
///     options.AddPolicy(PolicyNames.RolesRead, policy =>
///         policy.AddRequirements(new PermissionRequirement(PermissionCodes.RolesRead)));
/// </summary>
public static class RolesFeatureServiceExtensions
{
    /// <summary>
    /// Registers application-layer services for the Roles feature.
    /// </summary>
    public static IServiceCollection AddRolesFeature(this IServiceCollection services)
    {
        services.AddScoped<ListRolesQueryHandler>();
        return services;
    }

    /// <summary>
    /// Registers the Roles.Read authorization policy.
    /// Call from inside the AddAuthorization options delegate in
    /// ApplicationServiceExtensions — additive only.
    /// </summary>
    public static AuthorizationOptions AddRolesReadPolicy(this AuthorizationOptions options)
    {
        options.AddPolicy(PolicyNames.RolesRead, policy =>
            policy.AddRequirements(new PermissionRequirement(PermissionCodes.RolesRead)));
        return options;
    }
}
