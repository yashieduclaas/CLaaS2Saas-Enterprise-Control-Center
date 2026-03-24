using FluentValidation;

namespace ECC.Application.DTOs.Rbac;

/// <summary>
/// Request DTO for role assignment operations.
/// </summary>
public class AssignRoleRequestDto
{
    public string TargetEntraObjectId { get; set; } = string.Empty;
    public string SolutionCode { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string RoleCode { get; set; } = string.Empty;
}

/// <summary>
/// Validator for AssignRoleRequestDto.
/// </summary>
public class AssignRoleRequestDtoValidator : AbstractValidator<AssignRoleRequestDto>
{
    public AssignRoleRequestDtoValidator()
    {
        RuleFor(x => x.TargetEntraObjectId).NotEmpty().WithMessage("Target Entra Object ID is required.");
        RuleFor(x => x.SolutionCode).NotEmpty().MaximumLength(10).WithMessage("Solution code is required (max 10 chars).");
        RuleFor(x => x.ModuleCode).NotEmpty().MaximumLength(10).WithMessage("Module code is required (max 10 chars).");
        RuleFor(x => x.RoleCode).NotEmpty().MaximumLength(20).WithMessage("Role code is required (max 20 chars).");
    }
}

/// <summary>
/// Result DTO returned after a successful role assignment.
/// </summary>
public sealed record RoleAssignmentResultDto(
    Guid UserRoleId,
    Guid UserId,
    string RoleCode,
    string SolutionCode,
    string ModuleCode,
    DateTimeOffset AssignedDate);

/// <summary>
/// Request DTO for role revocation operations.
/// </summary>
public class RevokeRoleRequestDto
{
    public Guid UserRoleId { get; set; }
}

/// <summary>
/// Validator for RevokeRoleRequestDto.
/// </summary>
public class RevokeRoleRequestDtoValidator : AbstractValidator<RevokeRoleRequestDto>
{
    public RevokeRoleRequestDtoValidator()
    {
        RuleFor(x => x.UserRoleId).NotEmpty().WithMessage("User role ID is required.");
    }
}

/// <summary>
/// Role-permission summary for a module.
/// </summary>
public sealed record RolePermissionDto(
    Guid SecRoleId,
    string RoleCode,
    string RoleName,
    bool CanRead,
    bool CanCreate,
    bool CanUpdate,
    bool CanDelete,
    bool FullAccessAllModules);
