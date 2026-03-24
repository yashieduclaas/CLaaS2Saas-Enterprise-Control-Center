using System.Net;
using System.Text.Json;
using ECC.Application.DTOs.Common;
using ECC.Domain.Enums;
using ECC.Domain.Exceptions;

namespace ECC.API.Middleware;

/// <summary>
/// Global exception handler. Maps AppException to appropriate HTTP status codes.
/// Never exposes stack traces or SQL details in the response.
/// </summary>
public sealed class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning("AppException: code={ErrorCode}, message={Message}", ex.ErrorCode, ex.Message);

            var statusCode = ex.ErrorCode switch
            {
                ErrorCodes.IdentityNotFound => HttpStatusCode.NotFound,
                ErrorCodes.InsufficientAuthority => HttpStatusCode.Forbidden,
                ErrorCodes.ValidationFailed => HttpStatusCode.BadRequest,
                ErrorCodes.RoleAlreadyActive => HttpStatusCode.Conflict,
                ErrorCodes.DatabaseError => HttpStatusCode.InternalServerError,
                ErrorCodes.AuthError => HttpStatusCode.Unauthorized,
                _ => HttpStatusCode.InternalServerError
            };

            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";
            var response = new ApiResponse<object>(false, null, new ApiErrorDetail(ex.ErrorCode, ex.Message));
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");

            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var response = new ApiResponse<object>(false, null, new ApiErrorDetail("INTERNAL_ERROR", "An unexpected error occurred."));
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
        }
    }
}
