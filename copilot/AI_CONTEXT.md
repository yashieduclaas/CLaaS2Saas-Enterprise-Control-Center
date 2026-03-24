# ECC — AI Context File

> **What this is:** The repository root context file that Copilot reads as part of its workspace semantic index. Unlike the `.github/` instruction files, this file functions as a structural map of the ECC repository — it helps Copilot understand what already exists, where things belong, and how the codebase is organized. It is also consumed by the Custom GPT Decision Engine when a developer pastes it into a planning session.
>
> **Audience:** GitHub Copilot (via semantic indexing), Custom GPT (via developer paste), and any engineer onboarding to the ECC project.

---

## Project Identity

**Enterprise Control Center (ECC)** is a centralized RBAC control plane for the CLaaS2SaaS platform. It is the single source of truth for user identity context, role assignments, permission evaluation, application discovery, and audit logging across all modules in the CLaaS2SaaS ecosystem.

ECC does not contain the business logic of any external module. Its responsibility ends at the authorization boundary — once a user's permission context has been established and propagated, the external module takes over entirely. This separation between the control plane (ECC) and the execution plane (external modules) is the foundational architectural decision.

**Technology Stack:**
- **Frontend:** React 18 + TypeScript 5 — functional components with hooks, MSAL authentication, service-layer API calls
- **Backend API:** ASP.NET Core 8 + C# — three-layer architecture (Controller → Service → Repository), FluentValidation, AppException error handling
- **Database:** Microsoft SQL Server — Security domain (users, roles, permissions, assignments), Audit domain (sessions, action logs), Registry domain (application metadata)
- **Identity Provider:** Microsoft Entra ID — SSO via JWT, Object ID as the identity anchor, Microsoft.Identity.Web for token validation
- **Testing:** xUnit + Moq — TDD (Red-Green-Refactor), Arrange-Act-Assert structure, one behavior per test

---

## Repository Structure

```
ECC/
├── src/
│   ├── ECC.API/                          # ASP.NET Core 8 API project
│   │   ├── Controllers/                  # HTTP endpoints — authorization + delegation only
│   │   ├── Services/                     # Business logic + RBAC evaluation
│   │   ├── Repositories/                 # SQL Server data access — parameterized queries only
│   │   ├── DTOs/                         # Request/response data transfer objects with validators
│   │   ├── Modules/                      # One subdirectory per ECC module
│   │   │   ├── Identity/                 # Security Kernel — authentication, identity resolution
│   │   │   ├── Auth/                     # RBAC Engine — role evaluation, permission checking
│   │   │   ├── Registry/                 # Application Registry — metadata catalog
│   │   │   ├── Audit/                    # Audit Service — session and action logging
│   │   │   └── UserManagement/           # User provisioning and lifecycle management
│   │   ├── Shared/                       # Cross-cutting concerns
│   │   │   ├── Errors/                   # AppException and error code definitions
│   │   │   ├── Events/                   # IEventDispatcher and domain event types
│   │   │   └── DTOs/                     # Shared DTOs (ApiResponse envelope, pagination, etc.)
│   │   └── Examples/                     # Canonical pattern files — the Three-File Rule references
│   │       ├── example-service.cs        # Reference service implementation
│   │       ├── example-controller.cs     # Reference controller implementation
│   │       ├── example-repository.cs     # Reference repository implementation
│   │       ├── example-dto.cs            # Reference DTO with FluentValidation
│   │       └── example-test.cs           # Reference xUnit test class
│   │
│   └── ECC.UI/                           # React 18 + TypeScript 5 frontend
│       ├── src/
│       │   ├── components/               # Shared UI components (LoadingSpinner, ErrorDisplay, etc.)
│       │   ├── pages/                    # Route-level page components (Dashboard, Admin, etc.)
│       │   ├── services/                 # API call service modules — all fetch() calls live here
│       │   ├── types/                    # TypeScript interfaces (PermissionProfile, DTOs, etc.)
│       │   ├── auth/                     # MSAL configuration and authentication wrapper
│       │   └── hooks/                    # Custom React hooks
│       └── examples/                     # Canonical frontend pattern files
│           ├── example-component.tsx     # Reference React component
│           └── example-service.ts        # Reference service module
│
├── tests/                                # xUnit test projects — mirrors src/ structure
│   └── ECC.API.Tests/
│       ├── Services/                     # Service layer unit tests
│       ├── Repositories/                 # Repository layer unit tests (mock SqlConnection)
│       └── Controllers/                  # Controller layer unit tests (mock services)
│
├── migrations/                           # SQL Server migration files
│                                         # ⚠️ PROTECTED: DB Owner approval required for changes
│
├── docs/
│   ├── features/                         # FEAT-NNN.md feature specifications
│   ├── adr/                              # ADR-NNN.md architecture decision records
│   └── ai-governance/
│       └── prompt-registry/              # PR-NNN.md prompt registry entries (AI audit trail)
│
├── infra/                                # Azure Bicep deployment templates
│                                         # ⚠️ PROTECTED: Platform Lead approval required
│
├── .github/
│   ├── copilot-instructions.md           # Primary Copilot instruction file (loaded always)
│   ├── instructions/                     # Path-specific instruction files
│   │   ├── backend.instructions.md       # Loaded for src/ECC.API/**
│   │   └── frontend.instructions.md      # Loaded for src/ECC.UI/**
│   ├── agents/                           # TDD phase agent profiles
│   │   ├── tdd-red.agent.md              # Test generation phase
│   │   ├── tdd-green.agent.md            # Implementation phase
│   │   ├── tdd-refactor.agent.md         # Structural improvement phase
│   │   └── security.agent.md             # Security-sensitive implementation
│   ├── prompts/                          # Prompt templates for GPT review and Copilot operations
│   │   ├── chatgpt-review.prompt.md      # Gate 3 architecture review
│   │   ├── chatgpt-debug.prompt.md       # Structured debug diagnosis
│   │   ├── copilot-fix.prompt.md         # Minimal patch application
│   │   └── generate-unit-tests.prompt.md # TDD Red phase test generation
│   └── workflows/                        # CI/CD pipeline definitions
│                                         # ⚠️ PROTECTED: Engineering Lead approval required
│
└── AI_CONTEXT.md                         # This file — repository structural map
```

---

## Module Registry

| Module | Namespace Root | Source Directory | Protection Level |
|--------|---------------|-----------------|-----------------|
| SecurityKernel | `ECC.API.Modules.Identity` | `src/ECC.API/Modules/Identity/` | High — identity resolution and authentication logic |
| RBACEngine | `ECC.API.Modules.Auth` | `src/ECC.API/Modules/Auth/` | Critical — role evaluation, permission checking, token generation. Changes require Security agent. |
| ApplicationRegistry | `ECC.API.Modules.Registry` | `src/ECC.API/Modules/Registry/` | Standard — metadata catalog CRUD |
| AuditService | `ECC.API.Modules.Audit` | `src/ECC.API/Modules/Audit/` | High — audit record integrity must be preserved |
| UserManagement | `ECC.API.Modules.UserManagement` | `src/ECC.API/Modules/UserManagement/` | High — user provisioning and lifecycle |

---

## Protected Areas — Approval Requirements

| Path | Approver | Reason |
|------|----------|--------|
| `src/ECC.API/Modules/Auth/` | Engineering Lead + Security Review | RBAC engine — the authorization core of the platform |
| `migrations/` | DB Owner | Schema changes affect all modules consuming ECC's security data |
| `infra/` | Platform Lead | Azure deployment changes affect production availability |
| `.github/workflows/` | Engineering Lead | CI/CD pipeline changes affect all developer workflows |
| `.github/copilot-instructions.md` | Engineering Lead | Primary Copilot instruction file affects all code generation |

---

## ECC Standard Roles

| Role | Code | Scope | Key Permissions |
|------|------|-------|----------------|
| Viewer | `VIEWER` | Per-module | Read all data within assigned module. No create, update, or delete. |
| Contributor | `CONTRIBUTOR` | Per-module | Full CRUD on own records. Read all. No admin functions. |
| Collaborator | `COLLABORATOR` | Per-module | Full CRUD on all records. Approval privileges. Cross-team access. |
| Admin | `ADMIN` | Per-module | Collaborator + role management + master data management within module. Cannot assign Admin role. |
| Global Admin | `GLOBAL_ADMIN` | Platform-wide | Full access across all modules. Sole authority for Admin role assignment. |

---

## Security Domain Tables

| Table | Purpose |
|-------|---------|
| `Security_User` | User identity records anchored on Entra Object ID |
| `Security_Solution_Module` | Registry of solutions and modules ECC governs |
| `Security_Role_Permission` | Role definitions with per-module permission flags |
| `Security_User_Role` | User-to-role assignment junction (never physically deleted — soft deactivation only) |

## Audit Domain Tables

| Table | Purpose |
|-------|---------|
| `Audit_Session` | Authentication events — who logged in, when, from where, success/failure |
| `Audit_Action_Log` | User action records — what was done, in which module, with what permission, what outcome |

---

## Currently Active Features

> *Update this section each sprint with the FEAT-IDs currently in development.*

| FEAT-ID | Title | Status | Module(s) Affected |
|---------|-------|--------|-------------------|
| — | — | — | — |

---

## Integration Contracts

ECC integrates with external modules through two mechanisms:

**Token-based context propagation:** ECC generates a scoped JWT containing user identity, role, solution/module codes, and session reference. The module validates the signature and reads claims. No runtime callback to ECC required.

**API-based authorization validation:** ECC exposes a permission-check endpoint that any module can call at runtime. The module passes Solution ID, Module ID, and User ID; ECC returns the evaluated permission profile. Useful for modules that need fine-grained runtime authorization checks.

Both patterns are available. Neither is mandatory — module teams choose what fits their architecture. What is mandatory is that no module implements its own independent authorization logic that bypasses ECC.
