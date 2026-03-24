using ECC.Domain.Entities;

namespace ECC.Domain.Interfaces;

/// <summary>
/// Repository interface for SolutionModule entity operations.
/// </summary>
public interface ISolutionModuleRepository
{
    /// <summary>Retrieves a solution module by its primary key.</summary>
    Task<SolutionModule?> GetByIdAsync(Guid solutionModuleId);

    /// <summary>Retrieves a solution module by its solution and module codes.</summary>
    Task<SolutionModule?> GetByCodesAsync(string solutionCode, string moduleCode);

    /// <summary>Retrieves all active solution modules.</summary>
    Task<IReadOnlyList<SolutionModule>> GetAllActiveAsync();

    /// <summary>Creates a new solution module.</summary>
    Task<SolutionModule> CreateAsync(SolutionModule solutionModule);

    /// <summary>Updates an existing solution module.</summary>
    Task UpdateAsync(SolutionModule solutionModule);
}
