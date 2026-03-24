using ECC.Domain.Entities;
using ECC.Domain.Enums;
using ECC.Domain.Exceptions;
using ECC.Domain.Interfaces;
using ECC.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECC.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of ISecurityUserRepository.
/// </summary>
public sealed class SecurityUserRepository : ISecurityUserRepository
{
    private readonly EccDbContext _context;

    public SecurityUserRepository(EccDbContext context) => _context = context;

    public async Task<SecurityUser?> GetByIdAsync(Guid userId)
    {
        return await _context.SecurityUsers.FindAsync(userId);
    }

    public async Task<SecurityUser?> GetByEntraObjectIdAsync(string entraObjectId)
    {
        return await _context.SecurityUsers
            .FirstOrDefaultAsync(u => u.EntraObjectId == entraObjectId);
    }

    public async Task<IReadOnlyList<SecurityUser>> GetAllActiveAsync(int page, int pageSize)
    {
        return await _context.SecurityUsers
            .Where(u => u.IsActive)
            .OrderBy(u => u.DisplayName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetActiveCountAsync()
    {
        return await _context.SecurityUsers.CountAsync(u => u.IsActive);
    }

    public async Task<SecurityUser> CreateAsync(SecurityUser user)
    {
        _context.SecurityUsers.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(SecurityUser user)
    {
        _context.SecurityUsers.Update(user);
        await _context.SaveChangesAsync();
    }
}
