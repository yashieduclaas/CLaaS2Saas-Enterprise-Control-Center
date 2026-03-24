using ECC.Domain.Entities;
using ECC.Domain.Interfaces;
using ECC.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECC.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of ISecurityRolePermissionRepository.
/// </summary>
public sealed class SecurityRolePermissionRepository : ISecurityRolePermissionRepository
{
    private readonly EccDbContext _context;

    public SecurityRolePermissionRepository(EccDbContext context) => _context = context;

    public async Task<SecurityRolePermission?> GetByIdAsync(Guid secRoleId)
    {
        return await _context.SecurityRolePermissions
            .Include(rp => rp.SolutionModule)
            .FirstOrDefaultAsync(rp => rp.SecRoleId == secRoleId);
    }

    public async Task<IReadOnlyList<SecurityRolePermission>> GetByModuleIdAsync(Guid solutionModuleId)
    {
        return await _context.SecurityRolePermissions
            .Where(rp => rp.SolutionModuleId == solutionModuleId && rp.IsActive)
            .Include(rp => rp.SolutionModule)
            .ToListAsync();
    }

    public async Task<SecurityRolePermission?> GetByRoleCodeAndModuleIdAsync(string roleCode, Guid solutionModuleId)
    {
        return await _context.SecurityRolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleCode == roleCode && rp.SolutionModuleId == solutionModuleId && rp.IsActive);
    }

    public async Task<SecurityRolePermission> CreateAsync(SecurityRolePermission rolePermission)
    {
        _context.SecurityRolePermissions.Add(rolePermission);
        await _context.SaveChangesAsync();
        return rolePermission;
    }

    public async Task UpdateAsync(SecurityRolePermission rolePermission)
    {
        _context.SecurityRolePermissions.Update(rolePermission);
        await _context.SaveChangesAsync();
    }
}
