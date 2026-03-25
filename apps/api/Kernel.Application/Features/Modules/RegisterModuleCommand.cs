namespace Kernel.Application.Features.Modules;

using MediatR;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-register-module-command
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

public class RegisterModuleCommand : IRequest<RegisterModuleResponse>
{
    public string SolutionCode { get; set; } = string.Empty;

    public string ModuleCode { get; set; } = string.Empty;

    public string ModuleName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string BaseUrl { get; set; } = string.Empty;
}