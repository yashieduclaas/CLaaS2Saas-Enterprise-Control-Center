namespace Kernel.Application.Validators;

using FluentValidation;
using Kernel.Application.Features.Modules;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-update-module-validator
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Validates update module requests.
/// </summary>
public sealed class UpdateModuleValidator : AbstractValidator<UpdateModuleCommand>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateModuleValidator"/> class.
    /// </summary>
    public UpdateModuleValidator()
    {
        RuleFor(x => x.SolutionCode)
            .NotEmpty()
            .MaximumLength(32)
            .Matches("^[A-Z0-9_]+$");

        RuleFor(x => x.ModuleCode)
            .NotEmpty()
            .MaximumLength(64)
            .Matches("^[A-Z0-9_]+$");

        RuleFor(x => x.ModuleName)
            .NotEmpty()
            .MaximumLength(128);

        RuleFor(x => x.Description)
            .NotEmpty()
            .MaximumLength(500);

        RuleFor(x => x.BaseUrl)
            .MaximumLength(256)
            .Must(url => string.IsNullOrWhiteSpace(url) || Uri.IsWellFormedUriString(url, UriKind.RelativeOrAbsolute));

        RuleFor(x => x.ModuleLead)
            .MaximumLength(128);

        RuleFor(x => x.ModuleLeadEmail)
            .MaximumLength(256)
            .Must(email => string.IsNullOrWhiteSpace(email) || email.Contains('@'));

        RuleFor(x => x.ModuleVersion)
            .MaximumLength(32);
    }
}
