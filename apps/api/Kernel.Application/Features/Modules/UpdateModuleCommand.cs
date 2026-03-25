namespace Kernel.Application.Features.Modules;

using MediatR;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-update-module-command
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Represents the request payload used to update an existing module.
/// </summary>
public class UpdateModuleCommand : IRequest<UpdateModuleResult>
{
    /// <summary>
    /// Gets or sets the solution code used as part of the module identity key.
    /// </summary>
    public string SolutionCode { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the module code used as part of the module identity key.
    /// </summary>
    public string ModuleCode { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name for the module.
    /// </summary>
    public string ModuleName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the module description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the base URL used to access the module.
    /// </summary>
    public string BaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the module lead display name.
    /// </summary>
    public string ModuleLead { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the module lead email.
    /// </summary>
    public string ModuleLeadEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the module version.
    /// </summary>
    public string ModuleVersion { get; set; } = string.Empty;
}

/// <summary>
/// Represents the outcome of an update-module operation.
/// </summary>
public class UpdateModuleResult
{
    /// <summary>
    /// Gets or sets a value indicating whether the update succeeded.
    /// </summary>
    public bool Updated { get; set; }
}
