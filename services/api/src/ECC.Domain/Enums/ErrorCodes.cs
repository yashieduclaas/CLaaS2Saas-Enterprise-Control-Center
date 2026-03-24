namespace ECC.Domain.Enums;

/// <summary>
/// Structured error codes used with AppException for consistent error handling.
/// </summary>
public static class ErrorCodes
{
    public const string IdentityNotFound = "IDENTITY_NOT_FOUND";
    public const string InsufficientAuthority = "INSUFFICIENT_AUTHORITY";
    public const string ValidationFailed = "VALIDATION_FAILED";
    public const string RoleAlreadyActive = "ROLE_ALREADY_ACTIVE";
    public const string DatabaseError = "DATABASE_ERROR";
    public const string AuthError = "AUTH_ERROR";
}
