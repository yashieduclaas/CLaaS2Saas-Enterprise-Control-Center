# CLaaS2SaaS Security Kernel — Frozen Project Skeleton

**Version:** 1.0 | **Status:** FROZEN — PLATFORM BOOTSTRAP LAYER  
**Architecture Bar:** Microsoft Entra Admin Center / Azure Portal / M365 Admin Center  
**Date:** February 2026

---

> ## ⚠️ IMMUTABILITY DECLARATION — READ BEFORE PROCEEDING
>
> This is the **ONE-TIME FROZEN PROJECT SKELETON**. It establishes the non-negotiable structural and wiring foundation for all future development.
>
> 🔒 **Folder structure is frozen** — No structural changes without ARB approval  
> 🔒 **Core wiring is frozen** — Program.cs middleware pipeline is immutable  
> 🔒 **Auth pipeline is frozen** — AuthProvider, MsalAuthProvider are platform-owned  
> 🔒 **RBAC seam is frozen** — IPermissionEvaluator interface contract is locked  
> 🔒 **Navigation shell is frozen** — AppLayout and NavRail are platform-owned  
> 🔒 **Contracts are authoritative** — /packages/contracts is the single source of truth  
> 🔒 **Feature code is additive only** — Feature slices may not modify platform layer  
>
> **Multiple AI agents build on top of this foundation. Architectural drift here causes systemic failure.**

---

## Table of Contents

1. [Repo Bootstrap & Solution Structure](#1-repo-bootstrap--solution-structure)
2. [Backend — Clean Architecture Projects](#2-backend--clean-architecture-projects)
3. [Backend — Program.cs Auth Pipeline](#3-backend--programcs-auth-pipeline)
4. [Backend — TenantMiddleware](#4-backend--tenantmiddleware)
5. [Backend — IPermissionEvaluator Seam](#5-backend--ipermissionevaluator-seam)
6. [Backend — Authorization Policy Wiring](#6-backend--authorization-policy-wiring)
7. [Backend — Controller Reference Pattern](#7-backend--controller-reference-pattern)
8. [Frontend — App Bootstrap](#8-frontend--app-bootstrap)
9. [Frontend — MSAL Auth Wiring](#9-frontend--msal-auth-wiring)
10. [Frontend — Permission Provider](#10-frontend--permission-provider)
11. [Frontend — Navigation Shell](#11-frontend--navigation-shell)
12. [Frontend — RoutePermissionMap](#12-frontend--routepermissionmap)
13. [Frontend — Griffel Baseline](#13-frontend--griffel-baseline)
14. [Contracts Package Scaffold](#14-contracts-package-scaffold)
15. [Build & Run Verification](#15-build--run-verification)
16. [AI Safety Rules — Platform Immutability](#16-ai-safety-rules--platform-immutability)

---

## 1. Repo Bootstrap & Solution Structure

### `Kernel.sln`

```xml
<!-- /Kernel.sln -->
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.0.0

Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "Kernel.Domain", "apps\api\src\Kernel.Domain\Kernel.Domain.csproj", "{A1B2C3D4-0001-0000-0000-000000000001}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "Kernel.Application", "apps\api\src\Kernel.Application\Kernel.Application.csproj", "{A1B2C3D4-0002-0000-0000-000000000002}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "Kernel.Infrastructure", "apps\api\src\Kernel.Infrastructure\Kernel.Infrastructure.csproj", "{A1B2C3D4-0003-0000-0000-000000000003}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "Kernel.API", "apps\api\src\Kernel.API\Kernel.API.csproj", "{A1B2C3D4-0004-0000-0000-000000000004}"
EndProject

Global
    GlobalSection(SolutionConfigurationPlatforms) = preSolution
        Debug|Any CPU = Debug|Any CPU
        Release|Any CPU = Release|Any CPU
    EndGlobalSection
    GlobalSection(ProjectConfigurationPlatforms) = postSolution
        {A1B2C3D4-0001-0000-0000-000000000001}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {A1B2C3D4-0001-0000-0000-000000000001}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {A1B2C3D4-0001-0000-0000-000000000001}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {A1B2C3D4-0001-0000-0000-000000000001}.Release|Any CPU.Build.0 = Release|Any CPU
        {A1B2C3D4-0002-0000-0000-000000000002}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {A1B2C3D4-0002-0000-0000-000000000002}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {A1B2C3D4-0002-0000-0000-000000000002}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {A1B2C3D4-0002-0000-0000-000000000002}.Release|Any CPU.Build.0 = Release|Any CPU
        {A1B2C3D4-0003-0000-0000-000000000003}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {A1B2C3D4-0003-0000-0000-000000000003}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {A1B2C3D4-0003-0000-0000-000000000003}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {A1B2C3D4-0003-0000-0000-000000000003}.Release|Any CPU.Build.0 = Release|Any CPU
        {A1B2C3D4-0004-0000-0000-000000000004}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {A1B2C3D4-0004-0000-0000-000000000004}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {A1B2C3D4-0004-0000-0000-000000000004}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {A1B2C3D4-0004-0000-0000-000000000004}.Release|Any CPU.Build.0 = Release|Any CPU
    EndGlobalSection
EndGlobal
```

### `package.json` (Root)

```json
{
  "name": "claas2saas-kernel",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

### `turbo.json` (Root)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"], "outputs": [] },
    "lint": { "outputs": [] },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `.github/CODEOWNERS`

```
# Every path requiring architectural review

# Contracts — requires Arch lead + second architect
/packages/contracts/                    @org/arch-leads

# Governance docs
/governance/                            @org/arch-leads
/architecture/                          @org/arch-leads

# CI/CD pipelines
/.github/workflows/                     @org/devops

# Authorization core — requires Security + Arch review
/apps/api/src/Kernel.Application/Authorization/   @org/security @org/arch-leads
/apps/api/src/Kernel.Infrastructure/Authorization/ @org/security @org/arch-leads

# Platform frontend shell — immutable
/apps/web/src/app/                      @org/arch-leads
/apps/web/src/auth/                     @org/arch-leads
/apps/web/src/rbac/                     @org/arch-leads
/apps/web/src/navigation/              @org/arch-leads

# Default: all engineers
*                                       @org/engineering
```

### `README.md`

```markdown
# CLaaS2SaaS Security Kernel

Multi-Tenant RBAC Control Centre — Microsoft Entra ID  
Architecture Bar: Microsoft Entra Admin Center / Azure Portal / M365 Admin Center

## ⚠️ Platform Immutability Warning

This repository contains a **frozen platform skeleton**. Platform-layer files
(auth providers, permission evaluator, navigation shell, contracts) are immutable
without ARB approval. Feature development is **additive only**.

## Prerequisites

| Tool         | Version   |
|--------------|-----------|
| .NET SDK     | 8.0.x LTS |
| Node.js      | ≥ 20.x    |
| pnpm         | 9.x       |
| Turborepo    | 2.x       |

## Quick Start

```bash
# Install frontend dependencies
pnpm install

# Build all packages
pnpm turbo run build

# Run backend
cd apps/api && dotnet run --project src/Kernel.API

# Run frontend (separate terminal)
cd apps/web && pnpm dev
```

## Architecture

See `/architecture/` for ADRs and diagrams.  
See `/governance/coding-constitution.md` for engineering law.  
See `/packages/contracts/` for the single source of truth on types.
```

---

## 2. Backend — Clean Architecture Projects

### Directory Layout

```
apps/api/
├── src/
│   ├── Kernel.Domain/
│   ├── Kernel.Application/
│   ├── Kernel.Infrastructure/
│   └── Kernel.API/
└── tests/
    ├── Kernel.Application.Tests/
    └── Kernel.Infrastructure.Tests/
```

### `Kernel.Domain.csproj`

```xml
<!-- apps/api/src/Kernel.Domain/Kernel.Domain.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

### `Kernel.Application.csproj`

```xml
<!-- apps/api/src/Kernel.Application/Kernel.Application.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\Kernel.Domain\Kernel.Domain.csproj" />
  </ItemGroup>
</Project>
```

### `Kernel.Infrastructure.csproj`

```xml
<!-- apps/api/src/Kernel.Infrastructure/Kernel.Infrastructure.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\Kernel.Application\Kernel.Application.csproj" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.*" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.*" />
  </ItemGroup>
</Project>
```

### `Kernel.API.csproj`

```xml
<!-- apps/api/src/Kernel.API/Kernel.API.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <UserSecretsId>claas2saas-kernel-api</UserSecretsId>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\Kernel.Application\Kernel.Application.csproj" />
    <ProjectReference Include="..\Kernel.Infrastructure\Kernel.Infrastructure.csproj" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.*" />
    <PackageReference Include="Microsoft.Identity.Web" Version="2.*" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.*" />
  </ItemGroup>
</Project>
```

### `appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "__SET_IN_USER_SECRETS__",
    "ClientId": "__SET_IN_USER_SECRETS__",
    "Audience": "api://__SET_IN_USER_SECRETS__"
  },
  "TenantMiddleware": {
    "EnforceOnAllRoutes": true,
    "SkipPaths": ["/health", "/swagger"]
  }
}
```

### `appsettings.Development.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  },
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "common",
    "ClientId": "local-dev-placeholder",
    "Audience": "api://local-dev-placeholder"
  },
  "TenantMiddleware": {
    "EnforceOnAllRoutes": false,
    "SkipPaths": ["/health", "/swagger", "/api/"]
  }
}
```

---

## 3. Backend — Program.cs Auth Pipeline

> 🔒 FROZEN — This file establishes the authoritative middleware pipeline.  
> No feature team may reorder, add to, or remove from the middleware chain.

```csharp
// apps/api/src/Kernel.API/Program.cs
using Kernel.API.Middleware;
using Kernel.Application;
using Kernel.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

// ── Telemetry & Logging ───────────────────────────────────────────────────
builder.Services.AddApplicationInsightsTelemetry();

// ── Auth — Microsoft Entra JWT Bearer ────────────────────────────────────
// FROZEN: ClockSkew, TokenValidationParameters, and auth scheme are immutable.
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(options =>
    {
        builder.Configuration.Bind("AzureAd", options);
        options.TokenValidationParameters.ClockSkew = TimeSpan.FromMinutes(2);
        options.TokenValidationParameters.ValidateAudience = true;
        options.TokenValidationParameters.ValidateIssuer = true;
    },
    msIdentityOptions =>
    {
        builder.Configuration.Bind("AzureAd", msIdentityOptions);
    });

// ── Authorization Policies ────────────────────────────────────────────────
// FROZEN: All policies route through IPermissionEvaluator. No role shortcuts.
builder.Services.AddApplicationAuthorization();

// ── Application & Infrastructure DI ──────────────────────────────────────
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// ── API Surface ───────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CLaaS2SaaS Security Kernel API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// ── Problem Details ───────────────────────────────────────────────────────
builder.Services.AddProblemDetails();

// ── CORS — Restrict in production via environment config ──────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ── Health Checks ─────────────────────────────────────────────────────────
builder.Services.AddHealthChecks();

// ─────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── FROZEN: Middleware pipeline order is non-negotiable ───────────────────
// Changing this order without ARB approval is a security defect.

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevCors");
}

app.UseHttpsRedirection();

// 1. Authentication — validates Entra JWT
app.UseAuthentication();

// 2. Tenant resolution — extracts and validates tenant context from token
app.UseMiddleware<TenantMiddleware>();

// 3. Authorization — evaluates permissions via IPermissionEvaluator
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
```

### `ApplicationServiceExtensions.cs`

```csharp
// apps/api/src/Kernel.Application/ApplicationServiceExtensions.cs
using Kernel.Application.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace Kernel.Application;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Authorization handler wired here — policy registration in AddApplicationAuthorization
        services.AddScoped<IAuthorizationHandler, PermissionRequirementHandler>();
        return services;
    }

    public static IServiceCollection AddApplicationAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // All policies route through PermissionRequirementHandler → IPermissionEvaluator
            // FROZEN: No policy may use roles, claims, or shortcuts.
            options.AddPolicy("RequireAuthenticated", policy =>
                policy.RequireAuthenticatedUser());

            // Default deny — any endpoint without explicit policy is locked
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
        });
        return services;
    }
}
```

### `InfrastructureServiceExtensions.cs`

```csharp
// apps/api/src/Kernel.Infrastructure/InfrastructureServiceExtensions.cs
using Kernel.Application.Authorization;
using Kernel.Infrastructure.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Kernel.Infrastructure;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── TEMPORARY STUB — Replace before production deployment ──────────────
        // This stub always denies except for ADMIN:GLOBAL.
        // Replace with DataversePermissionEvaluator at MMP.
        services.AddScoped<IPermissionEvaluator, StubPermissionEvaluator>();

        // ── Permission Cache — MVP: in-memory, MMP: Redis ─────────────────────
        // MMP: Replace with RedisPermissionCache. One-line DI swap. No other changes.
        services.AddSingleton<IPermissionCache, InMemoryPermissionCache>();

        return services;
    }
}
```

---

## 4. Backend — TenantMiddleware

> 🔒 FROZEN — This is platform infrastructure. Feature teams may not modify.

```csharp
// apps/api/src/Kernel.API/Middleware/TenantMiddleware.cs
using System.Security.Claims;
using Kernel.Application.Tenant;
using Microsoft.Extensions.Options;

namespace Kernel.API.Middleware;

/// <summary>
/// PLATFORM MIDDLEWARE — FROZEN.
/// Extracts the Entra tenant ID (tid claim) from the validated JWT,
/// constructs TenantContext, and attaches it to HttpContext.Items.
/// 
/// This runs AFTER UseAuthentication() and BEFORE UseAuthorization().
/// Enforcement is configurable via TenantMiddlewareOptions.
/// </summary>
public sealed class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly TenantMiddlewareOptions _options;
    private readonly ILogger<TenantMiddleware> _logger;

    public TenantMiddleware(
        RequestDelegate next,
        IOptions<TenantMiddlewareOptions> options,
        ILogger<TenantMiddleware> logger)
    {
        _next = next;
        _options = options.Value;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip enforcement for configured paths (health, swagger)
        var path = context.Request.Path.Value ?? string.Empty;
        if (_options.SkipPaths.Any(skip => path.StartsWith(skip, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(context);
            return;
        }

        // Only enforce on authenticated requests
        if (context.User.Identity?.IsAuthenticated != true)
        {
            await _next(context);
            return;
        }

        // Extract tid claim — Entra tenant ID
        var tenantIdClaim = context.User.FindFirst("tid")?.Value
                         ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(tenantIdClaim))
        {
            if (_options.EnforceOnAllRoutes)
            {
                _logger.LogWarning("TenantMiddleware: Authenticated request missing tid claim. Path={Path}", path);
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    type = "https://tools.ietf.org/html/rfc7807",
                    title = "Tenant context could not be resolved.",
                    status = 403,
                    detail = "Request is authenticated but tenant identifier is absent."
                });
                return;
            }

            _logger.LogDebug("TenantMiddleware: Missing tid claim — enforcement disabled for dev mode.");
            await _next(context);
            return;
        }

        var tenantContext = new TenantContext
        {
            TenantId = tenantIdClaim,
            ObjectId = context.User.FindFirst("oid")?.Value ?? string.Empty,
            ResolvedAt = DateTimeOffset.UtcNow
        };

        // Attach to HttpContext.Items — downstream services resolve via ITenantContextAccessor
        context.Items[TenantContext.HttpContextKey] = tenantContext;

        await _next(context);
    }
}

public sealed class TenantMiddlewareOptions
{
    public bool EnforceOnAllRoutes { get; set; } = true;
    public List<string> SkipPaths { get; set; } = new() { "/health", "/swagger" };
}
```

### `TenantContext.cs`

```csharp
// apps/api/src/Kernel.Application/Tenant/TenantContext.cs
namespace Kernel.Application.Tenant;

/// <summary>
/// Immutable per-request tenant context.
/// Populated by TenantMiddleware from validated JWT claims.
/// Read-only after construction — treat as a value object.
/// </summary>
public sealed class TenantContext
{
    public const string HttpContextKey = "Kernel:TenantContext";

    /// <summary>Entra tenant ID extracted from tid claim.</summary>
    public required string TenantId { get; init; }

    /// <summary>User object ID extracted from oid claim.</summary>
    public required string ObjectId { get; init; }

    /// <summary>UTC timestamp when tenant context was resolved.</summary>
    public required DateTimeOffset ResolvedAt { get; init; }
}
```

### `ITenantContextAccessor.cs`

```csharp
// apps/api/src/Kernel.Application/Tenant/ITenantContextAccessor.cs
namespace Kernel.Application.Tenant;

/// <summary>
/// Provides access to the current request's TenantContext.
/// Implementations resolve from HttpContext.Items.
/// </summary>
public interface ITenantContextAccessor
{
    TenantContext? Current { get; }
    TenantContext GetRequiredContext();
}
```

---

## 5. Backend — IPermissionEvaluator Seam

> 🔒 FROZEN — This seam is the canonical RBAC interface. Future caching, auditing, and SoD conflict detection wire into EvaluateAsync. Interface contract is immutable.

```csharp
// apps/api/src/Kernel.Application/Authorization/IPermissionEvaluator.cs
namespace Kernel.Application.Authorization;

/// <summary>
/// CANONICAL RBAC SEAM — FROZEN.
/// 
/// All permission evaluation in the system passes through this interface.
/// Callers: PermissionRequirementHandler (HTTP), background jobs, SignalR hubs, gRPC.
/// 
/// Implementors:
///   - StubPermissionEvaluator (MVP — temporary, always denies except ADMIN:GLOBAL)
///   - DataversePermissionEvaluator (MMP — reads from Dataverse)
/// 
/// Contract invariants:
///   - EvaluateAsync is idempotent for the same (userId, tenantId, permissionCode) triple
///   - EvaluateAsync never throws — returns denied result on infrastructure failure
///   - EvaluateAsync always emits an audit event (via IAuditQueue)
///   - Result.PermissionsVersion is stamped from the active permission snapshot
/// </summary>
public interface IPermissionEvaluator
{
    Task<EvaluationResult> EvaluateAsync(
        EvaluationRequest request,
        CancellationToken cancellationToken = default);
}

public sealed record EvaluationRequest
{
    public required string UserId { get; init; }
    public required string TenantId { get; init; }
    public required string PermissionCode { get; init; }
    public string? CorrelationId { get; init; }
}

public sealed record EvaluationResult
{
    public required bool IsGranted { get; init; }
    public required string UserId { get; init; }
    public required string TenantId { get; init; }
    public required string PermissionCode { get; init; }

    /// <summary>
    /// Version GUID of the permission snapshot used for this evaluation.
    /// Stamped on every AuditActionLog entry for forensic compliance.
    /// </summary>
    public required Guid PermissionsVersion { get; init; }

    public required DateTimeOffset EvaluatedAt { get; init; }
    public string? DenialReason { get; init; }
}
```

### `IPermissionCache.cs`

```csharp
// apps/api/src/Kernel.Application/Authorization/IPermissionCache.cs
namespace Kernel.Application.Authorization;

/// <summary>
/// Permission snapshot cache seam.
/// MVP: InMemoryPermissionCache
/// MMP: RedisPermissionCache (one-line DI swap in InfrastructureServiceExtensions)
/// </summary>
public interface IPermissionCache
{
    Task<IReadOnlySet<string>?> GetAsync(string userId, string tenantId, CancellationToken ct = default);
    Task SetAsync(string userId, string tenantId, IReadOnlySet<string> permissions, CancellationToken ct = default);
    Task InvalidateAsync(string userId, string tenantId, CancellationToken ct = default);
}
```

### `StubPermissionEvaluator.cs`

```csharp
// apps/api/src/Kernel.Infrastructure/Authorization/StubPermissionEvaluator.cs
using Kernel.Application.Authorization;
using Microsoft.Extensions.Logging;

namespace Kernel.Infrastructure.Authorization;

/// <summary>
/// ⚠️ TEMPORARY STUB — NOT FOR PRODUCTION USE.
/// 
/// This implementation always DENIES unless the permission code is exactly
/// "ADMIN:GLOBAL". It exists solely to establish the DI seam and verify
/// the authorization pipeline compiles and runs.
/// 
/// REPLACEMENT TARGET: DataversePermissionEvaluator at MMP.
/// REPLACEMENT SCOPE: This class only. IPermissionEvaluator interface is frozen.
/// REPLACEMENT TRIGGER: When Dataverse schema is available and validated.
/// </summary>
internal sealed class StubPermissionEvaluator : IPermissionEvaluator
{
    private static readonly Guid StubVersionId = new("00000000-STUB-0000-0000-000000000001");
    private readonly ILogger<StubPermissionEvaluator> _logger;

    public StubPermissionEvaluator(ILogger<StubPermissionEvaluator> logger)
    {
        _logger = logger;
    }

    public Task<EvaluationResult> EvaluateAsync(
        EvaluationRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug(
            "[STUB] Evaluating permission {Code} for user {UserId} in tenant {TenantId}",
            request.PermissionCode, request.UserId, request.TenantId);

        // Stub grants ADMIN:GLOBAL only — all other codes are denied
        var isGranted = request.PermissionCode == "ADMIN:GLOBAL";

        var result = new EvaluationResult
        {
            IsGranted = isGranted,
            UserId = request.UserId,
            TenantId = request.TenantId,
            PermissionCode = request.PermissionCode,
            PermissionsVersion = StubVersionId,
            EvaluatedAt = DateTimeOffset.UtcNow,
            DenialReason = isGranted ? null : "STUB_EVALUATOR: Permission not in stub allowlist."
        };

        return Task.FromResult(result);
    }
}
```

### `InMemoryPermissionCache.cs`

```csharp
// apps/api/src/Kernel.Infrastructure/Authorization/InMemoryPermissionCache.cs
using System.Collections.Concurrent;
using Kernel.Application.Authorization;

namespace Kernel.Infrastructure.Authorization;

/// <summary>
/// MVP in-memory permission cache.
/// MMP: Replace with RedisPermissionCache in InfrastructureServiceExtensions.
/// No other changes required.
/// </summary>
internal sealed class InMemoryPermissionCache : IPermissionCache
{
    private readonly ConcurrentDictionary<string, IReadOnlySet<string>> _store = new();

    private static string Key(string userId, string tenantId) => $"{tenantId}:{userId}";

    public Task<IReadOnlySet<string>?> GetAsync(string userId, string tenantId, CancellationToken ct = default)
    {
        _store.TryGetValue(Key(userId, tenantId), out var result);
        return Task.FromResult(result);
    }

    public Task SetAsync(string userId, string tenantId, IReadOnlySet<string> permissions, CancellationToken ct = default)
    {
        _store[Key(userId, tenantId)] = permissions;
        return Task.CompletedTask;
    }

    public Task InvalidateAsync(string userId, string tenantId, CancellationToken ct = default)
    {
        _store.TryRemove(Key(userId, tenantId), out _);
        return Task.CompletedTask;
    }
}
```

---

## 6. Backend — Authorization Policy Wiring

```csharp
// apps/api/src/Kernel.Application/Authorization/PermissionRequirement.cs
using Microsoft.AspNetCore.Authorization;

namespace Kernel.Application.Authorization;

/// <summary>
/// Authorization requirement carrying a single permission code.
/// Used by PermissionRequirementHandler to call IPermissionEvaluator.
/// </summary>
public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public string PermissionCode { get; }

    public PermissionRequirement(string permissionCode)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(permissionCode);
        PermissionCode = permissionCode;
    }
}
```

```csharp
// apps/api/src/Kernel.Application/Authorization/PermissionRequirementHandler.cs
using System.Security.Claims;
using Kernel.Application.Tenant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Kernel.Application.Authorization;

/// <summary>
/// FROZEN AUTHORIZATION HANDLER.
/// 
/// Routes all [Authorize(Policy="...")] checks through IPermissionEvaluator.
/// This is the ONLY authorization handler in the system.
/// No role-based shortcuts. No claims-based shortcuts. No exceptions.
/// 
/// Pipeline: HTTP Request → JWT validation → TenantMiddleware → 
///           UseAuthorization → PermissionRequirementHandler → IPermissionEvaluator
/// </summary>
public sealed class PermissionRequirementHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IPermissionEvaluator _evaluator;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<PermissionRequirementHandler> _logger;

    public PermissionRequirementHandler(
        IPermissionEvaluator evaluator,
        IHttpContextAccessor httpContextAccessor,
        ILogger<PermissionRequirementHandler> logger)
    {
        _evaluator = evaluator;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;

        var userId = context.User.FindFirst("oid")?.Value
                  ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var tenantContext = httpContext?.Items[TenantContext.HttpContextKey] as TenantContext;
        var tenantId = tenantContext?.TenantId;

        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(tenantId))
        {
            _logger.LogWarning(
                "Authorization failed: missing userId or tenantId. UserId={UserId} TenantId={TenantId}",
                userId, tenantId);
            context.Fail(new AuthorizationFailureReason(this, "User identity or tenant context could not be resolved."));
            return;
        }

        var correlationId = httpContext?.TraceIdentifier;

        var result = await _evaluator.EvaluateAsync(new EvaluationRequest
        {
            UserId = userId,
            TenantId = tenantId,
            PermissionCode = requirement.PermissionCode,
            CorrelationId = correlationId
        });

        if (result.IsGranted)
        {
            context.Succeed(requirement);
        }
        else
        {
            _logger.LogInformation(
                "Permission denied. UserId={UserId} TenantId={TenantId} Code={Code} Reason={Reason}",
                userId, tenantId, requirement.PermissionCode, result.DenialReason);
            context.Fail(new AuthorizationFailureReason(this, result.DenialReason ?? "Permission denied."));
        }
    }
}
```

### Dynamic Policy Registration Helper

```csharp
// apps/api/src/Kernel.Application/Authorization/PermissionPolicyExtensions.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace Kernel.Application.Authorization;

/// <summary>
/// Extension to register a named permission policy.
/// Usage: services.AddPermissionPolicy("Roles.Read", "ROLES:READ");
/// </summary>
public static class PermissionPolicyExtensions
{
    public static IServiceCollection AddPermissionPolicy(
        this AuthorizationOptions options,
        string policyName,
        string permissionCode)
    {
        options.AddPolicy(policyName, policy =>
            policy.AddRequirements(new PermissionRequirement(permissionCode)));
        return null!; // Fluent pattern on AuthorizationOptions directly
    }
}
```

---

## 7. Backend — Controller Reference Pattern

```csharp
// apps/api/src/Kernel.API/Controllers/RolesController.cs
using Kernel.Application.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kernel.API.Controllers;

/// <summary>
/// REFERENCE PATTERN CONTROLLER — study this before writing any controller.
/// 
/// Rules enforced here:
/// 1. [Authorize(Policy="...")] on every action — no exceptions
/// 2. CancellationToken on every async action
/// 3. ApiEnvelope<T> response wrapper (from contracts)
/// 4. No business logic — orchestrate Application layer only
/// 5. ProblemDetails on error — never raw exception strings
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public sealed class RolesController : ControllerBase
{
    private readonly ILogger<RolesController> _logger;

    public RolesController(ILogger<RolesController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// List all roles in the current tenant.
    /// Requires ROLES:READ permission evaluated via IPermissionEvaluator.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "Roles.Read")]
    [ProducesResponseType(typeof(ApiEnvelope<IEnumerable<RoleSummaryDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ListRolesAsync(CancellationToken cancellationToken)
    {
        // TODO: Wire to Application layer query handler (MediatR or direct service)
        // This stub returns empty collection — replace with real query.
        _logger.LogInformation("ListRoles requested. CorrelationId={CorrelationId}", HttpContext.TraceIdentifier);

        var result = ApiEnvelope<IEnumerable<RoleSummaryDto>>.Ok(
            Enumerable.Empty<RoleSummaryDto>(),
            HttpContext.TraceIdentifier);

        return Ok(result);
    }
}

// ── Response Envelope (temporary inline — will move to contracts package) ──

public sealed record ApiEnvelope<T>
{
    public required T Data { get; init; }
    public required bool Success { get; init; }
    public string? CorrelationId { get; init; }

    public static ApiEnvelope<T> Ok(T data, string? correlationId = null) =>
        new() { Data = data, Success = true, CorrelationId = correlationId };
}

// Stub DTO — replace with type from contracts package
public sealed record RoleSummaryDto(string Id, string Name, string Status);
```

---

## 8. Frontend — App Bootstrap

### `apps/web/package.json`

```json
{
  "name": "@claas2saas/web",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@azure/msal-browser": "^3.0.0",
    "@azure/msal-react": "^2.0.0",
    "@claas2saas/contracts": "workspace:*",
    "@fluentui/react-components": "^9.0.0",
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@claas2saas/eslint-config": "workspace:*",
    "@claas2saas/tsconfig": "workspace:*",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### `vite.config.ts`

```typescript
// apps/web/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://localhost:7001",
        changeOrigin: true,
        secure: false, // Dev only — self-signed cert
      },
    },
  },
  build: {
    target: "es2020",
    sourcemap: true,
  },
});
```

### `tsconfig.json`

```json
{
  "extends": "@claas2saas/tsconfig/web.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### `src/main.tsx`

```tsx
// apps/web/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";

// No global style imports. No CSS files. Griffel only.

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### `src/app/App.tsx`

```tsx
// apps/web/src/app/App.tsx
// PLATFORM FILE — FROZEN
// Entry point. Composes providers. Must not contain feature logic.

import { AppProviders } from "./AppProviders";
import { AppRouter } from "./AppRouter";

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
```

### `src/app/AppProviders.tsx`

```tsx
// apps/web/src/app/AppProviders.tsx
// PLATFORM FILE — FROZEN
// Provider composition root. Order matters. Do not reorder without ARB approval.

import type { PropsWithChildren } from "react";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { QueryClientProvider } from "@tanstack/react-query";
import { MsalAuthProvider } from "@/auth/MsalAuthProvider";
import { PermissionProvider } from "@/rbac/PermissionProvider";
import { queryClient } from "@/api/queryClient";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    // 1. Fluent + Griffel — styling infrastructure
    <FluentProvider theme={webLightTheme}>
      {/* 2. MSAL — authentication */}
      <MsalAuthProvider>
        {/* 3. React Query — server state */}
        <QueryClientProvider client={queryClient}>
          {/* 4. RBAC permissions — loaded after auth */}
          <PermissionProvider>
            {children}
          </PermissionProvider>
        </QueryClientProvider>
      </MsalAuthProvider>
    </FluentProvider>
  );
}
```

### `src/app/AppRouter.tsx`

```tsx
// apps/web/src/app/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AuthGuard } from "@/auth/AuthGuard";
import { PermissionGuard } from "@/rbac/PermissionGuard";
import { ROUTE_MAP } from "@/rbac/RoutePermissionMap";

// Lazy-loaded feature pages
import { lazy, Suspense } from "react";
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login — placeholder</div>} />
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <PermissionGuard routeKey="DASHBOARD">
                <Suspense fallback={null}>
                  <DashboardPage />
                </Suspense>
              </PermissionGuard>
            }
          />
          {/* Feature routes added here following ROUTE_MAP pattern */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 9. Frontend — MSAL Auth Wiring

> 🔒 FROZEN — MsalAuthProvider is platform-owned. Feature components never import from @azure/msal-react directly.

### `src/auth/msalConfig.ts`

```typescript
// apps/web/src/auth/msalConfig.ts
// PLATFORM FILE — FROZEN

import type { Configuration } from "@azure/msal-browser";

const tenantId = import.meta.env.VITE_AAD_TENANT_ID ?? "common";
const clientId = import.meta.env.VITE_AAD_CLIENT_ID ?? "local-dev-placeholder";
const apiScope = import.meta.env.VITE_API_SCOPE ?? "api://local-dev-placeholder/user_impersonation";

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "sessionStorage", // sessionStorage: more secure than localStorage
    storeAuthStateInCookie: false,
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      logLevel: import.meta.env.DEV ? 2 : 0, // Warning in prod, Debug in dev
      piiLoggingEnabled: false,
    },
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", apiScope],
};

export const tokenRequest = {
  scopes: [apiScope],
};
```

### `src/auth/MsalAuthProvider.tsx`

```tsx
// apps/web/src/auth/MsalAuthProvider.tsx
// PLATFORM FILE — FROZEN
// MSAL PKCE wrapper. Silent-first acquisition. Handles redirect flow.

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider, useIsAuthenticated, useMsal } from "@azure/msal-react";
import { msalConfig } from "./msalConfig";

// Singleton — created once at module load
export const msalInstance = new PublicClientApplication(msalConfig);

// Set active account on login success
msalInstance.addEventCallback((event) => {
  if (
    event.eventType === EventType.LOGIN_SUCCESS &&
    event.payload &&
    "account" in event.payload &&
    event.payload.account
  ) {
    msalInstance.setActiveAccount(event.payload.account);
  }
});

export function MsalAuthProvider({ children }: PropsWithChildren) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
```

### `src/auth/useAuth.ts`

```typescript
// apps/web/src/auth/useAuth.ts
// PLATFORM FILE — FROZEN
// The ONLY hook for auth state. Feature components import from here, never from msal-react.

import { useCallback } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { tokenRequest } from "./msalConfig";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  tenantId: string | null;
  displayName: string | null;
  getAccessToken: () => Promise<string | null>;
  logout: () => void;
}

export function useAuth(): AuthState {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const activeAccount = instance.getActiveAccount() ?? accounts[0] ?? null;

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!activeAccount) return null;

    try {
      // Silent-first acquisition
      const response = await instance.acquireTokenSilent({
        ...tokenRequest,
        account: activeAccount,
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Fallback to redirect — silent token expired or consent required
        await instance.acquireTokenRedirect(tokenRequest);
        return null;
      }
      throw error;
    }
  }, [instance, activeAccount]);

  const logout = useCallback(() => {
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    });
  }, [instance]);

  return {
    isAuthenticated,
    isLoading: inProgress !== "none",
    userId: activeAccount?.idTokenClaims?.oid as string ?? null,
    tenantId: activeAccount?.idTokenClaims?.tid as string ?? null,
    displayName: activeAccount?.name ?? null,
    getAccessToken,
    logout,
  };
}
```

### `src/auth/AuthGuard.tsx`

```tsx
// apps/web/src/auth/AuthGuard.tsx
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "./msalConfig";

export function AuthGuard({ children }: PropsWithChildren) {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();

  if (inProgress === InteractionStatus.None && !isAuthenticated) {
    // Trigger PKCE redirect login
    instance.loginRedirect(loginRequest).catch(console.error);
    return null;
  }

  if (inProgress !== InteractionStatus.None) {
    return null; // Auth in progress — render nothing
  }

  return <>{children}</>;
}
```

### `src/auth/index.ts`

```typescript
// apps/web/src/auth/index.ts
export { MsalAuthProvider } from "./MsalAuthProvider";
export { AuthGuard } from "./AuthGuard";
export { useAuth } from "./useAuth";
export type { AuthState } from "./useAuth";
```

---

## 10. Frontend — Permission Provider

> 🔒 FROZEN — PermissionProvider is platform-owned infrastructure.

```tsx
// apps/web/src/rbac/PermissionContext.tsx
// PLATFORM FILE — FROZEN

import { createContext, useContext, useState, useEffect, type PropsWithChildren } from "react";
import { useAuth } from "@/auth/useAuth";

export interface PermissionContextValue {
  permissions: ReadonlySet<string>;
  isLoading: boolean;
  isError: boolean;
  reload: () => void;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function usePermissionContext(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermissionContext must be used within PermissionProvider");
  return ctx;
}

export function PermissionProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, getAccessToken, userId, tenantId } = useAuth();
  const [permissions, setPermissions] = useState<ReadonlySet<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !userId || !tenantId) {
      setPermissions(new Set());
      return;
    }

    let cancelled = false;

    async function loadPermissions() {
      setIsLoading(true);
      setIsError(false);

      try {
        const token = await getAccessToken();
        if (!token || cancelled) return;

        // TODO: Replace with actual permissions snapshot API call
        // GET /api/v1/permissions/snapshot → string[]
        // For now, load stub snapshot
        const stub: string[] = ["ADMIN:GLOBAL"]; // Remove when real API exists

        if (!cancelled) {
          setPermissions(new Set(stub));
        }
      } catch {
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPermissions();
    return () => { cancelled = true; };
  }, [isAuthenticated, userId, tenantId, reloadKey, getAccessToken]);

  const reload = () => setReloadKey((k) => k + 1);

  return (
    <PermissionContext.Provider value={{ permissions, isLoading, isError, reload }}>
      {children}
    </PermissionContext.Provider>
  );
}
```

```typescript
// apps/web/src/rbac/usePermission.ts
// PLATFORM FILE — FROZEN

import { usePermissionContext } from "./PermissionContext";

/// Returns true if the current user's permission snapshot contains the given code.
/// This is UX gating only. API enforces the real check.
export function usePermission(code: string): boolean {
  const { permissions } = usePermissionContext();
  return permissions.has(code);
}
```

```tsx
// apps/web/src/rbac/PermissionGuard.tsx
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { usePermissionContext } from "./PermissionContext";
import { ROUTE_MAP } from "./RoutePermissionMap";
import type { RouteKey } from "./RoutePermissionMap";

interface Props extends PropsWithChildren {
  routeKey: RouteKey;
}

export function PermissionGuard({ routeKey, children }: Props) {
  const { permissions, isLoading } = usePermissionContext();
  const route = ROUTE_MAP[routeKey];

  if (isLoading) return null;

  if (!route.requiredPermission || permissions.has(route.requiredPermission)) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
}
```

---

## 11. Frontend — Navigation Shell

> 🔒 FROZEN — AppLayout and NavRail are platform-owned. Feature slices may not modify.

```tsx
// apps/web/src/app/AppLayout.tsx
// PLATFORM FILE — FROZEN

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { NavRail } from "@/navigation/NavRail";

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  content: {
    flex: 1,
    overflow: "auto",
    padding: tokens.spacingHorizontalXXL,
  },
});

export function AppLayout() {
  const styles = useStyles();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  return (
    <div className={styles.root}>
      <NavRail
        collapsed={isNavCollapsed}
        onToggleCollapse={() => setIsNavCollapsed((c) => !c)}
      />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
```

```tsx
// apps/web/src/navigation/NavRail.tsx
// PLATFORM FILE — FROZEN
// Navigation is derived from ROUTE_MAP. Feature slices never control nav directly.

import { makeStyles, tokens, Tooltip, Button } from "@fluentui/react-components";
import {
  NavigationRegular,
  GridRegular,
  PeopleTeamRegular,
  ShieldTaskRegular,
  DataTrendingRegular,
} from "@fluentui/react-icons";
import { NavLink, useLocation } from "react-router-dom";
import { usePermission } from "@/rbac/usePermission";
import { ROUTE_MAP } from "@/rbac/RoutePermissionMap";

interface NavRailProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const useStyles = makeStyles({
  rail: {
    display: "flex",
    flexDirection: "column",
    width: "240px",
    minWidth: "240px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: tokens.spacingVerticalS,
    transition: "width 0.2s ease, min-width 0.2s ease",
  },
  railCollapsed: {
    width: "56px",
    minWidth: "56px",
  },
  toggleButton: {
    marginBottom: tokens.spacingVerticalM,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
    textDecoration: "none",
    fontSize: tokens.fontSizeBase300,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
    },
  },
  navItemActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  label: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    opacity: "1",
    transition: "opacity 0.1s",
  },
  labelHidden: {
    opacity: "0",
    width: "0",
  },
});

// Nav items derived from ROUTE_MAP — platform team owns this mapping
const NAV_ITEMS = [
  { key: "DASHBOARD" as const, icon: <GridRegular />, label: "Dashboard", path: "/dashboard" },
  { key: "ROLES" as const, icon: <ShieldTaskRegular />, label: "Roles", path: "/roles" },
  { key: "USERS" as const, icon: <PeopleTeamRegular />, label: "Users", path: "/users" },
  { key: "AUDIT" as const, icon: <DataTrendingRegular />, label: "Audit Log", path: "/audit" },
] as const;

function NavItem({
  item,
  collapsed,
  styles,
}: {
  item: (typeof NAV_ITEMS)[number];
  collapsed: boolean;
  styles: ReturnType<typeof useStyles>;
}) {
  const location = useLocation();
  const route = ROUTE_MAP[item.key];
  const hasPermission = usePermission(route.requiredPermission ?? "");
  const isPublic = !route.requiredPermission;
  const isActive = location.pathname.startsWith(item.path);

  if (!isPublic && !hasPermission) return null;

  const navContent = (
    <NavLink
      to={item.path}
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
    >
      {item.icon}
      <span className={`${styles.label} ${collapsed ? styles.labelHidden : ""}`}>
        {item.label}
      </span>
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip content={item.label} relationship="label" positioning="after">
        {navContent}
      </Tooltip>
    );
  }

  return navContent;
}

export function NavRail({ collapsed, onToggleCollapse }: NavRailProps) {
  const styles = useStyles();

  return (
    <nav className={`${styles.rail} ${collapsed ? styles.railCollapsed : ""}`}>
      <Button
        className={styles.toggleButton}
        appearance="subtle"
        icon={<NavigationRegular />}
        onClick={onToggleCollapse}
        aria-label="Toggle navigation"
      />
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.key} item={item} collapsed={collapsed} styles={styles} />
      ))}
    </nav>
  );
}
```

---

## 12. Frontend — RoutePermissionMap

> 🔒 FROZEN interface. Routes are additive only. No route may be added to AppRouter without a ROUTE_MAP entry.

```typescript
// apps/web/src/rbac/RoutePermissionMap.ts
// PLATFORM FILE — FROZEN STRUCTURE

// RouteMapEntry type — aligns with /packages/contracts/routes
export interface RouteMapEntry {
  readonly path: string;
  readonly requiredPermission: string | null;
  readonly navLabel: string;
  readonly breadcrumbLabel: string;
}

export const ROUTE_MAP = {
  DASHBOARD: {
    path: "/dashboard",
    requiredPermission: null, // Accessible to all authenticated users
    navLabel: "Dashboard",
    breadcrumbLabel: "Dashboard",
  },
  ROLES: {
    path: "/roles",
    requiredPermission: "ROLES:READ",
    navLabel: "Roles",
    breadcrumbLabel: "Role Management",
  },
  ROLES_CREATE: {
    path: "/roles/create",
    requiredPermission: "ROLES:WRITE",
    navLabel: "Create Role",
    breadcrumbLabel: "Create Role",
  },
  USERS: {
    path: "/users",
    requiredPermission: "USERS:READ",
    navLabel: "Users",
    breadcrumbLabel: "User Management",
  },
  AUDIT: {
    path: "/audit",
    requiredPermission: "AUDIT:READ",
    navLabel: "Audit Log",
    breadcrumbLabel: "Audit Log",
  },
} as const satisfies Record<string, RouteMapEntry>;

export type RouteKey = keyof typeof ROUTE_MAP;
```

---

## 13. Frontend — Griffel Baseline

> 🔒 FROZEN — This establishes the styling system. No CSS Modules, no styled-components, no Tailwind, no hardcoded colors.

```typescript
// apps/web/src/styles/tokens.ts
// PLATFORM FILE — FROZEN
// Extend Fluent tokens only here. Never hardcode colors or spacing.

import { tokens } from "@fluentui/react-components";

// Re-export Fluent tokens as the canonical token source
// Custom extensions go here only — nowhere else
export { tokens };

// Semantic token aliases for CLaaS2SaaS surface
export const kernelTokens = {
  // Status colors derived from Fluent semantic tokens
  statusSuccess: tokens.colorStatusSuccessForeground1,
  statusWarning: tokens.colorStatusWarningForeground1,
  statusError: tokens.colorStatusDangerForeground1,
  statusInfo: tokens.colorBrandForeground1,

  // Surface
  pagePadding: tokens.spacingHorizontalXXL,
  cardPadding: tokens.spacingHorizontalL,
  sectionGap: tokens.spacingVerticalXL,
} as const;
```

```typescript
// apps/web/src/styles/theme.ts
// PLATFORM FILE — FROZEN
// FluentProvider theme config. Only webLightTheme and webDarkTheme allowed.

export { webLightTheme, webDarkTheme } from "@fluentui/react-components";
```

### Example Griffel Component

```tsx
// apps/web/src/shared/components/StatusBadge/StatusBadge.tsx
// Reference pattern for Griffel component authoring

import { makeStyles, tokens, Badge } from "@fluentui/react-components";
import type { BadgeProps } from "@fluentui/react-components";

// ✅ Correct: Griffel makeStyles — no hardcoded values
const useStyles = makeStyles({
  base: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
});

type StatusBadgeProps = {
  status: "active" | "inactive" | "pending";
};

const STATUS_MAP: Record<StatusBadgeProps["status"], BadgeProps["color"]> = {
  active: "success",
  inactive: "danger",
  pending: "warning",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = useStyles();
  return (
    <Badge
      className={styles.base}
      color={STATUS_MAP[status]}
      shape="rounded"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
```

---

## 14. Contracts Package Scaffold

> 🔒 AUTHORITATIVE. TypeScript is the source of truth. C# mirrors derive from these definitions.

### Directory Structure

```
packages/contracts/
├── src/
│   ├── auth/
│   │   └── index.ts
│   ├── rbac/
│   │   └── index.ts
│   ├── tenant/
│   │   └── index.ts
│   ├── api/
│   │   └── index.ts
│   ├── audit/
│   │   └── index.ts
│   ├── routes/
│   │   └── index.ts
│   ├── shared/
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### `packages/contracts/package.json`

```json
{
  "name": "@claas2saas/contracts",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./auth": "./dist/auth/index.js",
    "./rbac": "./dist/rbac/index.js",
    "./tenant": "./dist/tenant/index.js",
    "./api": "./dist/api/index.js",
    "./audit": "./dist/audit/index.js",
    "./routes": "./dist/routes/index.js",
    "./shared": "./dist/shared/index.js"
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@claas2saas/tsconfig": "workspace:*",
    "typescript": "^5.3.0"
  }
}
```

### `packages/contracts/README.md`

```markdown
# @claas2saas/contracts

## ARCHITECTURAL AUTHORITY

This package is the **single source of truth** for all cross-layer types.

| Attribute | Value |
|-----------|-------|
| Owned By | Platform Architecture Team |
| Mutation Policy | Additive only — no breaking changes without ARB + major version bump |
| TS Authority | TypeScript is authoritative. C# mirrors derive from TS definitions. |
| Build Failure | Contract drift between TS and C# is a CI build failure |

## ⚠️ Rules for all consumers

- Import from package root or named sub-paths only: `@claas2saas/contracts` or `@claas2saas/contracts/rbac`
- **NEVER** deep-import internal files: `@claas2saas/contracts/rbac/internal/...`
- **NEVER** redefine or locally duplicate a contracts type
- **NEVER** remove or rename an exported symbol without ARB approval

## Namespace Responsibilities

| Folder | Responsibility |
|--------|---------------|
| `/auth` | AuthUser, session shapes, token payloads |
| `/rbac` | PermissionCode union — canonical catalog |
| `/tenant` | TenantContext, TenantId branded type |
| `/api` | ApiEnvelope, ProblemDetails, pagination primitives |
| `/audit` | AuditEvent, actor metadata, severity enum |
| `/routes` | RouteMapEntry, RouteKey, ROUTE_MAP contract |
| `/shared` | Branded ID types, ISO dates, utility generics |
```

### `packages/contracts/src/rbac/index.ts`

```typescript
// packages/contracts/src/rbac/index.ts
// AUTHORITATIVE — Permission code registry.
// Adding a code requires an ARB-reviewed contracts PR.

/**
 * Canonical permission code union.
 * String literals only. Format: DOMAIN:ACTION
 * All codes are uppercase. No spaces. Colon separator.
 */
export type PermissionCode =
  | "ADMIN:GLOBAL"
  | "ROLES:READ"
  | "ROLES:WRITE"
  | "ROLES:DELETE"
  | "USERS:READ"
  | "USERS:WRITE"
  | "USERS:ASSIGN_ROLE"
  | "MODULES:READ"
  | "MODULES:WRITE"
  | "AUDIT:READ"
  | "ACCESS_REQUESTS:READ"
  | "ACCESS_REQUESTS:APPROVE"
  | "ACCESS_REQUESTS:REJECT";

/**
 * Readonly catalog of all permission codes.
 * Iterate for admin UIs, test fixtures, and validation.
 */
export const PERMISSION_CODES = [
  "ADMIN:GLOBAL",
  "ROLES:READ",
  "ROLES:WRITE",
  "ROLES:DELETE",
  "USERS:READ",
  "USERS:WRITE",
  "USERS:ASSIGN_ROLE",
  "MODULES:READ",
  "MODULES:WRITE",
  "AUDIT:READ",
  "ACCESS_REQUESTS:READ",
  "ACCESS_REQUESTS:APPROVE",
  "ACCESS_REQUESTS:REJECT",
] as const satisfies readonly PermissionCode[];

export function isPermissionCode(value: string): value is PermissionCode {
  return (PERMISSION_CODES as readonly string[]).includes(value);
}
```

### `packages/contracts/src/api/index.ts`

```typescript
// packages/contracts/src/api/index.ts
// API response envelope and error shapes

export interface ApiEnvelope<T> {
  readonly data: T;
  readonly success: boolean;
  readonly correlationId?: string;
}

export interface ApiError {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly correlationId?: string;
  readonly errors?: Record<string, string[]>;
}

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface ListQuery {
  readonly pageNumber?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly sortBy?: string;
  readonly sortDescending?: boolean;
}
```

### `packages/contracts/src/auth/index.ts`

```typescript
// packages/contracts/src/auth/index.ts

export interface AuthUser {
  readonly userId: string;      // oid claim
  readonly tenantId: string;    // tid claim
  readonly displayName?: string;
  readonly email?: string;
}

export interface AuthSession {
  readonly user: AuthUser;
  readonly accessToken: string;
  readonly expiresAt: number; // Unix timestamp
}

export type AuthError =
  | { code: "UNAUTHENTICATED"; message: string }
  | { code: "TOKEN_EXPIRED"; message: string }
  | { code: "INTERACTION_REQUIRED"; message: string };
```

### `packages/contracts/src/tenant/index.ts`

```typescript
// packages/contracts/src/tenant/index.ts

// Branded type — prevents accidental string assignment
export type TenantId = string & { readonly __brand: "TenantId" };

export function asTenantId(value: string): TenantId {
  if (!value || value.trim().length === 0) {
    throw new Error("TenantId cannot be empty.");
  }
  return value as TenantId;
}

export interface TenantContext {
  readonly tenantId: TenantId;
  readonly displayName?: string;
  readonly resolvedAt: string; // ISO 8601
}
```

### `packages/contracts/src/routes/index.ts`

```typescript
// packages/contracts/src/routes/index.ts

import type { PermissionCode } from "../rbac";

export interface RouteMapEntry {
  readonly path: string;
  readonly requiredPermission: PermissionCode | null;
  readonly navLabel: string;
  readonly breadcrumbLabel: string;
}

// RouteKey is the union of keys in apps/web ROUTE_MAP — kept in sync via CI
export type RouteKey =
  | "DASHBOARD"
  | "ROLES"
  | "ROLES_CREATE"
  | "USERS"
  | "AUDIT"
  | "ACCESS_REQUESTS"
  | "MODULES";
```

### `packages/contracts/src/audit/index.ts`

```typescript
// packages/contracts/src/audit/index.ts

export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AuditActor {
  readonly userId: string;
  readonly tenantId: string;
  readonly displayName?: string;
}

export interface AuditEvent {
  readonly eventId: string;       // UUID
  readonly correlationId: string;
  readonly actor: AuditActor;
  readonly eventType: string;     // e.g. "ROLE.ASSIGNED"
  readonly resourceType: string;
  readonly resourceId: string;
  readonly severity: AuditSeverity;
  readonly permissionsVersion: string; // UUID of permission snapshot
  readonly occurredAt: string;    // ISO 8601
  readonly metadata?: Record<string, string>;
}
```

### `packages/contracts/src/shared/index.ts`

```typescript
// packages/contracts/src/shared/index.ts

// Branded ID types
export type UserId = string & { readonly __brand: "UserId" };
export type RoleId = string & { readonly __brand: "RoleId" };
export type ModuleId = string & { readonly __brand: "ModuleId" };

// ISO 8601 UTC timestamp
export type IsoDateTime = string & { readonly __brand: "IsoDateTime" };

export function asIsoDateTime(value: string): IsoDateTime {
  if (isNaN(Date.parse(value))) throw new Error(`Invalid ISO datetime: ${value}`);
  return value as IsoDateTime;
}

// Generic nullable type
export type Nullable<T> = T | null;
```

### `packages/contracts/src/index.ts`

```typescript
// packages/contracts/src/index.ts
// Root barrel — re-exports all namespaces

export * from "./auth";
export * from "./rbac";
export * from "./tenant";
export * from "./api";
export * from "./audit";
export * from "./routes";
export * from "./shared";
```

---

## 15. Build & Run Verification

### Step 1 — Prerequisites

```bash
# Verify toolchain
dotnet --version    # Must be 8.0.x
node --version      # Must be ≥ 20.x
pnpm --version      # Must be 9.x

# Install pnpm if needed
npm install -g pnpm@9
```

### Step 2 — Backend Setup

```bash
# Configure user secrets (one-time per developer)
cd apps/api/src/Kernel.API
dotnet user-secrets set "AzureAd:TenantId" "your-entra-tenant-id"
dotnet user-secrets set "AzureAd:ClientId" "your-app-registration-client-id"

# Build entire solution
cd ../../../../   # repo root
dotnet build Kernel.sln

# Expected: Build succeeded. 0 Error(s).

# Run API
dotnet run --project apps/api/src/Kernel.API

# Verify health endpoint
curl http://localhost:5000/health
# Expected: Healthy

# Verify Swagger (dev only)
# Open: http://localhost:5000/swagger
```

### Step 3 — Frontend Setup

```bash
# Install all workspace packages
pnpm install

# Build contracts package first (required by web)
pnpm --filter @claas2saas/contracts build

# Start frontend dev server
pnpm --filter @claas2saas/web dev

# Expected: http://localhost:5173 — MSAL login redirect triggers
```

### Step 4 — Full Monorepo Build

```bash
# Build everything via Turborepo
pnpm turbo run build

# Expected output:
# Tasks:   4 successful, 4 total
# Cached:  0 cached, 4 total (first run)
```

### Verification Checklist

| Check | Command | Expected |
|-------|---------|----------|
| Backend compiles | `dotnet build Kernel.sln` | 0 errors |
| Health endpoint | `GET /health` | 200 OK |
| Swagger loads | `GET /swagger` (dev) | Swagger UI |
| Unauthenticated API | `GET /api/v1/roles` (no token) | 401 |
| Authenticated no permission | `GET /api/v1/roles` (valid JWT, no ROLES:READ) | 403 |
| Frontend loads | `http://localhost:5173` | MSAL redirect |
| Auth completes | Post-MSAL callback | NavRail visible |
| Permission check | Dashboard loads | No 403 |
| Nav collapse | Toggle button | Icon-only mode |

---

## 16. AI Safety Rules — Platform Immutability

> ### ⛔ MANDATORY READING FOR ALL AI AGENTS
>
> This section is enforced law. Violations must be raised immediately and rejected at PR review.

---

### Platform-Owned Files (Immutable Without ARB Approval)

| File | Location | Owner |
|------|----------|-------|
| `Program.cs` | `apps/api/src/Kernel.API/` | Platform |
| `TenantMiddleware.cs` | `apps/api/src/Kernel.API/Middleware/` | Platform |
| `IPermissionEvaluator.cs` | `apps/api/src/Kernel.Application/Authorization/` | Platform |
| `PermissionRequirementHandler.cs` | `apps/api/src/Kernel.Application/Authorization/` | Platform |
| `ApplicationServiceExtensions.cs` | `apps/api/src/Kernel.Application/` | Platform |
| `App.tsx` | `apps/web/src/app/` | Platform |
| `AppProviders.tsx` | `apps/web/src/app/` | Platform |
| `AppLayout.tsx` | `apps/web/src/app/` | Platform |
| `MsalAuthProvider.tsx` | `apps/web/src/auth/` | Platform |
| `useAuth.ts` | `apps/web/src/auth/` | Platform |
| `PermissionContext.tsx` | `apps/web/src/rbac/` | Platform |
| `PermissionProvider` (in context) | `apps/web/src/rbac/` | Platform |
| `RoutePermissionMap.ts` | `apps/web/src/rbac/` | Platform |
| `NavRail.tsx` | `apps/web/src/navigation/` | Platform |
| All of `/packages/contracts/` | `packages/contracts/` | Platform Arch |

---

### Rules for AI Feature Agents

**1. Auth is frozen.** Feature components call `useAuth()`. They never import from `@azure/msal-react` directly. They never call `msalInstance` directly.

**2. RBAC is UX-only.** Feature components call `usePermission("PERMISSION:CODE")` to hide/show UI. The API enforces the real check. A hidden button is not a security control.

**3. No new permission codes without contracts PR.** Permission codes live in `/packages/contracts/src/rbac/index.ts`. New codes require a contracts PR with ARB review. Do not create local permission strings.

**4. Navigation is derived, not controlled.** Feature slices add an entry to `ROUTE_MAP`. They do not modify `NavRail.tsx`, `AppLayout.tsx`, or `AppRouter.tsx` directly.

**5. Contracts are additive.** No existing exported type, interface, or const may be removed or renamed without ARB approval and a major version bump. Add new symbols. Never delete.

**6. Middleware order is non-negotiable.** `UseAuthentication` → `TenantMiddleware` → `UseAuthorization`. No middleware may be inserted before `UseAuthentication`. No middleware may be inserted between `UseAuthentication` and `TenantMiddleware` or between `TenantMiddleware` and `UseAuthorization` without ARB sign-off.

**7. All API endpoints require explicit policy.** Any controller action without `[Authorize(Policy="...")]` is a Severity-1 security defect. The fallback policy requires authentication, but permission enforcement requires explicit declaration.

**8. IPermissionEvaluator is the only RBAC path.** No controller may check `User.IsInRole(...)`, inspect JWT claims for authorization decisions, or use `[Authorize(Roles="...")]`. Every authorization decision goes through the evaluator.

**9. Feature code is blast-radius contained.** Feature slices live in `apps/web/src/features/{feature-name}/`. They may import from `shared/`, `rbac/`, `auth/`, `api/`, and `@claas2saas/contracts`. They may not import from other feature slices.

**10. TypeScript strict is non-negotiable.** `strict: true` in all tsconfig files. `any` requires explicit `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a justification comment. `TreatWarningsAsErrors` is enabled on all C# projects.

---

### What Feature Agents ARE Permitted to Do

- Add new feature slices under `apps/web/src/features/{name}/`
- Add new controllers in `apps/api/src/Kernel.API/Controllers/`
- Add new Application layer query/command handlers
- Add new entries to `ROUTE_MAP` (additive only)
- Add new permission codes to contracts (via contracts PR)
- Add new DTO types to contracts (via contracts PR)
- Add new Infrastructure implementations (e.g., repository classes)
- Add React Query hooks in feature slice `api/` folders
- Add Griffel-styled components in `shared/components/`

---

*CLaaS2SaaS Security Kernel — Frozen Platform Bootstrap v1.0*  
*February 2026 | Status: APPROVED AND FROZEN*
