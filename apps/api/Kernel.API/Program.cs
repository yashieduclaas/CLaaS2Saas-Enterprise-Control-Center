using Kernel.Application.Authorization;
using Kernel.Infrastructure.Auth;
using Kernel.Infrastructure.Authorization;
using Kernel.Infrastructure.DependencyInjection;
using Kernel.Infrastructure.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

var authMode = builder.Configuration["AUTH_MODE"] ?? "Demo";
var dataMode = builder.Configuration["DATA_MODE"] ?? "Local";

// ── Logging ──────────────────────────────────────────────────────────────────
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddJsonConsole(o => o.JsonWriterOptions = new() { Indented = false });

// ── Authentication ───────────────────────────────────────────────────────────
if (string.Equals(authMode, "Entra", StringComparison.OrdinalIgnoreCase))
{
    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = builder.Configuration["Entra:Authority"]
                ?? throw new InvalidOperationException("Entra:Authority must be configured when AUTH_MODE=Entra.");
            options.Audience = builder.Configuration["Entra:Audience"]
                ?? throw new InvalidOperationException("Entra:Audience must be configured when AUTH_MODE=Entra.");
            // Forensic audit requirement: explicit clock skew for token validation consistency.
            options.TokenValidationParameters.ClockSkew = TimeSpan.FromMinutes(2);
            options.TokenValidationParameters.ValidateIssuerSigningKey = true;
        });
}
else
{
    // Demo mode: no JWT. DemoAuthMiddleware sets HttpContext.User from X-Demo-User.
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = "Demo";
        options.DefaultChallengeScheme = "Demo";
        options.DefaultSignInScheme = "Demo";
    }).AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, DemoAuthSchemeHandler>("Demo", _ => { });
}

// ── Authorization policies ───────────────────────────────────────────────────
builder.Services.AddAuthorization(options =>
{
    void AddPermissionPolicy(string policy, string permission) =>
        options.AddPolicy(policy, p => p.Requirements.Add(new PermissionRequirement(permission)));

    AddPermissionPolicy(Policies.AdminGlobal, Permissions.AdminGlobal);
    AddPermissionPolicy(Policies.UsersRead,   Permissions.UsersRead);
    AddPermissionPolicy(Policies.UsersWrite,  Permissions.UsersWrite);
    AddPermissionPolicy(Policies.TenantRead,  Permissions.TenantRead);
    AddPermissionPolicy(Policies.RoleRead,    Permissions.RoleRead);
    AddPermissionPolicy(Policies.AuditViewActions, Permissions.AuditViewActions);

    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// ── Infrastructure (TenantContext, IPermissionEvaluator, handler) ────────────
builder.Services.AddKernelInfrastructure(authMode: authMode);

// ── Problem Details ───────────────────────────────────────────────────────────
builder.Services.AddProblemDetails();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── Health ────────────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks();

// ── CORS ────────────────────────────────────────────────────────────────────
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// ══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE ORDER — FROZEN. Do not reorder without architecture approval.
// ══════════════════════════════════════════════════════════════════════════════
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseHttpsRedirection();
app.UseCors();

if (string.Equals(authMode, "Demo", StringComparison.OrdinalIgnoreCase))
    app.UseMiddleware<DemoAuthMiddleware>(); // Demo: set User from X-Demo-User before auth pipeline

app.UseAuthentication();            // 1️⃣  Identify the caller
app.UseMiddleware<TenantMiddleware>(); // 2️⃣  Resolve tenant from identity
app.UseAuthorization();             // 3️⃣  Enforce policies

app.MapControllers();
app.MapHealthChecks("/health");

// TEMP: demo permissions stub for shell - remove before production
app.MapGet("/api/auth/me/permissions", () =>
    Results.Ok(new[] {
        "ROLE:CREATE", "ROLE:READ", "ROLE:UPDATE", "ROLE:DELETE",
        "USER:CREATE", "USER:READ", "USER:UPDATE", "USER:DELETE",
        "USER:ASSIGN_ROLE", "USER:REVOKE_ROLE",
        "MODULE:CREATE", "MODULE:READ", "MODULE:UPDATE", "MODULE:DELETE",
        "AUDIT:VIEW_SESSIONS", "AUDIT:VIEW_ACTIONS", "AUDIT:EXPORT",
        "ACCESS_REQUEST:SUBMIT", "ACCESS_REQUEST:REVIEW", "ACCESS_REQUEST:RESOLVE",
        "ADMIN:MODULE_SCOPED", "ADMIN:GLOBAL"
    }))
    .AllowAnonymous();

// TEMP: demo roles stub (shell contract shape) - remove before production
app.MapGet("/api/demo/roles", () => Results.Ok(new
{
    data = new[]
    {
        new { roleId = "r1", tenantId = "t1", moduleId = "m1", roleCode = "GLOBAL_ADMIN", roleName = "Global Admin",
            roleType = "GLOBAL_ADMIN", isSystemRole = true, isActive = true,
            permissionCodes = new[] { "ADMIN:GLOBAL" }, createdAt = "2026-02-19T00:00:00Z" },
        new { roleId = "r2", tenantId = "t1", moduleId = "m1", roleCode = "SECURITY_ADMIN", roleName = "Security Admin",
            roleType = "ADMIN", isSystemRole = true, isActive = true,
            permissionCodes = new[] { "ROLE:READ", "ROLE:CREATE", "AUDIT:VIEW_ACTIONS" }, createdAt = "2026-02-19T00:00:00Z" },
    },
    meta = new { requestId = "demo", timestamp = DateTime.UtcNow.ToString("O"), apiVersion = "1.0" }
})).AllowAnonymous();

app.Run();
