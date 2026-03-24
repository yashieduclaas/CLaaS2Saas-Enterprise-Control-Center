using ECC.Application.DTOs.Common;
using ECC.Application.DTOs.Registry;
using ECC.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECC.API.Controllers;

/// <summary>
/// Solution module registry endpoints.
/// </summary>
[ApiController]
[Route("api/registry")]
[Authorize]
public sealed class RegistryController : ControllerBase
{
    private readonly IRegistryService _registryService;

    public RegistryController(IRegistryService registryService)
    {
        _registryService = registryService;
    }

    /// <summary>
    /// Retrieves all active solution modules.
    /// </summary>
    [HttpGet("modules")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SolutionModuleDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SolutionModuleDto>>>> GetModules()
    {
        var modules = await _registryService.GetAllModulesAsync();
        return Ok(ApiResponse<IReadOnlyList<SolutionModuleDto>>.Ok(modules));
    }

    /// <summary>
    /// Retrieves a solution module by ID.
    /// </summary>
    [HttpGet("modules/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SolutionModuleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<SolutionModuleDto>>> GetModule(Guid id)
    {
        var module = await _registryService.GetModuleAsync(id);
        return Ok(ApiResponse<SolutionModuleDto>.Ok(module));
    }

    /// <summary>
    /// Creates a new solution module.
    /// </summary>
    [HttpPost("modules")]
    [ProducesResponseType(typeof(ApiResponse<SolutionModuleDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<SolutionModuleDto>>> CreateModule(
        [FromBody] CreateSolutionModuleDto request)
    {
        var createdBy = User.FindFirst("oid")!.Value;
        var module = await _registryService.CreateSolutionModuleAsync(request, createdBy);
        return CreatedAtAction(nameof(GetModule), new { id = module.SolutionModuleId },
            ApiResponse<SolutionModuleDto>.Ok(module));
    }
}
