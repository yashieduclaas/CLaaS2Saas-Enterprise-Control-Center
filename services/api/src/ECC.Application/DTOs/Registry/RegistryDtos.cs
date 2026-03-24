using FluentValidation;

namespace ECC.Application.DTOs.Registry;

/// <summary>
/// Request DTO for creating a new solution module.
/// </summary>
public class CreateSolutionModuleDto
{
    public string SolutionCode { get; set; } = string.Empty;
    public string SolutionName { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ModuleLead { get; set; }
    public string? DocumentationUrl { get; set; }
    public string? ModuleVersion { get; set; }
}

/// <summary>
/// Validator for CreateSolutionModuleDto.
/// </summary>
public class CreateSolutionModuleDtoValidator : AbstractValidator<CreateSolutionModuleDto>
{
    public CreateSolutionModuleDtoValidator()
    {
        RuleFor(x => x.SolutionCode).NotEmpty().MaximumLength(10);
        RuleFor(x => x.SolutionName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ModuleCode).NotEmpty().MaximumLength(10);
        RuleFor(x => x.ModuleName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.DocumentationUrl)
            .Must(u => u == null || Uri.TryCreate(u, UriKind.Absolute, out _))
            .When(x => x.DocumentationUrl != null)
            .WithMessage("Documentation URL must be a valid absolute URI.");
    }
}

/// <summary>
/// Response DTO for solution module data.
/// </summary>
public sealed record SolutionModuleDto(
    Guid SolutionModuleId,
    string SolutionCode,
    string SolutionName,
    string ModuleCode,
    string ModuleName,
    string Description,
    string? ModuleLead,
    string? DocumentationUrl,
    string? ModuleVersion,
    bool IsActive);
