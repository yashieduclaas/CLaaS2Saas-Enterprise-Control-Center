namespace ECC.Application.DTOs.Common;

/// <summary>
/// Standard envelope for all API responses.
/// </summary>
public sealed record ApiResponse<T>(
    bool Success,
    T? Data,
    ApiErrorDetail? Error = null)
{
    /// <summary>Creates a successful response with data.</summary>
    public static ApiResponse<T> Ok(T data) => new(true, data);

    /// <summary>Creates a failed response with error details.</summary>
    public static ApiResponse<T> Fail(string code, string message) =>
        new(false, default, new ApiErrorDetail(code, message));
}

/// <summary>
/// Error detail included in failed API responses.
/// </summary>
public sealed record ApiErrorDetail(string Code, string Message);
