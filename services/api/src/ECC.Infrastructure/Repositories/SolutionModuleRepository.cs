using ECC.Domain.Entities;
using ECC.Domain.Interfaces;
using ECC.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECC.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of ISolutionModuleRepository.
/// </summary>
public sealed class SolutionModuleRepository : ISolutionModuleRepository
{
    private readonly EccDbContext _context;

    public SolutionModuleRepository(EccDbContext context) => _context = context;

    public async Task<SolutionModule?> GetByIdAsync(Guid solutionModuleId)
    {
        return await _context.SolutionModules.FindAsync(solutionModuleId);
    }

    public async Task<SolutionModule?> GetByCodesAsync(string solutionCode, string moduleCode)
    {
        return await _context.SolutionModules
            .FirstOrDefaultAsync(m => m.SolutionCode == solutionCode && m.ModuleCode == moduleCode && m.IsActive);
    }

    public async Task<IReadOnlyList<SolutionModule>> GetAllActiveAsync()
    {
        return await _context.SolutionModules
            .Where(m => m.IsActive)
            .OrderBy(m => m.SolutionCode)
            .ThenBy(m => m.ModuleCode)
            .ToListAsync();
    }

    public async Task<SolutionModule> CreateAsync(SolutionModule solutionModule)
    {
        _context.SolutionModules.Add(solutionModule);
        await _context.SaveChangesAsync();
        return solutionModule;
    }

    public async Task UpdateAsync(SolutionModule solutionModule)
    {
        _context.SolutionModules.Update(solutionModule);
        await _context.SaveChangesAsync();
    }
}
