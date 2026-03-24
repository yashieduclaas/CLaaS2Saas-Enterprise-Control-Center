using ECC.Application.DTOs.Registry;
using ECC.Application.Interfaces;
using ECC.Domain.Entities;
using ECC.Domain.Enums;
using ECC.Domain.Exceptions;
using ECC.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECC.Application.Services;

/// <summary>
/// Manages solution module registry operations.
/// </summary>
public sealed class RegistryService : IRegistryService
{
    private readonly ISolutionModuleRepository _moduleRepository;
    private readonly ILogger<RegistryService> _logger;

    public RegistryService(
        ISolutionModuleRepository moduleRepository,
        ILogger<RegistryService> logger)
    {
        _moduleRepository = moduleRepository;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<SolutionModuleDto> CreateSolutionModuleAsync(CreateSolutionModuleDto request, string createdBy)
    {
        var existing = await _moduleRepository.GetByCodesAsync(request.SolutionCode, request.ModuleCode);
        if (existing is not null)
            throw new AppException(ErrorCodes.ValidationFailed, "A module with this solution/module code combination already exists.");

        var entity = new SolutionModule
        {
            SolutionModuleId = Guid.NewGuid(),
            SolutionCode = request.SolutionCode,
            SolutionName = request.SolutionName,
            ModuleCode = request.ModuleCode,
            ModuleName = request.ModuleName,
            Description = request.Description,
            ModuleLead = request.ModuleLead,
            DocumentationUrl = request.DocumentationUrl,
            ModuleVersion = request.ModuleVersion,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = createdBy
        };

        entity = await _moduleRepository.CreateAsync(entity);

        _logger.LogInformation("Solution module created: {SolutionCode}/{ModuleCode}",
            entity.SolutionCode, entity.ModuleCode);

        return MapToDto(entity);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SolutionModuleDto>> GetAllModulesAsync()
    {
        var modules = await _moduleRepository.GetAllActiveAsync();
        return modules.Select(MapToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<SolutionModuleDto> GetModuleAsync(Guid solutionModuleId)
    {
        var module = await _moduleRepository.GetByIdAsync(solutionModuleId);
        if (module is null)
            throw new AppException(ErrorCodes.ValidationFailed, "Solution module not found.");

        return MapToDto(module);
    }

    private static SolutionModuleDto MapToDto(SolutionModule entity) => new(
        entity.SolutionModuleId,
        entity.SolutionCode,
        entity.SolutionName,
        entity.ModuleCode,
        entity.ModuleName,
        entity.Description,
        entity.ModuleLead,
        entity.DocumentationUrl,
        entity.ModuleVersion,
        entity.IsActive);
}
