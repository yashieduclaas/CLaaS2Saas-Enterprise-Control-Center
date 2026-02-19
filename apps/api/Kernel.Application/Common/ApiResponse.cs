namespace Kernel.Application.Common;

/// <summary>
/// Standard envelope for all API responses.
/// </summary>
public sealed record ApiResponse<T>(
    bool Success,
    T? Data,
    string? ErrorCode = null,
    string? ErrorMessage = null)
{
    public static ApiResponse<T> Ok(T data) => new(true, data);
    public static ApiResponse<T> Fail(string code, string message) => new(false, default, code, message);
}

public static class ApiResponse
{
    public static ApiResponse<object> Ok() => ApiResponse<object>.Ok(new { });
    public static ApiResponse<object> Fail(string code, string message) =>
        ApiResponse<object>.Fail(code, message);
}
