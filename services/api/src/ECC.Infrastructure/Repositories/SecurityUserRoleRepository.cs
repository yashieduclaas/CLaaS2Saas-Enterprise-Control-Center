using ECC.Domain.Entities;
using ECC.Domain.Interfaces;
using ECC.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECC.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of ISecurityUserRoleRepository.
/// </summary>
public sealed class SecurityUserRoleRepository : ISecurityUserRoleRepository
{
    private readonly EccDbContext _context;

    public SecurityUserRoleRepository(EccDbContext context) => _context = context;

    public async Task<SecurityUserRole?> GetByIdAsync(Guid userRoleId)
    {
        return await _context.SecurityUserRoles
            .Include(ur => ur.User)
            .Include(ur => ur.SolutionModule)
            .Include(ur => ur.RolePermission)
            .FirstOrDefaultAsync(ur => ur.UserRoleId == userRoleId);
    }

    public async Task<IReadOnlyList<SecurityUserRole>> GetByUserIdAsync(Guid userId)
    {
        return await _context.SecurityUserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.SolutionModule)
            .Include(ur => ur.RolePermission)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<SecurityUserRole>> GetActiveByUserIdAsync(Guid userId)
    {
        return await _context.SecurityUserRoles
            .Where(ur => ur.UserId == userId && ur.IsActive)
            .Include(ur => ur.SolutionModule)
            .Include(ur => ur.RolePermission)
            .ToListAsync();
    }

    public async Task<bool> ExistsActiveAssignmentAsync(Guid userId, Guid solutionModuleId, Guid secRoleId)
    {
        return await _context.SecurityUserRoles
            .AnyAsync(ur => ur.UserId == userId
                && ur.SolutionModuleId == solutionModuleId
                && ur.SecRoleId == secRoleId
                && ur.IsActive);
    }

    public async Task<SecurityUserRole> CreateAsync(SecurityUserRole userRole)
    {
        _context.SecurityUserRoles.Add(userRole);
        await _context.SaveChangesAsync();
        return userRole;
    }

    public async Task UpdateAsync(SecurityUserRole userRole)
    {
        _context.SecurityUserRoles.Update(userRole);
        await _context.SaveChangesAsync();
    }
}
