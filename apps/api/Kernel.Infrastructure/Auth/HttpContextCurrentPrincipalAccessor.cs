using System.Security.Claims;
using Kernel.Application.Abstractions;
using Microsoft.AspNetCore.Http;

namespace Kernel.Infrastructure.Auth;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-infrastructure-auth-current-principal
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Resolves the current principal identifier from the active HTTP context.
/// </summary>
internal sealed class HttpContextCurrentPrincipalAccessor : ICurrentPrincipalAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpContextCurrentPrincipalAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? PrincipalId =>
        _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? _httpContextAccessor.HttpContext?.User.FindFirst("oid")?.Value
        ?? _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value;
}