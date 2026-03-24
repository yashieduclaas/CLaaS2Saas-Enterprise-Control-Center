using ECC.Domain.Entities;
using ECC.Domain.Interfaces;
using ECC.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECC.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of IAuditActionLogRepository.
/// </summary>
public sealed class AuditActionLogRepository : IAuditActionLogRepository
{
    private readonly EccDbContext _context;

    public AuditActionLogRepository(EccDbContext context) => _context = context;

    public async Task<AuditActionLog?> GetByIdAsync(Guid auditActionId)
    {
        return await _context.AuditActionLogs.FindAsync(auditActionId);
    }

    public async Task<IReadOnlyList<AuditActionLog>> GetBySessionIdAsync(Guid auditSessionId)
    {
        return await _context.AuditActionLogs
            .Where(a => a.AuditSessionId == auditSessionId)
            .OrderBy(a => a.ActionTimestamp)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<AuditActionLog>> GetByUserIdAsync(Guid userId)
    {
        return await _context.AuditActionLogs
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.ActionTimestamp)
            .ToListAsync();
    }

    public async Task<AuditActionLog> CreateAsync(AuditActionLog actionLog)
    {
        _context.AuditActionLogs.Add(actionLog);
        await _context.SaveChangesAsync();
        return actionLog;
    }
}
