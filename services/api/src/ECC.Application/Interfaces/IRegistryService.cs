using ECC.Application.DTOs.Registry;

namespace ECC.Application.Interfaces;

/// <summary>
/// Service interface for solution module registry operations.
/// </summary>
public interface IRegistryService
{
    /// <summary>Creates a new solution module.</summary>
    Task<SolutionModuleDto> CreateSolutionModuleAsync(CreateSolutionModuleDto request, string createdBy);

    /// <summary>Retrieves all active solution modules.</summary>
    Task<IReadOnlyList<SolutionModuleDto>> GetAllModulesAsync();

    /// <summary>Retrieves a solution module by ID.</summary>
    Task<SolutionModuleDto> GetModuleAsync(Guid solutionModuleId);
}
