# ARCHITECTURE TREE

Visual hierarchy of the CLaaS2SaaS React application.

```
App (main.tsx)
├── AppProviders
│   ├── RendererProvider (Fluent)
│   ├── FluentProvider (theme: kernelLightTheme)
│   ├── AuthProvider (DemoAuth | MsalAuth)
│   ├── QueryClientProvider
│   └── PermissionProvider
│
├── BrowserRouter
│   └── Routes
│       │
│       ├── /login ──────────────────────► SignInPage (standalone)
│       ├── /forbidden ───────────────────► ForbiddenPage (standalone)
│       ├── /request-access ──────────────► PlaceholderPage (standalone)
│       │
│       ├── /ecc ─────────────────────────► EccLayout
│       │   └── EccPage
│       │
│       └── AuthGuard
│           └── AppLayout
│               ├── TopBar (header)
│               ├── NavRail (sidebar)
│               └── Outlet (main content)
│                    │
│                    ├── / (index) ───────► Navigate → /kernel
│                    ├── /scc ────────────► SccRootLandingPage
│                    ├── /kernel ─────────► SccDashboardPage
│                    ├── /audit ──────────► AuditActionsPage
│                    ├── /modules ────────► ModuleMgmtPage
│                    ├── /roles ─────────► RoleManagementPage
│                    ├── /users ──────────► UserEnrichmentPage
│                    ├── /assignments ────► UserRoleAssignmentPage
│                    ├── /access-requests ► PlaceholderPage
│                    │
│                    └── * (catch-all) ───► Navigate → /kernel
```

---

## NavRail Structure

```
NavRail
├── SCC (header → /scc)
│   ├── Dashboard ──────────► /kernel
│   ├── Module Management ──► /modules
│   ├── User Profile Enrichment ► /users
│   ├── Security Role Management ► /roles
│   ├── User Role Assignment ► /assignments
│   └── Audit Logs ─────────► /audit
│
├── ACC
│   ├── Governance & Compliance ► /access-requests
│   ├── Workflow Automation ────► /workflow (no route)
│   ├── Analytics & KPIs ───────► /analytics (no route)
│   └── Deployment & Release ───► /deployment (no route)
│
└── Helpdesk
    ├── Access Requests ───────► /access-requests
    ├── Issue Ticketing ────────► /tickets (no route)
    ├── Knowledge Base ────────► /knowledge (no route)
    └── AI Assistant ──────────► /assistant (no route)
```

---

## Feature Folder Map

```
src/
├── app/
│   ├── AppLayout.tsx      # Shell layout
│   ├── AppRouter.tsx      # Route definitions
│   ├── AppProviders.tsx   # Provider stack
│   ├── TopBar.tsx         # Header
│   ├── PageSkeleton.tsx   # Loading fallback
│   └── main.tsx
│
├── navigation/
│   ├── NavRail.tsx        # Sidebar
│   └── Breadcrumbs.tsx
│
├── features/
│   ├── auth/              # Sign-in
│   ├── scc/               # SCC Root Landing (/scc)
│   ├── scc-dashboard/     # SCC Dashboard (/kernel)
│   ├── audit/             # Audit Logs
│   ├── module-mgmt/       # Module Management
│   ├── role-management/   # Security Roles
│   ├── user-enrichment/    # User Profiles
│   ├── user-role-assign/   # Role Assignments
│   ├── ecc/               # Enterprise Control Centre
│   ├── ForbiddenPage.tsx
│   └── PlaceholderPage.tsx
│
├── theme/
│   ├── colors.css
│   └── kernelTheme.ts
│
└── rbac/
    └── RoutePermissionMap.ts  # Route registry
```
