using FluentValidation;

namespace Kernel.Application.Features.Users;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-users-enrich-validator
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Validates <see cref="EnrichUserCommand"/> inputs.
/// </summary>
public sealed class EnrichUserCommandValidator : AbstractValidator<EnrichUserCommand>
{
    /// <summary>
    /// Creates a new validator instance.
    /// </summary>
    public EnrichUserCommandValidator()
    {
        RuleFor(x => x.entra_email_id)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);

        RuleFor(x => x.display_name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.org_role)
            .MaximumLength(150)
            .When(x => !string.IsNullOrWhiteSpace(x.org_role));

        RuleFor(x => x.manager_email_id)
            .EmailAddress()
            .MaximumLength(255)
            .When(x => !string.IsNullOrWhiteSpace(x.manager_email_id));

        RuleFor(x => x.manager_name)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.manager_name));
    }
}