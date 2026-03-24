using Microsoft.Extensions.DependencyInjection;

namespace Kernel.Application.Features.BulkAssignment;

/// <summary>
/// Additive DI registration for BulkAssignment application-layer services.
/// Called from <c>InfrastructureServiceExtensions.AddKernelInfrastructure</c>.
/// </summary>
public static class BulkAssignmentServiceExtensions
{
    /// <summary>
    /// Registers <see cref="IBulkAssignmentCsvParserService"/> as a singleton —
    /// the parser is stateless and safe for concurrent use.
    /// </summary>
    public static IServiceCollection AddBulkAssignmentServices(this IServiceCollection services)
    {
        services.AddSingleton<IBulkAssignmentCsvParserService, BulkAssignmentCsvParserService>();
        return services;
    }
}
