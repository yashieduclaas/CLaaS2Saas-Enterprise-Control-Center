using Kernel.Application.Authorization;
using Kernel.Application.Common;
using Kernel.Application.Features.Modules;
using Kernel.Application.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kernel.API.Controllers;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-api-modules-controller
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Module management endpoints for registering and listing solution modules.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public sealed class ModulesController : ControllerBase
{
    private static readonly List<ModuleDto> ModulesStore =
    [
        new ModuleDto(
            SolutionCode: "AIW",
            ModuleCode: "KERNEL",
            ModuleName: "Kernel Apps",
            Description: "Core kernel administration module",
            BaseUrl: "/kernel",
            ModuleLead: "Platform Team",
            ModuleLeadEmail: "platform.team@lithan.com",
            ModuleVersion: "v1.0.0")
    ];

    /// <summary>
    /// Returns all currently registered modules.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = Policies.TenantRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ModuleDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public ActionResult<ApiResponse<IReadOnlyList<ModuleDto>>> ListModules()
    {
        return Ok(ApiResponse<IReadOnlyList<ModuleDto>>.Ok(ModulesStore));
    }

    /// <summary>
    /// Registers a new module.
    /// </summary>
    [HttpPost("register")]
    [Authorize(Policy = Policies.AdminGlobal)]
    [ProducesResponseType(typeof(ApiResponse<RegisterModuleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RegisterModuleResponse>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public ActionResult<ApiResponse<RegisterModuleResponse>> RegisterModule([FromBody] RegisterModuleCommand command)
    {
        var exists = ModulesStore.Any(m =>
            string.Equals(m.SolutionCode, command.SolutionCode, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(m.ModuleCode, command.ModuleCode, StringComparison.OrdinalIgnoreCase));

        if (exists)
        {
            return Conflict(ApiResponse<RegisterModuleResponse>.Fail(
                "MODULE_EXISTS",
                "A module with the same SolutionCode and ModuleCode already exists."));
        }

        ModulesStore.Add(new ModuleDto(
            SolutionCode: command.SolutionCode,
            ModuleCode: command.ModuleCode,
            ModuleName: command.ModuleName,
            Description: command.Description,
            BaseUrl: command.BaseUrl,
            ModuleLead: command.ModuleLead,
            ModuleLeadEmail: command.ModuleLeadEmail,
            ModuleVersion: command.ModuleVersion));

        return Ok(ApiResponse<RegisterModuleResponse>.Ok(new RegisterModuleResponse()));
    }

    /// <summary>
    /// Updates an existing module.
    /// </summary>
    [HttpPut("update")]
    [Authorize(Policy = Policies.AdminGlobal)]
    [ProducesResponseType(typeof(ApiResponse<ModuleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ModuleDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ModuleDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public ActionResult<ApiResponse<ModuleDto>> UpdateModule([FromBody] UpdateModuleCommand command)
    {
        var validator = new UpdateModuleValidator();
        var validationResult = validator.Validate(command);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<ModuleDto>.Fail(
                "INVALID_MODULE_UPDATE_REQUEST",
                string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage))));
        }

        var index = ModulesStore.FindIndex(m =>
            string.Equals(m.SolutionCode, command.SolutionCode, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(m.ModuleCode, command.ModuleCode, StringComparison.OrdinalIgnoreCase));

        if (index < 0)
        {
            return NotFound(ApiResponse<ModuleDto>.Fail(
                "MODULE_NOT_FOUND",
                "Module was not found for the specified SolutionCode and ModuleCode."));
        }

        var updated = new ModuleDto(
            SolutionCode: command.SolutionCode,
            ModuleCode: command.ModuleCode,
            ModuleName: command.ModuleName,
            Description: command.Description,
            BaseUrl: command.BaseUrl,
            ModuleLead: command.ModuleLead,
            ModuleLeadEmail: command.ModuleLeadEmail,
            ModuleVersion: command.ModuleVersion);

        ModulesStore[index] = updated;

        return Ok(ApiResponse<ModuleDto>.Ok(updated));
    }
}

public sealed record ModuleDto(
    string SolutionCode,
    string ModuleCode,
    string ModuleName,
    string Description,
    string BaseUrl,
    string ModuleLead,
    string ModuleLeadEmail,
    string ModuleVersion);