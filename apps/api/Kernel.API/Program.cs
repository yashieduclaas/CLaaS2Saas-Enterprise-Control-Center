using FluentValidation;
using Kernel.API.ExceptionHandling;
using Kernel.Application.Common.Behaviors;
using Kernel.Application.Authorization;
using Kernel.Application.Features.Users;
using Kernel.Infrastructure.Auth;
using Kernel.Infrastructure.Authorization;
using Kernel.Infrastructure.DependencyInjection;
using Kernel.Infrastructure.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

var authMode = builder.Configuration["AUTH_MODE"] ?? "Demo";
var dataMode = builder.Configuration["DATA_MODE"] ?? "InMemory";

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
builder.Services.AddKernelInfrastructure(
    authMode: authMode,
    dataMode: dataMode,
    configuration: builder.Configuration);

// ── MediatR + FluentValidation pipeline ───────────────────────────────────────
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(EnrichUserCommand).Assembly);
});
builder.Services.AddValidatorsFromAssemblyContaining<EnrichUserCommandValidator>();
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// ── Problem Details ───────────────────────────────────────────────────────────
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Enable camelCase property name mapping for JSON serialization/deserialization.
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

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

// TODO: Remove demo auth middleware and demo user store before production deployment

app.Run();
