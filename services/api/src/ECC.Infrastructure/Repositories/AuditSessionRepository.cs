using ECC.Domain.Entities;
using ECC.Domain.Interfaces;
using ECC.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECC.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of IAuditSessionRepository.
/// </summary>
public sealed class AuditSessionRepository : IAuditSessionRepository
{
    private readonly EccDbContext _context;

    public AuditSessionRepository(EccDbContext context) => _context = context;

    public async Task<AuditSession?> GetByIdAsync(Guid auditSessionId)
    {
        return await _context.AuditSessions
            .Include(s => s.ActionLogs)
            .FirstOrDefaultAsync(s => s.AuditSessionId == auditSessionId);
    }

    public async Task<IReadOnlyList<AuditSession>> GetByUserIdAsync(Guid userId)
    {
        return await _context.AuditSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.SessionStartTime)
            .ToListAsync();
    }

    public async Task<AuditSession> CreateAsync(AuditSession session)
    {
        _context.AuditSessions.Add(session);
        await _context.SaveChangesAsync();
        return session;
    }

    public async Task UpdateAsync(AuditSession session)
    {
        _context.AuditSessions.Update(session);
        await _context.SaveChangesAsync();
    }
}
