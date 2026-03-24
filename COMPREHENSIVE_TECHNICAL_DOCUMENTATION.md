# CLaaS2SaaS Enterprise Control Center (ECC) — Comprehensive Technical Documentation

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Audience:** Full-stack developers, architects, AI systems (RAG/Semantic Kernel)  
**Status:** Active Architecture Reference

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Repository Structure](#repository-structure)
4. [Backend Architecture (ECC Services)](#backend-architecture-ecc-services)
5. [Database Design](#database-design)
6. [Frontend Architecture](#frontend-architecture)
7. [Core Functionalities](#core-functionalities)
8. [Authentication & Authorization](#authentication--authorization)
9. [API Reference](#api-reference)
10. [Tech Stack & Tools](#tech-stack--tools)
11. [Execution Flow](#execution-flow)
12. [Design Patterns & Best Practices](#design-patterns--best-practices)
13. [Environment & Configuration](#environment--configuration)
14. [How to Run the Project](#how-to-run-the-project)
15. [Testing Strategy](#testing-strategy)
16. [Deployment & DevOps](#deployment--devops)

---

## Project Overview

### What is ECC?

**CLaaS2SaaS Enterprise Control Center (ECC)** is a **multi-tenant, role-based access control (RBAC) authority service** built for Fortune 500 enterprise environments. It acts as a centralized security kernel that:

- **Resolves user identities** via Microsoft Entra ID (Azure AD)
- **Manages role assignments** across solutions and modules
- **Evaluates permissions** for every protected operation
- **Maintains comprehensive audit logs** of all security decisions
- **Provides a unified UI** for security administrators and compliance officers

### Problem Solved

Enterprise systems face critical challenges:

1. **Fragmented Access Control** — Multiple systems with inconsistent RBAC models
2. **Compliance Risk** — No centralized audit trail for permission evaluations
3. **Admin Overhead** — Inconsistent user provisioning across solutions
4. **Trust Boundary Issues** — Weak permission enforcement in distributed systems

ECC solves this by **centralizing identity resolution, permission evaluation, and audit** under a single, testable, measurable authority service.

### System Type

- **Backend:** RESTful authority service (ASP.NET Core 8)
- **Frontend:** React admin dashboard for role/module/user management
- **Authentication:** Microsoft Entra ID (production) / Mock JWT (local development)
- **Deployment:** Docker Compose (local), Azure App Service + Dataverse (production roadmap)

### Core Features

| Feature | Purpose |
|---------|---------|
| **User Identity Resolution** | Authenticates users via Entra ID, builds security profile |
| **Permission Evaluation** | Evaluates if a user has permission for an action in a module |
| **Role Management** | CRUD operations on roles, role-module assignments |
| **Permission Matrix** | Defines role-to-permission mappings (Create/Read/Update/Delete flags) |
| **User-Role Assignment** | Assigns roles to users per module with assignment history |
| **Audit Logging** | Tracks all permission evaluations, role changes, and administrative actions |
| **Module Registry** | Maintains inventory of solutions (AIW, ACC, Helpdesk) and their modules |
| **Access Requests** | Self-service workflow for users to request role assignments |

---

## High-Level Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER CLIENT (React 18)                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ AppLayout │ TopBar │ NavRail │ Feature Pages                │   │
│  │ - MSAL/Mock Auth  - PermissionGuard  - usePermission()       │   │
│  │ - React Router    - Session Storage  - Axios + React Query   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               ↓ HTTP (Bearer JWT)
┌─────────────────────────────────────────────────────────────────────┐
│                    ASP.NET CORE 8 API LAYER                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ JwtBearerMiddleware │ TenantMiddleware │ ExceptionMiddleware │   │
│  │ Authorization Pipeline  [Authorize(Policy="...")] handlers   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Controllers: Identity | RBAC | Registry | Audit              │   │
│  │ ├─ GET  /api/identity/profile                                │   │
│  │ ├─ POST /api/rbac/assign-role                                │   │
│  │ ├─ GET  /api/registry/modules                                │   │
│  │ └─ GET  /api/audit/logs                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               ↓ Service Calls
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (Services)                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ IdentityService    - Resolve user profiles, list users       │   │
│  │ RbacService        - Assign/revoke roles, evaluate permission│   │
│  │ RegistryService    - Manage modules, list solutions          │   │
│  │ AuditService       - Query audit logs, emit audit events     │   │
│  │ IPermissionEvaluator (core RBAC logic)                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               ↓ Data Access
┌─────────────────────────────────────────────────────────────────────┐
│                    DOMAIN & INFRASTRUCTURE LAYERS                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Domain Entities:                                              │   │
│  │ - SecurityUser, SolutionModule, SecurityRolePermission       │   │
│  │ - SecurityUserRole, AuditSession, AuditActionLog             │   │
│  │                                                               │   │
│  │ Infrastructure:                                              │   │
│  │ - EccDbContext (EF Core)                                     │   │
│  │ - Repository Pattern (6 repositories)                        │   │
│  │ - IPermissionCache (InMemory / Redis - future)              │   │
│  │ - IEventDispatcher (async audit pipeline)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               ↓ Persistence
┌─────────────────────────────────────────────────────────────────────┐
│                         SQL SERVER 2022                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ SecurityDB_Security_User (Users & auth state)                │   │
│  │ SecurityDB_Solution_Module (Module registry)                 │   │
│  │ SecurityDB_Security_Role_Permission (Permission matrix)      │   │
│  │ SecurityDB_Security_User_Role (Role assignments)             │   │
│  │ SecurityDB_Audit_Session (Session tracking)                  │   │
│  │ SecurityDB_Audit_Action_Log (Permission evaluation history)  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Style: Clean Architecture (Onion)

ECC follows **Clean Architecture** with strict **inbound dependency flow**:

```
                ┌─────────────────┐
                │   API Layer     │  ← HTTP concerns, controllers
                │  (ECC.API)      │
                └────────┬────────┘
                         │
        ┌────────────────▼────────────────┐
        │  Application Layer              │  ← Business logic, services,
        │  (ECC.Application)              │    orchestration
        │                                 │
        │  • IdentityService              │
        │  • RbacService                  │
        │  • RegistryService              │
        │  • AuditService                 │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  Domain Layer                   │  ← Business rules, entities,
        │  (ECC.Domain)                   │    interfaces, exceptions
        │                                 │
        │  • Entities (SecurityUser, etc.)│
        │  • Enums (ErrorCodes, etc.)     │
        │  • Interfaces (repositories)    │
        │  • Domain Events                │
        │  • Exceptions                   │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  Infrastructure Layer           │  ← Implementations of
        │  (ECC.Infrastructure)           │    interfaces, DB, external
        │                                 │    services
        │  • EF Core DbContext            │
        │  • Repository Implementations  │
        │  • Event Dispatcher             │
        │  • Permission Cache             │
        └─────────────────────────────────┘

**Inbound Dependency Rule:**
- API → Application → Domain ← Infrastructure
- Outer layers depend on inner layers, never the reverse
- No cross-layer service calls (e.g., Controller never calls Repository)
- All dependencies point inward toward the Domain
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Single Monolith** | Simpler deployment, shared DB context, easier testing than microservices |
| **Repository Pattern** | Abstracts data access, allows easy swapping (SQL→Dataverse). Everything is interface-based. |
| **Policy-Based Authorization** | Named policies like `[Authorize(Policy="ROLE:CREATE")]` centralize permission logic |
| **Async Audit Pipeline** | Audit failures never propagate as API errors; async Channel<T> prevents blocking |
| **IPermissionCache Interface** | MVP = InMemory, MMP = Redis swap. Zero code changes needed for migration. |
| **Fluent UI v9 + Griffel** | Enterprise design system, accessibility by default, Griffel provides deterministic CSS |
| **React Router v6** | Industry standard for client-side routing, lazy-loading support via React.lazy |
| **TenantMiddleware** | Tenant resolution happens once per request, enforced before business logic |

---

## Repository Structure

### Root Layout

```
CLaaS2Saas-Enterprise-Control-Center/
├── ECC.sln                                    # Root solution (entry point)
├── README.md                                  # Project overview
├── SETUP.md                                   # Setup instructions
├── ARCHITECTURE.md                            # Architecture summary
├── COMPREHENSIVE_TECHNICAL_DOCUMENTATION.md  # This file
│
├── apps/                                      # Frontend & frontend-related
│   ├── api/                                   # Legacy (unused, marked for removal)
│   ├── frontend/                              # React SPA (NEW - active)
│   │   ├── src/                               # Source code
│   │   ├── public/                            # Static assets
│   │   ├── package.json                       # Dependencies
│   │   ├── tsconfig.json                      # TypeScript config
│   │   ├── vite.config.ts                     # Vite bundler config
│   │   └── index.html                         # Entry HTML
│   └── web/                                   # Legacy (deleted after migration)
│
├── services/                                  # Backend services
│   └── api/                                   # ECC Authority Service
│       ├── ECC.sln                            # Backend solution file
│       └── src/
│           ├── ECC.API/                       # HTTP layer
│           │   ├── Controllers/               # API endpoints
│           │   ├── Middleware/                # Http middleware
│           │   └── Program.cs                 # Service configuration
│           ├── ECC.Application/               # Business logic
│           │   ├── Services/                  # Domain services
│           │   ├── Interfaces/                # Service contracts
│           │   ├── DTOs/                      # Data transfer objects
│           │   └── Extensions/                # Service registration
│           ├── ECC.Domain/                    # Core domain
│           │   ├── Entities/                  # Domain entities
│           │   ├── Interfaces/                # Repository contracts
│           │   ├── Enums/                     # Error codes, constants
│           │   ├── Events/                    # Domain events
│           │   └── Exceptions/                # Custom exceptions
│           └── ECC.Infrastructure/            # Implementations
│               ├── Persistence/               # EF Core DbContext
│               ├── Repositories/              # Repository implementations
│               ├── Services/                  # Infrastructure services
│               ├── Configurations/            # EF Core entity configs
│               └── Extensions/                # DI registration
│
├── tests/                                     # Test suites
│   ├── unit/
│   │   └── ECC.Application.Tests/             # Application layer tests
│   │       ├── Services/                      # Service tests
│   │       └── Services/Mocks/                # Mock fixtures
│   └── integration/                           # Integration tests (future)
│
├── infrastructure/                            # DevOps, DB scripts
│   ├── database/
│   │   ├── migrations/                        # SQL migration scripts
│   │   │   └── V001_InitialSchema.sql         # Initial schema creation
│   │   └── seed/                              # Seed data scripts
│   │       └── V001_SeedData.sql              # Initial data population
│   └── docker/
│       └── docker-compose.yml                 # Local dev environment
│
├── packages/                                  # Shared packages
│   └── contracts/                             # Shared DTOs (frontend-backend)
│       ├── index.ts                           # Package entry
│       └── identity.ts                        # Identity contracts
│
├── docs/                                      # Documentation
│   ├── architecture-tree.md                   # Frontend routing tree
│   └── page-map.md                            # Page component mapping
│
└── governance/                                # Compliance & standards
    ├── PLATFORM_FREEZE.md                     # Platform governance
    ├── RBAC_REQUIREMENT_SOLUTION_DESIGN.md    # RBAC design spec
    ├── CLaaS2SaaS_Master_Architecture.md      # Master architecture
    ├── CLaaS2SaaS_Coding_Constitution.md      # Coding standards
    ├── CLaaS2SaaS_Frozen_Skeleton.md          # Project skeleton
    ├── frontend-standards.md                  # Frontend guidelines
    ├── integration-playbook.md                # Integration guide
    └── more...                                # Additional docs
```

### Why This Structure

| Folder | Purpose | Connection |
|--------|---------|-----------|
| **apps/frontend** | React SPA for administrators | Communicates with services/api via REST |
| **services/api** | ECC authority service microservice | Implements clean architecture layers |
| **tests/unit** | Isolated business logic testing | Tests ECC.Application services |
| **infrastructure** | Database schemas, Docker setup | Deploys backend, initializes DB |
| **packages/contracts** | Shared types between frontend and backend | Reduces code duplication, shared TS types |
| **docs** | Architecture & routing references | Helps developers understand system |
| **governance** | Compliance, standards, design decisions | Ensures platform consistency |

---

## Backend Architecture (ECC Services)

### Layer Breakdown

#### 1. ECC.Domain Layer

**Purpose:** Business rules and contracts. The heart of the system.

**Contents:**

```
ECC.Domain/
├── Entities/
│   ├── SecurityUser.cs              # User identity record
│   ├── SolutionModule.cs            # Module registry
│   ├── SecurityRolePermission.cs    # Role definition
│   ├── SecurityUserRole.cs          # Role assignment
│   ├── AuditSession.cs              # Session tracking
│   └── AuditActionLog.cs            # Permission eval history
├── Interfaces/
│   ├── ISecurityUserRepository.cs
│   ├── ISecurityUserRoleRepository.cs
│   ├── ISolutionModuleRepository.cs
│   ├── ISecurityRolePermissionRepository.cs
│   ├── IAuditSessionRepository.cs
│   ├── IAuditActionLogRepository.cs
│   └── /* More repository contracts */
├── Enums/
│   └── ErrorCodes.cs                # Standardized error codes
├── Events/
│   ├── UserResolvedEvent.cs         # Fired when user profile resolved
│   ├── RoleAssignedEvent.cs         # Fired when role assigned
│   └── RoleRevokedEvent.cs          # Fired when role revoked
├── Exceptions/
│   ├── AppException.cs              # Base domain exception
│   └── /* Specific domain exceptions */
└── /* Value objects, aggregate roots - future */
```

**Key Entities:**

- **SecurityUser:** Maps Entra Object ID to internal user record
  ```csharp
  public class SecurityUser {
      public Guid UserId { get; set; }
      public string EntraObjectId { get; set; }  // Link to Entra ID
      public string DisplayName { get; set; }
      public string Email { get; set; }
      public bool IsActive { get; set; }
      public DateTimeOffset? LastLoginDate { get; set; }
      public ICollection<SecurityUserRole> UserRoles { get; set; }
  }
  ```

- **SolutionModule:** Defines solutions and modules
  ```csharp
  public class SolutionModule {
      public Guid SolutionModuleId { get; set; }
      public string SolutionCode { get; set; }    // "AIW", "ACC", "Helpdesk"
      public string ModuleCode { get; set; }      // "ECC", "Report", etc.
      public string ModuleName { get; set; }
      public string Description { get; set; }
      public bool IsActive { get; set; }
      public ICollection<SecurityUserRole> UserRoles { get; set; }
  }
  ```

- **SecurityRolePermission:** Maps role to action permissions
  ```csharp
  public class SecurityRolePermission {
      public Guid SecRoleId { get; set; }
      public Guid SolutionModuleId { get; set; }
      public string RoleCode { get; set; }        // "VIEWER", "ADMIN", etc.
      public string RoleName { get; set; }
      public bool CanCreate { get; set; }
      public bool CanRead { get; set; }
      public bool CanUpdate { get; set; }
      public bool CanDelete { get; set; }
      public bool FullAccessAllModules { get; set; }
      public SolutionModule SolutionModule { get; set; }
  }
  ```

- **SecurityUserRole:** Links users to roles in specific modules
  ```csharp
  public class SecurityUserRole {
      public Guid UserRoleId { get; set; }
      public Guid UserId { get; set; }
      public Guid SolutionModuleId { get; set; }
      public Guid SecRoleId { get; set; }
      public Guid AssignedByUserId { get; set; }
      public DateTimeOffset AssignedDate { get; set; }
      public DateTimeOffset? DisabledDate { get; set; }
      public bool IsActive { get; set; }
      // Navigation properties
      public SecurityUser User { get; set; }
      public SolutionModule SolutionModule { get; set; }
      public SecurityRolePermission RolePermission { get; set; }
  }
  ```

**Interfaces:** All data access abstracted via repository interfaces. Implementation lives in Infrastructure layer.

---

#### 2. ECC.Application Layer

**Purpose:** Business logic, orchestration, and application workflows.

**Contents:**

```
ECC.Application/
├── Services/
│   ├── IdentityService.cs           # User profile resolution
│   ├── RbacService.cs               # Role assignment, permission eval
│   ├── RegistryService.cs           # Module management
│   ├── AuditService.cs              # Audit log queries
│   └── /* More services */
├── Interfaces/
│   ├── IIdentityService.cs
│   ├── IRbacService.cs
│   ├── IRegistryService.cs
│   ├── IAuditService.cs
│   └── /* Service contracts */
├── DTOs/
│   ├── Common/
│   │   ├── ApiResponse.cs           # Standardized API response wrapper
│   │   ├── PagedResult.cs           # Pagination wrapper
│   │   └── ErrorDetails.cs          # Error response schema
│   ├── Identity/
│   │   ├── UserSecurityProfileDto.cs
│   │   ├── UserListItemDto.cs
│   │   └── /* Identity DTOs */
│   ├── Rbac/
│   │   ├── AssignRoleRequest.cs
│   │   ├── RevokeRoleRequest.cs
│   │   └── /* RBAC DTOs */
│   └── /* More DTO categories */
├── Extensions/
│   └── ServiceRegistration.cs       # Dependency injection setup
└── /* Application-level cross-cutting */
```

**Key Services:**

**IdentityService** - Resolves user security profiles
```csharp
public interface IIdentityService {
    Task<UserSecurityProfileDto> ResolveUserProfileAsync(string entraObjectId);
    Task<PagedResult<UserListItemDto>> GetUsersAsync(int page, int pageSize);
    Task<UserSecurityProfileDto> GetUserByIdAsync(Guid userId);
}

// Implementation:
public class IdentityService : IIdentityService {
    public async Task<UserSecurityProfileDto> ResolveUserProfileAsync(string entraObjectId) {
        // 1. Look up user in SecurityDB by Entra Object ID
        var user = await _userRepository.GetByEntraObjectIdAsync(entraObjectId);
        if (user is null) throw new AppException(...);
        
        // 2. Load active role assignments
        var roles = await _userRoleRepository.GetActiveByUserIdAsync(user.UserId);
        
        // 3. Build authorized modules list
        var authorizedModules = roles.Select(r => new AuthorizedModuleDto(...));
        
        // 4. Emit UserResolvedEvent for audit
        await _eventDispatcher.Dispatch(new UserResolvedEvent(user.UserId));
        
        // 5. Return profile DTO
        return new UserSecurityProfileDto { UserId = user.UserId, ... };
    }
}
```

**RbacService** - Manages roles and permission evaluation
```csharp
public interface IRbacService {
    Task AssignRoleAsync(Guid userId, Guid moduleId, Guid roleId, Guid assignedBy);
    Task RevokeRoleAsync(Guid userRoleId);
    Task<EvaluationResult> EvaluatePermissionAsync(
        Guid userId, Guid moduleId, string permissionCode);
}

// Key method: EvaluatePermissionAsync
// 1. Fetch cached permission context (IPermissionCache)
// 2. Check if user has permission code for module
// 3. Emit audit event
// 4. Return EvaluationResult(isGranted, reason, permissionsVersion)
```

**RegistryService** - Manages modules and solutions
```csharp
public interface IRegistryService {
    Task<List<SolutionModuleDto>> GetModulesAsync(string? solutionCode = null);
    Task<SolutionModuleDto> CreateModuleAsync(CreateModuleRequest request);
    Task UpdateModuleAsync(Guid moduleId, UpdateModuleRequest request);
}
```

**AuditService** - Queries and exports audit logs
```csharp
public interface IAuditService {
    Task<PagedResult<AuditActionLogDto>> GetAuditLogsAsync(
        Guid? userId, Guid? moduleId, DateTimeOffset? from, 
        DateTimeOffset? to, int page, int pageSize);
}
```

---

#### 3. ECC.API Layer

**Purpose:** HTTP request/response handling, controller orchestration, middleware.

**Contents:**

```
ECC.API/
├── Controllers/
│   ├── IdentityController.cs        # User identity endpoints
│   ├── RbacController.cs            # Role & permission endpoints
│   ├── RegistryController.cs        # Module management endpoints
│   ├── AuditController.cs           # Audit log endpoints
│   └── HealthController.cs          # Health check endpoint
├── Middleware/
│   ├── ExceptionMiddleware.cs       # Standardized error handling
│   ├── TenantMiddleware.cs          # Tenant resolution (future)
│   └── /* More middleware */
├── Program.cs                       # Service configuration & startup
└── Properties/
    └── launchSettings.json          # Local run settings
```

**Sample Controller:**

```csharp
[ApiController]
[Route("api/identity")]
[Authorize]  // All routes require JWT authentication
public sealed class IdentityController : ControllerBase {
    private readonly IIdentityService _identityService;

    [HttpGet("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserSecurityProfileDto>>> GetProfile() {
        // Extract Entra Object ID from JWT "oid" claim
        var entraObjectId = User.FindFirst("oid")!.Value;
        
        // Resolve profile
        var profile = await _identityService.ResolveUserProfileAsync(entraObjectId);
        
        // Return wrapped response
        return Ok(ApiResponse<UserSecurityProfileDto>.Ok(profile));
    }

    [HttpGet("users")]
    [Authorize(Policy = "ADMIN:READ")]  // Policy-based authorization
    public async Task<ActionResult<ApiResponse<PagedResult<UserListItemDto>>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20) {
        var result = await _identityService.GetUsersAsync(page, pageSize);
        return Ok(ApiResponse<PagedResult<UserListItemDto>>.Ok(result));
    }
}
```

**ExceptionMiddleware** - Standardizes error responses:

```csharp
public sealed class ExceptionMiddleware {
    public async Task InvokeAsync(HttpContext context) {
        try {
            await _next(context);
        } catch (AppException ex) {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(
                ErrorDetails.FromException(ex)
            );
        } catch (Exception ex) {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(
                new { message = "Internal server error" }
            );
        }
    }
}
```

**Program.cs** - Service wiring:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Authentication: Microsoft Entra ID
builder.Services.AddMicrosoftIdentityWebApiAuthentication(
    builder.Configuration, "AzureAd");

// Register services from all layers
builder.Services.AddEccApplicationServices();
builder.Services.AddEccInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => {
    options.AddPolicy("EccFrontend", policy => {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("EccFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

---

#### 4. ECC.Infrastructure Layer

**Purpose:** Concrete implementations of interfaces, database access, external service integrations.

**Contents:**

```
ECC.Infrastructure/
├── Persistence/
│   ├── EccDbContext.cs              # EF Core DbContext
│   └── Configurations/              # Entity type mappings
│       ├── SecurityUserConfiguration.cs
│       ├── SolutionModuleConfiguration.cs
│       ├── SecurityRolePermissionConfiguration.cs
│       ├── SecurityUserRoleConfiguration.cs
│       ├── AuditSessionConfiguration.cs
│       └── AuditActionLogConfiguration.cs
├── Repositories/
│   ├── SecurityUserRepository.cs
│   ├── SolutionModuleRepository.cs
│   ├── SecurityRolePermissionRepository.cs
│   ├── SecurityUserRoleRepository.cs
│   ├── AuditSessionRepository.cs
│   └── AuditActionLogRepository.cs
├── Services/
│   ├── EventDispatcher.cs           # Domain event dispatch
│   ├── PermissionCacheService.cs    # In-memory cache (MVP)
│   └── /* Infrastructure services */
└── Extensions/
    └── ServiceRegistration.cs       # DI setup for infrastructure
```

**EccDbContext** - EF Core mapping:

```csharp
public class EccDbContext : DbContext {
    public DbSet<SecurityUser> SecurityUsers => Set<SecurityUser>();
    public DbSet<SolutionModule> SolutionModules => Set<SolutionModule>();
    public DbSet<SecurityRolePermission> SecurityRolePermissions => 
        Set<SecurityRolePermission>();
    public DbSet<SecurityUserRole> SecurityUserRoles => Set<SecurityUserRole>();
    public DbSet<AuditSession> AuditSessions => Set<AuditSession>();
    public DbSet<AuditActionLog> AuditActionLogs => Set<AuditActionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        // Apply all entity configurations (fluent API)
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(EccDbContext).Assembly);
    }
}
```

**Repository Pattern Example:**

```csharp
public sealed class SecurityUserRepository : ISecurityUserRepository {
    private readonly EccDbContext _context;

    public async Task<SecurityUser?> GetByEntraObjectIdAsync(
        string entraObjectId) {
        return await _context.SecurityUsers
            .FirstOrDefaultAsync(u => u.EntraObjectId == entraObjectId);
    }

    public async Task<List<SecurityUser>> GetAllAsync() {
        return await _context.SecurityUsers
            .Where(u => u.IsActive)
            .OrderBy(u => u.DisplayName)
            .ToListAsync();
    }

    public async Task AddAsync(SecurityUser user) {
        _context.SecurityUsers.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(SecurityUser user) {
        _context.SecurityUsers.Update(user);
        await _context.SaveChangesAsync();
    }
}
```

**EventDispatcher** - Async event handling:

```csharp
public sealed class EventDispatcher : IEventDispatcher {
    private readonly ILogger<EventDispatcher> _logger;

    public void Dispatch(IDomainEvent @event) {
        // Fire and forget - events don't block API responses
        _logger.LogInformation(
            "Domain event published: {EventType}", @event.GetType().Name);
        // Future: publish to message queue (Service Bus, Kafka)
    }
}
```

---

### Backend Testing Strategy

**Test Location:** `tests/unit/ECC.Application.Tests/`

**Framework:** xUnit + Moq

**Test Structure:**

```csharp
public class IdentityServiceTests {
    [Fact]
    public async Task ResolveUserProfile_ValidUser_ReturnsProfile() {
        // Arrange: Create mocks
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<IdentityService>>();

        // Setup: Define mock behavior
        var user = new SecurityUser { 
            UserId = Guid.NewGuid(),
            EntraObjectId = "oid-123",
            IsActive = true
        };
        userRepository.Setup(x => x.GetByEntraObjectIdAsync("oid-123"))
            .ReturnsAsync(user);

        // Act: Call service
        var sut = new IdentityService(
            userRepository.Object, userRoleRepository.Object, 
            eventDispatcher.Object, logger.Object);
        var result = await sut.ResolveUserProfileAsync("oid-123");

        // Assert: Verify behavior
        Assert.Equal(user.UserId, result.UserId);
        eventDispatcher.Verify(
            d => d.Dispatch(It.IsAny<UserResolvedEvent>()), Times.Once);
    }

    [Fact]
    public async Task ResolveUserProfile_UserNotFound_ThrowsException() {
        // Arrange
        var userRepository = new Mock<ISecurityUserRepository>();
        userRepository.Setup(x => x.GetByEntraObjectIdAsync("missing"))
            .ReturnsAsync((SecurityUser?)null);

        // Act & Assert
        var sut = new IdentityService(...);
        var ex = await Assert.ThrowsAsync<AppException>(
            () => sut.ResolveUserProfileAsync("missing"));
        Assert.Equal(ErrorCodes.IdentityNotFound, ex.ErrorCode);
    }
}
```

**Current Test Coverage:** 8/8 tests passing
- IdentityService: 5 tests (valid user, not found, deactivated, empty input, no event on fail)
- RbacService: 3 tests (valid assignment, insufficient authority, duplicate)

---

## Database Design

### Schema Overview

```sql
┌─────────────────────────────────────┐
│ SecurityDB_Security_User            │
├─────────────────────────────────────┤
│ user_id (PK, GUID)                  │
│ entra_object_id (UNIQUE)            │
│ display_name                        │
│ email                               │
│ is_active                           │
│ last_login_date                     │
│ created_at, created_by, updated_*   │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ SecurityDB_Security_User_Role       │
├─────────────────────────────────────┤
│ user_role_id (PK)                   │
│ user_id (FK) ────────────────┐      │
│ solution_module_id (FK) ┐    │      │
│ sec_role_id (FK) ┐      │    │      │
│ assigned_date          │    │      │
│ is_active              │    │      │
└──────────────┬─────────────────────┘
               ↓ ↓ ↓
    ┌──────────────────────────────────────┐
    ├─────────────┬──────────────┬─────────┤
    │             │              │         │
    ↓             ↓              ↓         ↓
┌──────────────────────────────────────┐
│ SecurityDB_Solution_Module (PK)      │
├──────────────────────────────────────┤
│ solution_module_id                   │
│ solution_code, solution_name         │
│ module_code, module_name             │
│ is_active, documentation_url         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ SecurityDB_Security_Role_Permission  │
├──────────────────────────────────────┤
│ sec_role_id (PK)                     │
│ solution_module_id (FK)              │
│ role_code, role_name                 │
│ can_create, can_read, can_update     │
│ can_delete, full_access_all_modules  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ SecurityDB_Audit_Session             │
├──────────────────────────────────────┤
│ audit_session_id (PK)                │
│ user_id (FK)                         │
│ session_start_time                   │
│ is_success, reason                   │
│ ip_address, device_info              │
└──────────────────────────────────────┘
          ↓
┌──────────────────────────────────────┐
│ SecurityDB_Audit_Action_Log          │
├──────────────────────────────────────┤
│ audit_action_id (PK)                 │
│ audit_session_id (FK)                │
│ user_id                              │
│ action_name, permission_code         │
│ action_status, action_timestamp      │
└──────────────────────────────────────┘
```

### Tables Explained

| Table | Purpose | Key Columns |
|-------|---------|------------|
| **SecurityDB_Security_User** | User identity records | userId (PK), entraObjectId (Entra link), isActive, lastLoginDate |
| **SecurityDB_Solution_Module** | Module registry | solutionModuleId (PK), solutionCode, moduleName, isActive |
| **SecurityDB_Security_Role_Permission** | Role definitions and permissions | secRoleId (PK), roleCode, can_create/read/update/delete flags |
| **SecurityDB_Security_User_Role** | Role assignments to users per module | userRoleId (PK), userId (FK), moduleId (FK), roleId (FK), assignedDate, isActive |
| **SecurityDB_Audit_Session** | User session tracking | auditSessionId (PK), userId (FK), sessionStartTime, isSuccess |
| **SecurityDB_Audit_Action_Log** | Permission evaluation audit trail | auditActionId (PK), sessionId (FK), actionName, permissionCode, actionStatus, timestamp |

### Key Constraints

```sql
-- Unique constraints
UNIQUE INDEX UX_SecurityUser_EntraObjectId ON SecurityDB_Security_User(entra_object_id);
UNIQUE INDEX UX_SolutionModule_Code ON SecurityDB_Solution_Module(solution_code, module_code);
UNIQUE INDEX UX_RolePermission_CodeModule ON SecurityDB_Security_Role_Permission(role_code, solution_module_id);
UNIQUE INDEX UX_UserRole_Active ON SecurityDB_Security_User_Role(user_id, solution_module_id, sec_role_id) WHERE is_active = 1;
  -- Ensures a user can't have duplicate active roles in same module

-- Foreign keys enforce referential integrity
CONSTRAINT FK_UserRole_User FOREIGN KEY (user_id) REFERENCES SecurityDB_Security_User(user_id);
CONSTRAINT FK_UserRole_SolutionModule FOREIGN KEY (solution_module_id) REFERENCES SecurityDB_Solution_Module(solution_module_id);
```

---

## Frontend Architecture

### Frontend Technology Stack

- **Framework:** React 18.2
- **Language:** TypeScript 5 (strict mode)
- **Bundler:** Vite 5
- **Styling:** Fluent UI v9 with Griffel CSS-in-JS
- **Routing:** React Router v6
- **State Management:** React Query (server state) + Context API (UI state)
- **Authentication:** MSAL.js (Entra ID) / Mock JWT (demo mode)
- **HTTP Client:** Axios
- **Icons:** Fluent UI Icons v2
- **Validation:** Zod

### Folder Structure

```
apps/frontend/
├── src/
│   ├── index.tsx                    # Entry point
│   ├── App.tsx                      # Root component
│   ├── app/
│   │   ├── main.tsx                 # App bootstrap
│   │   ├── AppRouter.tsx            # Route definitions (frozen)
│   │   ├── AppLayout.tsx            # Main shell layout
│   │   ├── AppProviders.tsx         # Provider composition (frozen)
│   │   ├── TopBar.tsx               # Header component
│   │   └── PageSkeleton.tsx         # Loading fallback
│   ├── auth/
│   │   ├── AuthContext.ts           # Auth state
│   │   ├── AuthGuard.tsx            # Protected route wrapper
│   │   ├── DemoAuthProvider.tsx     # Demo auth (no Entra)
│   │   └── MsalAuthProvider.tsx     # MSAL provider
│   ├── rbac/
│   │   ├── PermissionContext.ts     # Permission state
│   │   ├── PermissionGuard.tsx      # Permission-based guard
│   │   ├── RoutePermissionMap.ts    # Route-to-permission mapping (frozen)
│   │   ├── usePermission.ts         # Permission hook
│   │   └── /* Permission utilities */
│   ├── features/
│   │   ├── auth/
│   │   │   └── pages/SignInPage.tsx
│   │   ├── scc/
│   │   │   └── SccRootLandingPage.tsx
│   │   ├── scc-dashboard/
│   │   │   └── SccDashboardPage.tsx
│   │   ├── role-management/
│   │   │   ├── RoleManagementPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCreateSecurityRole.ts
│   │   │   └── components/
│   │   │       ├── AddSecurityRoleModal.tsx
│   │   │       └── ManagePermissionsModal.tsx
│   │   ├── audit/
│   │   │   └── AuditLogViewerPage.tsx
│   │   ├── module-mgmt/
│   │   │   └── ModuleMgmtPage.tsx
│   │   ├── user-enrichment/
│   │   │   └── UserEnrichmentPage.tsx
│   │   ├── user-role-assign/
│   │   │   └── UserRoleAssignmentPage.tsx
│   │   └── /* More features */
│   ├── navigation/
│   │   ├── NavRail.tsx              # Sidebar navigation
│   │   └── Breadcrumbs.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance
│   │   │   ├── identity.ts          # Identity API calls
│   │   │   ├── rbac.ts              # RBAC API calls
│   │   │   └── /* More API services */
│   │   └── /* Business logic services */
│   ├── theme/
│   │   └── kernelTheme.ts           # Fluent theme customization
│   ├── types/
│   │   ├── identity.ts              # Identity types
│   │   ├── rbac.ts                  # RBAC types
│   │   └── /* Domain types */
│   ├── hooks/
│   │   ├── useIdentity.ts           # Identity hook
│   │   ├── usePermission.ts         # Permission hook
│   │   └── /* Custom hooks */
│   ├── utils/
│   │   ├── error-handler.ts         # Error formatting
│   │   └── /* Utility functions */
│   ├── constants/
│   │   ├── api.ts                   # API endpoints
│   │   └── /* Constants */
│   ├── styles/
│   │   └── globals.ts               # Global styles
│   └── vite-env.d.ts                # Vite environment types
├── public/
│   └── /* Static assets */
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── .env.development (local only)
```

### Provider Stack (Order Matters!)

```typescript
// AppProviders.tsx - FROZEN STRUCTURE
export function AppProviders({ children }: PropsWithChildren) {
  return (
    {/* Layer 1: Fluent Provider - Base styling */}
    <RendererProvider renderer={renderer} targetDocument={document}>
      <FluentProvider theme={kernelLightTheme}>
        
        {/* Layer 2: Authentication - Identity state */}
        {isDemoMode ? <DemoAuthProvider> : <MsalAuthProvider>}
          
          {/* Layer 3: React Query - Server state */}
          <QueryClientProvider client={queryClient}>
            
            {/* Layer 4: Permission Context - RBAC state */}
            <PermissionProvider>
              {children}
            </PermissionProvider>
            
          </QueryClientProvider>
        </MsalAuthProvider>
      </FluentProvider>
    </RendererProvider>
  );
}

// Order rationale:
// 1. Fluent must be outermost (provides theme/rendering)
// 2. Auth must come before permissions (permissions depend on identity)
// 3. React Query before permissions (permissions may fetch data)
// 4. Permissions innermost (every page component depends on this)
```

### Routing Structure

```typescript
// AppRouter.tsx - FROZEN STRUCTURE
// All routes must have ROUTE_MAP entry (no string literals)

<BrowserRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<SignInPage />} />
    <Route path="/forbidden" element={<ForbiddenPage />} />
    
    {/* Protected routes */}
    <Route element={<AuthGuard />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/kernel" />} />
        
        {/* SCC (Security Control Center) */}
        <Route path="/scc" element={<SccRootLandingPage />} />
        <Route path="/kernel" element={<SccDashboardPage />} />
        
        {/* Administration */}
        <Route 
          path="/modules" 
          element={<PermissionGuard permission="MODULE:READ"><ModuleMgmtPage /></PermissionGuard>} 
        />
        <Route 
          path="/roles" 
          element={<PermissionGuard permission="ROLE:READ"><RoleManagementPage /></PermissionGuard>} 
        />
        <Route 
          path="/assignments" 
          element={<PermissionGuard permission="ASSIGNMENT:READ"><UserRoleAssignmentPage /></PermissionGuard>} 
        />
        
        {/* Audit & User */}
        <Route path="/audit" element={<AuditLogViewerPage />} />
        <Route path="/users" element={<UserEnrichmentPage />} />
        <Route path="/access-requests" element={<AccessRequestPage />} />
      </Route>
    </Route>
    
    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/kernel" />} />
  </Routes>
</BrowserRouter>
```

### API Service Pattern

```typescript
// services/api/identity.ts
import { apiClient } from './client';
import type { UserSecurityProfileDto, UserListItemDto } from '@/types/identity';

export const identityApi = {
  // Get current user profile
  getProfile: () =>
    apiClient.get<ApiResponse<UserSecurityProfileDto>>('/identity/profile'),
  
  // List all users (paginated)
  listUsers: (page: number, pageSize: number) =>
    apiClient.get<ApiResponse<PagedResult<UserListItemDto>>>('/identity/users', {
      params: { page, pageSize }
    }),
  
  // Get user by ID
  getUserById: (userId: Guid) =>
    apiClient.get<ApiResponse<UserSecurityProfileDto>>(`/identity/users/${userId}`),
};

// usage in components:
const { data } = useQuery({
  queryKey: ['identity', 'profile'],
  queryFn: () => identityApi.getProfile(),
});
```

### Permission Hook Pattern

```typescript
// hooks/usePermission.ts
export function usePermission() {
  const { context } = useContext(PermissionContext);
  
  return {
    // Check if user has permission
    hasPermission: (permissionCode: string) => 
      context?.permissions.includes(permissionCode) ?? false,
    
    // Check if user can perform action in module
    canPerform: (module: string, action: 'create'|'read'|'update'|'delete') => 
      context?.modulePermissions[module]?.[action] ?? false,
    
    // Get authorized modules
    authorizedModules: context?.modules ?? [],
  };
}

// Usage in components:
function RoleManagementPage() {
  const { hasPermission, canPerform } = usePermission();
  
  if (!hasPermission('ROLE:READ')) {
    return <ForbiddenPage />;
  }
  
  return (
    <div>
      <h1>Roles</h1>
      {canPerform('ECC', 'create') && <button>Add Role</button>}
    </div>
  );
}
```

### Component Example: RoleManagementPage

```typescript
export function RoleManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission, canPerform } = usePermission();
  
  // Fetch roles via React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['rbac', 'roles', searchTerm],
    queryFn: () => rbacApi.getRoles({ searchTerm }),
  });

  const handleAddRole = async (roleData: CreateRoleRequest) => {
    try {
      await rbacApi.createRole(roleData);
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
    } catch (error) {
      showErrorToast(error);
    }
  };

  if (!hasPermission('ROLE:READ')) {
    return <ForbiddenPage />;
  }

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState onRetry={() => queryClient.refetchQueries()} />;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1>Security Role Management</h1>
        {canPerform('ECC', 'create') && (
          <Button onClick={() => setShowAddModal(true)}>
            Add Role
          </Button>
        )}
      </div>

      <SearchInput value={searchTerm} onChange={setSearchTerm} />

      {data?.items.length === 0 ? (
        <EmptyState message="No roles found" />
      ) : (
        <RoleTable roles={data?.items} />
      )}

      {showAddModal && (
        <AddSecurityRoleModal onSubmit={handleAddRole} />
      )}
    </div>
  );
}
```

---

## Core Functionalities

### 1. User Identity Resolution

**What:** Authenticates user via Entra ID and builds security profile.

**Flow:**
```
1. User visits app → redirected to Entra login (prod) or demo login (dev)
2. MSAL.js obtains access token via PKCE flow
3. Browser stores token in sessionStorage
4. API request includes Bearer token
5. Backend validates JWT signature, expiry, issuer
6. TenantMiddleware extracts tenant from JWT "tid" claim
7. IdentityService.ResolveUserProfileAsync() called:
   - Lookup user in SecurityDB by Entra Object ID (oid claim)
   - If not found → error (401)
   - Load active role assignments with permissions
   - Build AuthorizedModuleDto list
   - Emit UserResolvedEvent
8. Return UserSecurityProfileDto with userId, modules, roles
9. Frontend stores in PermissionContext
```

**Key Endpoint:**
```http
GET /api/identity/profile
Authorization: Bearer <JWT>

200 OK
{
  "data": {
    "userId": "user-guid",
    "displayName": "John Admin",
    "email": "john@company.com",
    "authorizedModules": [
      {
        "solutionModuleId": "mod-guid",
        "solutionCode": "AIW",
        "moduleCode": "ECC",
        "moduleName": "Enterprise Control Center",
        "roleCode": "ADMIN",
        "permissions": {
          "canCreate": true,
          "canRead": true,
          "canUpdate": true,
          "canDelete": true
        }
      }
    ]
  }
}
```

---

### 2. Permission Evaluation

**What:** Checks if a user has permission to perform an action.

**Flow:**
```
1. API endpoint decorated with [Authorize(Policy="ROLE:CREATE")]
2. Authorization pipeline checks policy
3. PermissionRequirementHandler.HandleRequirementAsync():
   - Extracts userId from JWT "oid" claim
   - Extracts moduleId from route or claims
   - Calls IPermissionEvaluator.EvaluateAsync()
4. EvaluateAsync() logic:
   - Check IPermissionCache.GetAsync(tenantId, userId, moduleId)
   - If MISS: Query repositories for active role assignments
   - Union permission codes (additive model)
   - Cache result with 5-minute TTL
   - Check permission code against context
   - Check ADMIN:GLOBAL bypass
5. Emit authorization metric event (telemetry)
6. Return EvaluationResult(isGranted, reason)
7. If isGranted: Continue to controller
   If denied: Return 403 Forbidden with ProblemDetails
8. Emit audit event to Channel<AuditEvent> (async)
```

**Policy-Based Examples:**
```csharp
// In controllers:
[Authorize(Policy = "ROLE:CREATE")]        // Can create roles
public async Task<IActionResult> CreateRole(...) { }

[Authorize(Policy = "ROLE:READ")]          // Can read roles
public async Task<IActionResult> ListRoles(...) { }

[Authorize(Policy = "ADMIN:GLOBAL")]       // Global admin bypass
public async Task<IActionResult> AdminOperation(...) { }
```

---

### 3. Role Assignment & Revocation

**What:** Assigns roles to users in specific modules or revokes them.

**Assignment Flow:**
```
1. UI: Admin clicks "Assign Role" for user
2. Modal collects: userId, moduleId, roleId, assignmentReason
3. POST /api/rbac/assign-role
4. RbacService.AssignRoleAsync():
   - Validate user has ASSIGNMENT:CREATE permission
   - Validate user exists
   - Validate role exists in module
   - Check for duplicate active assignment
   - Create SecurityUserRole record:
     - userRoleId = newGuid()
     - userId, moduleId, roleId params
     - assignedByUserId = current user
     - assignedDate = now
     - isActive = true
   - Emit RoleAssignedEvent
   - Invalidate permission cache for that user
5. Return success response
6. Frontend: Invalidate query cache, refresh role list
7. Audit pipeline: Record in AuditActionLog
```

**Revocation Flow:**
```
1. UI: Admin clicks "Revoke Role" for assignment
2. DELETE /api/rbac/revoke-role/{userRoleId}
3. RbacService.RevokeRoleAsync():
   - Validate permission
   - Load SecurityUserRole record
   - Set isActive = false (soft delete)
   - Set disabledDate = now
   - Emit RoleRevokedEvent
   - Invalidate permission cache for user
4. Audit record created
```

**Key Endpoint:**
```http
POST /api/rbac/assign-role
Content-Type: application/json
Authorization: Bearer <JWT>

{
  "userId": "user-guid",
  "solutionModuleId": "module-guid",
  "securityRoleId": "role-guid"
}

200 OK
{ "message": "Role assigned successfully" }
```

---

### 4. Audit Logging

**What:** Records all security decisions, role changes, and administrative actions.

**Audit Events:**
```
1. UserResolvedEvent → Logged when user authenticates
2. RoleAssignedEvent → Logged when role assigned to user
3. RoleRevokedEvent → Logged when role revoked
4. PermissionEvaluatedEvent → Logged on every permission check
5. PermissionDeniedEvent → Logged when permission denied
```

**Audit Flow:**
```
1. Service emits domain event via IEventDispatcher.Dispatch()
2. Event enqueued to Channel<AuditEvent>
3. BackgroundService processes channel asynchronously:
   - Create AuditSession if needed
   - Create AuditActionLog entry with:
     - auditSessionId
     - userId
     - actionName (e.g., "ROLE_ASSIGNED")
     - permissionCode
     - actionStatus (SUCCESS/FAILURE)
     - actionTimestamp
     - additionalInfo (JSON context)
4. Failures logged but NOT surfaced as API errors
5. Append to AuditActionLog table (immutable)
```

**Query Audit Logs:**
```http
GET /api/audit/logs?userId=xyz&moduleId=abc&from=2026-01-01&to=2026-03-24&page=1&pageSize=20

200 OK
{
  "data": {
    "items": [
      {
        "auditActionId": "audit-guid",
        "userName": "john@company.com",
        "actionName": "ROLE_ASSIGNED",
        "permissionCode": "ROLE:CREATE",
        "actionStatus": "SUCCESS",
        "actionTimestamp": "2026-03-24T10:30:00Z",
        "additionalInfo": { "roleCode": "ADMIN" }
      }
    ],
    "totalCount": 45,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 5. Module Registry Management

**What:** Maintains inventory of solutions and modules.

**Solutions:**
- AIW (Artificial Intelligence Workbench)
- ACC (Artificial Cloud Center)
- Helpdesk

**Modules per Solution:**
- ECC (Enterprise Control Center)
- Reports
- Analytics
- Governance
- etc.

**Module Registry Endpoint:**
```http
GET /api/registry/modules?solutionCode=AIW

200 OK
{
  "data": [
    {
      "solutionModuleId": "mod-guid",
      "solutionCode": "AIW",
      "solutionName": "Artificial Intelligence Workbench",
      "moduleCode": "ECC",
      "moduleName": "Enterprise Control Center",
      "description": "Central RBAC authority service",
      "moduleLead": "john@company.com",
      "is Active": true
    }
  ]
}
```

---

## Authentication & Authorization

### Authentication

**Production (Entra ID):**
```
1. User visits app → React detects no JWT
2. MSAL.js initiates redirect to Entra login endpoint
3. User authenticates with MFA (if required)
4. Entra redirects back with authorization code
5. MSAL exchanges code for access token (backend)
6. Token stored in sessionStorage (browser)
7. Token includes claims: oid (object ID), tid (tenant ID), etc.
```

**Local Development (Mock JWT):**
```
1. User visits app → Demo auth page renders
2. User selects persona (Global Admin, Security Admin, Help Desk, etc.)
3. Click "Sign In" → Backend POST /auth/mock-login with persona
4. Backend generates JWT signed with local HMAC key:
   {
     "oid": "demo-user-1",
     "tid": "tenant-1",
     "email": "admin@demo.local",
     "iat": 1234567890,
     "exp": 1234571490
   }
5. Frontend stores JWT in sessionStorage
6. Behaves identically to Entra tokens
```

**JWT Validation (Backend):**
```csharp
// Program.cs - JwtBearerOptions
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,           // Check issuer claim
            ValidateAudience = true,         // Check audience claim
            ValidateLifetime = true,         // Check expiry
            ValidateIssuerSigningKey = true, // Check signature
            ClockSkew = TimeSpan.FromMinutes(2), // Allow 2min drift
            // ... issuer, audience, signing key configuration
        };
    });
```

### Authorization

**Strategy:** Policy-Based Authorization

```csharp
// Define policies in Program.cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ROLE:CREATE", policy =>
        policy.Requirements.Add(new PermissionRequirement("ROLE:CREATE")));
    
    options.AddPolicy("ROLE:READ", policy =>
        policy.Requirements.Add(new PermissionRequirement("ROLE:READ")));
    
    options.AddPolicy("ADMIN:GLOBAL", policy =>
        policy.Requirements.Add(new PermissionRequirement("ADMIN:GLOBAL")));
});

// Implement handler
public class PermissionRequirementHandler : AuthorizationHandler<PermissionRequirement> {
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userId = context.User.FindFirst("oid")?.Value;
        var result = await _permissionEvaluator.EvaluateAsync(
            userId, currentModule, requirement.PermissionCode);
        
        if (result.IsGranted) {
            context.Succeed(requirement);
        }
    }
}

// Use on endpoints
[HttpPost("roles")]
[Authorize(Policy = "ROLE:CREATE")]
public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request) { }

[HttpGet("roles")]
[Authorize(Policy = "ROLE:READ")]
public async Task<IActionResult> ListRoles() { }
```

**Frontend Authorization:**

```typescript
// PermissionGuard component
export function PermissionGuard({ 
  permission, 
  children 
}: { permission: string; children: ReactNode }) {
  const { hasPermission } = usePermission();
  
  if (!hasPermission(permission)) {
    return <ForbiddenPage />;
  }
  
  return children;
}

// Usage
<Route 
  path="/roles" 
  element={
    <PermissionGuard permission="ROLE:READ">
      <RoleManagementPage />
    </PermissionGuard>
  } 
/>
```

---

## API Reference

### Base Information

- **Base URL:** `http://localhost:5000` (dev) | `https://ecc-api.company.com` (prod)
- **Authentication:** Bearer JWT in Authorization header
- **Content-Type:** `application/json`
- **Response Format:** `{ data: T, errors: string[], status: int }`

### Identity Endpoints

```
GET  /api/identity/profile              - Get current user profile
GET  /api/identity/users                - List users (paginated)
GET  /api/identity/users/{id:guid}      - Get user by ID
POST /api/identity/create-user          - Create new user (admin only)
```

### RBAC Endpoints

```
GET  /api/rbac/roles                    - List roles
GET  /api/rbac/roles/{id:guid}          - Get role by ID
POST /api/rbac/roles                    - Create role
PUT  /api/rbac/roles/{id:guid}          - Update role
POST /api/rbac/assign-role              - Assign role to user
POST /api/rbac/revoke-role/{id:guid}    - Revoke role from user
POST /api/rbac/evaluate                 - Evaluate permission
```

### Registry Endpoints

```
GET  /api/registry/modules              - List modules
GET  /api/registry/modules/{id:guid}    - Get module by ID
POST /api/registry/modules              - Create module
PUT  /api/registry/modules/{id:guid}    - Update module
```

### Audit Endpoints

```
GET  /api/audit/logs                    - Query audit logs
GET  /api/audit/sessions                - List audit sessions
GET  /api/audit/logs/{id:guid}          - Get audit entry by ID
```

---

## Tech Stack & Tools

### Backend Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | ASP.NET Core | 8.0 | Web API framework |
| **Language** | C# | 12 | Backend language |
| **Database** | SQL Server | 2022 | Relational data store |
| **ORM** | Entity Framework Core | 7+ | Data access layer |
| **Authentication** | Microsoft.Identity.Web | Latest | Entra ID integration |
| **Logging** | Serilog | Latest | Structured logging |
| **Testing** | xUnit, Moq | Latest | Unit testing framework |
| **Validation** | FluentValidation | Latest | Input validation |

### Frontend Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 18.2 | UI framework |
| **Language** | TypeScript | 5.3 | Frontend language |
| **Bundler** | Vite | 5.0 | Build tool |
| **Routing** | React Router | 6.20 | Client-side routing |
| **State** | React Query | 5.0 | Server state management |
| **Styling** | Fluent UI + Griffel | 9.46 / Latest | Enterprise UI components |
| **HTTP** | Axios | 1.6 | HTTP client |
| **Auth** | MSAL.js | 4.22 | Entra ID authentication |
| **Icons** | Fluent UI Icons | 2.0 | Icon library |
| **Validation** | Zod | 3.22 | TypeScript validation |

### DevOps & Tools

| Category | Tools | Purpose |
|----------|-------|---------|
| **Containerization** | Docker, Docker Compose | Local dev environment, image building |
| **CI/CD** | GitHub Actions | Automated testing, build-on-push |
| **Secrets** | Azure Key Vault, dotnet user-secrets | Credential management |
| **Monitoring** | Azure App Insights | Production observability |
| **Database** | SQL Server Management Studio | DB administration |
| **IDE** | Visual Studio 2022, VS Code | Development |

### Why These Choices

| Technology | Why |
|-----------|-----|
| **ASP.NET Core 8** | Enterprise-grade, high performance, mature ecosystem |
| **Entity Framework Core** | Type-safe LINQ queries, migrations, Dataverse compatibility (future) |
| **SQL Server** | Enterprise standard, scaling, security, familiar to Fortune 500s |
| **React 18** | Modern reactive UI, component composition, large ecosystem |
| **TypeScript** | Type safety for frontend, catches errors at compile-time |
| **Vite** | Fast bundling, HMR, optimized builds |
| **Fluent UI** | Microsoft design system, accessibility, consistent with Windows/M365 |
| **Entra ID** | Enterprise identity standard, SSO, MFA, Conditional Access |
| **React Query** | Eliminates global state, automatic caching, background refetch |

---

## Execution Flow

### Complete Request-Response Cycle

**Scenario:** Admin browses roles and creates a new role.

```
┌─────────────────────────────── USER BROWSER ──────────────────────────────┐
│                                                                             │
│  1. User navigates to /roles                                               │
│     - React Router matches route                                           │
│     - PermissionGuard checks "ROLE:READ" permission from context          │
│     - RoleManagementPage component renders                                 │
│                                                                             │
│  2. Component mounts:                                                       │
│     - useQuery hook fetches roles via identityApi.getRoles()              │
│     - Axios interceptor adds: Authorization: Bearer <JWT>                 │
│                                                                             │
│  3. Admin clicks "Add Role" button                                          │
│     - SetShowAddModal(true)                                                │
│     - AddSecurityRoleModal renders                                         │
│                                                                             │
│  4. Admin fills form & submits                                              │
│     - Form validation (Zod schema)                                         │
│     - Axios POST /api/rbac/roles with body                               │
│                Network request (HTTP)                                      │
│     ────────────────────────────────────────────────────────────────────→ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────── BACKEND API SERVER ─────────────────────────────┐
│                                                                              │
│  5. HTTP Request arrives                                                    │
│     POST /api/rbac/roles                                                   │
│     Headers: Authorization: Bearer eyJhbGc...                              │
│     Body: { roleCode: "REVIEWER", roleName: "Reviewer", ... }             │
│                                                                              │
│  6. ASP.NET Core Pipeline:                                                 │
│     a) JwtBearerMiddleware                                                 │
│        - Extract JWT from Authorization header                            │
│        - Validate: issuer, audience, signature, expiry, clock skew       │
│        - On fail → 401 Unauthorized                                      │
│        - On success → User principal populated with claims              │
│                                                                              │
│     b) TenantMiddleware                                                    │
│        - Extract tid (tenant ID) from JWT claims                         │
│        - Validate tenant active in DB                                     │
│        - Set TenantContext (scoped per request)                          │
│                                                                              │
│     c) Routing                                                              │
│        - Match route: POST /api/rbac/roles → RbacController.CreateRole  │
│                                                                              │
│     d) [Authorize(Policy = "ROLE:CREATE")] attribute                     │
│        - Trigger authorization pipeline                                   │
│                                                                              │
│     e) PermissionRequirementHandler                                        │
│        - Extract userId from User.FindFirst("oid")                       │
│        - Call IPermissionEvaluator.EvaluateAsync(...)                    │
│                                                                              │
│        IPermissionEvaluator.EvaluateAsync():                              │
│        ┌─────────────────────────────────────┐                            │
│        │ 1. Query IPermissionCache            │                            │
│        │    .GetAsync(tenantId, userId, ???) │                            │
│        │    • MISS (first time)               │                            │
│        │                                      │                            │
│        │ 2. Query repositories:               │                            │
│        │    UserRole.GetActiveByUserId()      │                            │
│        │    → Returns roles for this user     │                            │
│        │                                      │                            │
│        │ 3. Extract permissions from roles   │                            │
│        │    → Union codes: "ROLE:CREATE",    │                            │
│        │      "ROLE:READ", "ROLE:UPDATE"      │                            │
│        │                                      │                            │
│        │ 4. Cache result (5-min TTL)          │                            │
│        │    IPermissionCache.SetAsync(...)    │                            │
│        │                                      │                            │
│        │ 5. Check permission code             │                            │
│        │    context.HasPermission("ROLE:CREATE") → true                   │
│        │                                      │                            │
│        │ 6. Emit metrics event                │                            │
│        │    (telemetry, latency bucket)       │                            │
│        │                                      │                            │
│        │ 7. Return EvaluationResult(...)      │                            │
│        └─────────────────────────────────────┘                            │
│        → Authorization SUCCEEDS                                           │
│                                                                              │
│  7. Controller Method Executes                                             │
│     RbacController.CreateRole([FromBody] CreateRoleRequest dto)           │
│     ┌─────────────────────────────────────────┐                           │
│     │ var role = new SecurityRolePermission {  │                           │
│     │   SecRoleId = Guid.NewGuid(),            │                           │
│     │   RoleCode = dto.RoleCode,               │                           │
│     │   RoleName = dto.RoleName,               │                           │
│     │   CanRead = true,  // from request       │                           │
│     │   CanCreate = false,                     │                           │
│     │   IsActive = true,                       │                           │
│     │   CreatedAt = DateTimeOffset.UtcNow,    │                           │
│     │   CreatedBy = User.FindFirst("oid")      │                           │
│     │ };                                       │                           │
│     │                                          │                           │
│     │ await _rbacService.CreateRoleAsync(role);│                           │
│     └─────────────────────────────────────────┘                           │
│                                                                              │
│  8. RbacService.CreateRoleAsync()                                          │
│     ┌──────────────────────────────────────────┐                          │
│     │ // Validate request                      │                          │
│     │ if (string.IsNullOrEmpty(roleCode))      │                          │
│     │   throw AppException(ValidationFailed);  │                          │
│     │                                          │                          │
│     │ // Save to repository                    │                          │
│     │ await _roleRepository.AddAsync(role);    │                          │
│     │                                          │                          │
│     │ // Emit domain event                     │                          │
│     │ await _eventDispatcher.Dispatch(         │                          │
│     │   new RoleCreatedEvent(role.SecRoleId)  │                          │
│     │ );                                       │                          │
│     │                                          │                          │
│     │ // Invalidate cache for all users        │                          │
│     │ await _cache.InvalidateAllAsync();       │                          │
│     │                                          │                          │
│     │ return new CreateRoleResponse { ... };   │                          │
│     └──────────────────────────────────────────┘                          │
│                                                                              │
│  9. Background Job: Async Audit Pipeline                                   │
│     - EventDispatcher enqueues RoleCreatedEvent                           │
│     - BackgroundService consumes from Channel<T>                          │
│     - Creates AuditActionLog record:                                      │
│       {                                                                    │
│         auditActionId: guid,                                              │
│         actionName: "ROLE_CREATED",                                       │
│         actionStatus: "SUCCESS",                                          │
│         permissionCode: "ROLE:CREATE",                                    │
│         actionTimestamp: now,                                             │
│         additionalInfo: { roleCode: "REVIEWER" }                         │
│       }                                                                    │
│     - Audit failures logged but never block response                      │
│                                                                              │
│  10. Controller Returns OK Response                                        │
│      Status: 200 OK                                                       │
│      Body:                                                                │
│      {                                                                    │
│        "data": {                                                          │
│          "securityRoleId": "role-guid-123",                               │
│          "roleCode": "REVIEWER",                                          │
│          "roleName": "Reviewer",                                          │
│          "createdAt": "2026-03-24T10:30:00Z"                             │
│        },                                                                 │
│        "errors": [],                                                      │
│        "status": 200                                                      │
│      }                                                                    │
│                                                                              │
│      Network response (HTTP)                                              │
│     ←────────────────────────────────────────────────────────────────────  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────── USER BROWSER ──────────────────────────────┐
│                                                                            │
│  11. Response Receipt                                                     │
│      - Axios response interceptor processes                              │
│      - Status 200 → success branch                                       │
│                                                                            │
│  12. UI Update                                                            │
│      - Modal closes                                                       │
│      - Toast: "Role created successfully"                                │
│      - Query cache invalidated for /api/rbac/roles                      │
│      - Component refetches roles list                                    │
│      - New role appears in table                                         │
│                                                                            │
│  13. Audit Trail Created (async, not blocking)                           │
│      - Backend: AuditActionLog.INSERT record                            │
│      - ActionName: "ROLE_CREATED"                                        │
│      - PermissionCode: "ROLE:CREATE"                                     │
│      - Status: "SUCCESS"                                                 │
│      - Queryable on /api/audit/logs                                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Design Patterns & Best Practices

### 1. Clean Architecture / Onion Architecture

**Pattern:** Concentric layers with inbound dependencies.

**Implementation:**
- Domain layer has no dependencies
- Application layer depends only on Domain
- Infrastructure implements Domain interfaces
- API depends on Application

**Benefit:** Business logic isolated from frameworks, testable, maintainable.

---

### 2. Repository Pattern

**Pattern:** Abstracts data access behind interfaces.

```csharp
// Domain interface (no EF Core reference)
public interface ISecurityUserRepository {
    Task<SecurityUser?> GetByEntraObjectIdAsync(string oid);
    Task AddAsync(SecurityUser user);
    Task UpdateAsync(SecurityUser user);
}

// Infrastructure implementation (uses EF Core)
public class SecurityUserRepository : ISecurityUserRepository {
    public async Task<SecurityUser?> GetByEntraObjectIdAsync(string oid) {
        return await _context.SecurityUsers.FirstOrDefaultAsync(u => u.EntraObjectId == oid);
    }
}
```

**Benefit:** Easy to swap implementations (SQL → Dataverse). Mockable for tests.

---

### 3. Policy-Based Authorization

**Pattern:** Named policies for permission checks.

```csharp
[Authorize(Policy = "ROLE:CREATE")]
public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest dto) { }
```

**Benefit:** Centralized auth logic, testable, audit-friendly.

---

### 4. Dependency Injection

**Pattern:** Constructor injection, scoped/transient/singleton lifetimes.

```csharp
public class IdentityService {
    public IdentityService(
        ISecurityUserRepository userRepository,
        ISecurityUserRoleRepository userRoleRepository,
        IEventDispatcher eventDispatcher,
        ILogger<IdentityService> logger) { }
}

// Register in Program.cs
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<ISecurityUserRepository, SecurityUserRepository>();
builder.Services.AddSingleton<IPermissionCache, InMemoryPermissionCache>();
```

**Benefit:** Loose coupling, testable, swappable implementations.

---

### 5. Event-Driven Audit

**Pattern:** Domain events dispatched asynchronously.

```csharp
// Domain event
public class UserResolvedEvent : IDomainEvent {
    public Guid UserId { get; }
    public UserResolvedEvent(Guid userId) => UserId = userId;
}

// Service emits event
await _eventDispatcher.Dispatch(new UserResolvedEvent(user.UserId));

// Background job processes
public class AuditBackgroundService : BackgroundService {
    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        await foreach (var @event in _auditChannel.Reader.ReadAllAsync(stoppingToken)) {
            // Create audit log entry
        }
    }
}
```

**Benefit:** Audit never blocks API, scalable, eventual consistency.

---

### 6. DTO Pattern

**Pattern:** Separate Data Transfer Objects from Domain Entities.

```csharp
// Domain entity (internal)
public class SecurityUser {
    public Guid UserId { get; set; }
    public string EntraObjectId { get; set; }
    // ... more fields
}

// API DTO (external contract)
public record UserSecurityProfileDto(
    Guid UserId,
    string DisplayName,
    string Email,
    List<AuthorizedModuleDto> AuthorizedModules);

// In controller: map entity → DTO
map via automapper or manual mapping
```

**Benefit:** API contract decoupled from domain model, security (don't expose internals), versioning.

---

### 7. Async/Await Throughout

**Pattern:** Async operations everywhere, ConfigureAwait(false).

```csharp
public async Task<UserSecurityProfileDto> ResolveUserProfileAsync(string oid) {
    var user = await _userRepository.GetByEntraObjectIdAsync(oid).ConfigureAwait(false);
    // ... more async calls
}
```

**Benefit:** Non-blocking I/O, scalable, natural with EF Core.

---

### 8. Soft Deletes

**Pattern:** Logical deletes (flag) instead of hard deletes.

```csharp
public class SecurityUserRole {
    public bool IsActive { get; set; }
    public DateTimeOffset? DisabledDate { get; set; }
}

// Query only active records
.Where(r => r.IsActive)
```

**Benefit:** Audit trail intact, accidental deletions recoverable.

---

### 9. Permission Context Caching

**Pattern:** Cache permission set per user with version stamp.

```csharp
public record PermissionContext(
    Guid UserId,
    Guid PermissionsVersion,  // Bumped on assignment/revocation
    HashSet<string> PermissionCodes,
    Dictionary<string, bool[]> ModulePermissions);

// Cache implementation
public interface IPermissionCache {
    Task<PermissionContext?> GetAsync(Guid tenantId, Guid userId, Guid moduleId);
    Task SetAsync(PermissionContext ctx, TimeSpan ttl);
    Task InvalidateAsync(Guid tenantId, Guid userId);
}
```

**Benefit:** Sub-millisecond permission checks, scalable to millions of users.

---

### 10. Error Codes Enum

**Pattern:** Standardized error codes for consistency.

```csharp
public enum ErrorCodes {
    ValidationFailed = 1001,
    IdentityNotFound = 2001,
    PermissionDenied = 2002,
    RoleNotFound = 3001,
    // ... more
}

throw new AppException(ErrorCodes.IdentityNotFound, "User not found");
```

**Benefit:** Clients can parse errors programmatically, localization-friendly.

---

## Environment & Configuration

### Environment Variables

**Development (.env.development):**
```env
VITE_API_URL=http://localhost:5000
VITE_AUTH_MODE=demo
VITE_DATA_MODE=local
VITE_TENANT_MODE=local
```

**Production (.env.production):**
```env
VITE_API_URL=https://ecc-api.company.com
VITE_AUTH_MODE=production
VITE_DATA_MODE=remote
VITE_TENANT_MODE=multi
```

### Backend Configuration (appsettings.json)

```json
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "your-tenant-id",
    "ClientId": "your-app-id",
    "Audience": "your-api-id"
  },
  "ConnectionStrings": {
    "SecurityDb": "Server=localhost,1433;Database=ECC_SecurityDB;User Id=sa;Password=...</Database"
  },
  "AllowedOrigins": ["http://localhost:5173"],
  "Jwt": {
    "SecretKey": "dev-secret-key-only-for-local",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

### Secrets Management

**Local Development:**
```bash
dotnet user-secrets set "Jwt:SecretKey" "dev-key"
dotnet user-secrets set "ConnectionStrings:SecurityDb" "connection-string"
```

**Production:**
- Azure Key Vault
- Managed Identity for authentication
- No secrets in code or environment variables

---

## How to Run the Project

### Prerequisites

- Node.js 18+ and npm 9+
- .NET 8 SDK
- SQL Server 2022 (Docker)
- Docker Desktop

### Quick Start (5 minutes)

**1. Clone & Install**
```bash
cd CLaaS2Saas-Enterprise-Control-Center
npm install --prefix apps/frontend
```

**2. Start Database & API**
```bash
# Terminal 1: Start SQL Server via Docker
cd infrastructure/docker
docker-compose up -d

# Terminal 2: Start backend API
cd services/api
dotnet run --project src/ECC.API/ECC.API.csproj
# API runs on http://localhost:5000
```

**3. Start Frontend**
```bash
# Terminal 3: Start frontend dev server
cd apps/frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**4. Open Browser**
```
http://localhost:5173
```

### Detailed Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd services/api

# Restore NuGet packages
dotnet restore

# Build all projects
dotnet build ECC.sln

# Run database migrations (via EF Core)
dotnet ef database update --project src/ECC.Infrastructure

# Run tests
dotnet test ECC.sln

# Start API
dotnet run --project src/ECC.API/ECC.API.csproj
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd apps/frontend

# Install dependencies
npm install

# Set environment variables
echo "VITE_API_URL=http://localhost:5000" > .env.development
echo "VITE_AUTH_MODE=demo" >> .env.development

# Run dev server
npm run dev

# Or build for production
npm run build
```

#### Database Setup

```bash
# Start SQL Server via Docker Compose
cd infrastructure/docker
docker-compose up -d

# Verify SQL Server is running
docker ps  # Should list ecc-sqlserver container

# Connect via SQL Server Management Studio
# Server: localhost,1433
# Username: sa
# Password: YourStrong!Passw0rd

# Apply migrations (via EF Core in dotnet run)
# Or manually run SQL scripts:
# infrastructure/database/migrations/V001_InitialSchema.sql
# infrastructure/database/seed/V001_SeedData.sql
```

---

## Testing Strategy

### Unit Tests (MVP)

**Location:** `tests/unit/ECC.Application.Tests/`

**Framework:** xUnit + Moq

**Coverage:** Application layer services

**Run Tests:**
```bash
cd services/api
dotnet test ECC.sln --verbosity normal

# Results:
# Total: 8
# Passed: 8
# Failed: 0
# Skipped: 0
```

**Test Categories:**

1. **IdentityService Tests** (5 tests)
   - ✅ ResolveUserProfile_ValidUser_ReturnsProfile
   - ✅ ResolveUserProfile_UserNotFound_ThrowsException
   - ✅ ResolveUserProfile_DeactivatedUser_ThrowsException
   - ✅ ResolveUserProfile_EmptyEntraId_ThrowsException
   - ✅ ResolveUserProfile_NoEventOnFail

2. **RbacService Tests** (3 tests)
   - ✅ AssignRole_ValidRequest_CreatesAssignment
   - ✅ AssignRole_InsufficientAuthority_ThrowsException
   - ✅ AssignRole_DuplicateAssignment_ThrowsException

### Integration Tests (Roadmap)

**Location:** `tests/integration/`

**Scope:**
- API endpoint contracts
- Database persistence
- End-to-end workflows

### Frontend Tests (Roadmap)

**Framework:** Vitest + React Testing Library

**Scope:**
- Component rendering
- Permission guard behavior
- API mock integration

---

## Deployment & DevOps

### Docker & Docker Compose

**Local Development:**
```bash
cd infrastructure/docker
docker-compose up -d
# Starts: SQL Server, ECC API (future)
```

**docker-compose.yml:**
```yaml
version: '3.9'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: Y
      MSSQL_SA_PASSWORD: YourStrong!Passw0rd
    ports:
      - "1433:1433"
    volumes:
      - sql_data:/var/opt/mssql

  ecc-api:
    image: mcr.microsoft.com/dotnet/aspnet:8.0
    depends_on:
      - sqlserver
    environment:
      ConnectionStrings__SecurityDb: Server=sqlserver,1433;Database=ECC_SecurityDB;User Id=sa;Password=YourStrong!Passw0rd;
    ports:
      - "8080:8080"

volumes:
  sql_data:
```

### CI/CD Pipelines

**GitHub Actions:**

**ci-backend.yml:**
```yaml
name: CI - Backend

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.x'
      - run: dotnet build services/api/ECC.sln
      - run: dotnet test services/api/ECC.sln
```

**ci-frontend.yml:**
```yaml
name: CI - Frontend

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install --prefix apps/frontend
      - run: npm run build --prefix apps/frontend
      - run: npm run typecheck --prefix apps/frontend
```

### Production Deployment

**Target:** Azure App Service + Azure SQL Server + Azure Key Vault

**Steps:**
1. Build Docker images (CI pipeline)
2. Push to Azure Container Registry
3. Deploy to App Service via manifests
4. Run database migrations
5. Health check endpoints
6. Smoke tests

---

## Glossary & Key Terms

| Term | Definition |
|------|-----------|
| **ECC** | Enterprise Control Center - the RBAC authority service |
| **Entra ID** | Microsoft Azure Active Directory (enterprise identity provider) |
| **RBAC** | Role-Based Access Control (permissions model) |
| **JWT** | JSON Web Token (stateless authentication credential) |
| **Permission Code** | String identifier for a permission (e.g., "ROLE:CREATE") |
| **UserSecurityProfile** | User's identity + authorized modules + roles + permissions |
| **PermissionContext** | Cached user permissions per module/solution |
| **PermissionsVersion** | GUID that increments on role assignment/revocation (audit forensics) |
| **Domain Event** | Event emitted by domain logic (e.g., UserResolvedEvent) |
| **DTO** | Data Transfer Object - API contract shape |
| **Repository** | Interface for data access abstraction |
| **Fluent UI** | Microsoft's enterprise design system |
| **Griffel** | CSS-in-JS engine by Microsoft (atomic CSS generation) |
| **MSAL.js** | Microsoft Authentication Library for JavaScript (Entra ID client) |
| **PKCE** | Proof Key for Code Exchange (OAuth 2.0 security extension) |
| **ClockSkew** | Tolerance for JWT expiry time drift between servers |

---

## Common Development Tasks

### Add a New API Endpoint

1. Add controller method to `ECC.API/Controllers/*Controller.cs`:
```csharp
[HttpPost("path")]
[Authorize(Policy = "PERMISSION:CODE")]
public async Task<ActionResult> CreateResource([FromBody] CreateRequest dto) {
    var result = await _service.CreateAsync(dto);
    return Ok(ApiResponse<T>.Ok(result));
}
```

2. Add service method to `ECC.Application/Services/*Service.cs`
3. Add repository method if needed to `ECC.Domain/Interfaces/*Repository.cs`
4. Implement repository in `ECC.Infrastructure/Repositories/*Repository.cs`

---

### Add a New Permission Code

1. Define in permission matrix seed:
```sql
INSERT INTO SecurityDB_Security_Role_Permission 
VALUES (new_role_id, 'MODULE:CODE', 'New Permission', 1, 0, 0, 0, 0)
```

2. Add policy if needed:
```csharp
options.AddPolicy("MODULE:CODE", policy =>
    policy.Requirements.Add(new PermissionRequirement("MODULE:CODE")));
```

3. Use on endpoints:
```csharp
[Authorize(Policy = "MODULE:CODE")]
public async Task<IActionResult> Operation() { }
```

---

## Support & Next Steps

For questions or issues:
1. Check governance documents in `/governance/`
2. Review architecture decision in this file
3. Check test examples for patterns
4. Consult team lead or architecture review board

---

**End of Document**

*This document represents the authoritative architecture as of March 2026. Updates require architecture review board approval.*
