# PAGE OWNERSHIP MAP

Developer ownership and file mapping for the CLaaS2SaaS React app.

---

## 1️⃣ Sign In

| Property | Value |
|----------|-------|
| **Route** | `/login` |
| **File** | `features/auth/pages/SignInPage.tsx` |
| **Sidebar** | Not in sidebar (public) |
| **Layout** | None (standalone) |

**Related:**
- `MicrosoftLogo.tsx`
- `useLogin.ts`
- `authService.ts`

**To modify:**
- Sign-in form → `SignInPage.tsx`
- Microsoft logo → `features/auth/components/MicrosoftLogo.tsx`
- Auth logic → `features/auth/hooks/useLogin.ts`

---

## 2️⃣ Access Denied

| Property | Value |
|----------|-------|
| **Route** | `/forbidden` |
| **File** | `features/ForbiddenPage.tsx` |
| **Sidebar** | Not in sidebar |
| **Layout** | None (standalone) |

**Related:** None

---

## 3️⃣ Request Access

| Property | Value |
|----------|-------|
| **Route** | `/request-access` |
| **File** | `features/PlaceholderPage.tsx` |
| **Sidebar** | Not in sidebar |
| **Layout** | None (standalone) |

**Related:** PlaceholderPage (generic)

---

## 4️⃣ SCC Root Landing (AI Welcome)

| Property | Value |
|----------|-------|
| **Route** | `/scc` |
| **File** | `features/scc/pages/SccRootLandingPage.tsx` |
| **Sidebar** | SCC Group Header (click header → /scc) |
| **Layout** | AppLayout |

**Related:**
- No services
- Search input logic only (local state)

**To modify:**
- Welcome text, search UX → `SccRootLandingPage.tsx`

---

## 5️⃣ SCC Dashboard (Analytics)

| Property | Value |
|----------|-------|
| **Route** | `/kernel` |
| **File** | `features/scc-dashboard/components/SccDashboardPage.tsx` |
| **Sidebar** | SCC → Dashboard |
| **Layout** | AppLayout |
| **PageKey** | `kernel-dashboard` |

**Related:**
- `useDashboardData.ts`
- `dashboardService.ts`
- ComplianceRing, KpiCard, RoleDistributionCard, AccessMetricsCard, AuditActivityCard (inline components)

**To modify:**
- Cards layout, KPI widgets → `SccDashboardPage.tsx`
- Metrics logic → `features/scc-dashboard/hooks/useDashboardData.ts`
- API call → `features/scc-dashboard/services/dashboardService.ts`

---

## 6️⃣ Module Management

| Property | Value |
|----------|-------|
| **Route** | `/modules` |
| **File** | `features/module-mgmt/ModuleMgmtPage.tsx` |
| **Sidebar** | SCC → Module Management |
| **Layout** | AppLayout |
| **PageKey** | `module-mgmt` |

**Related:**
- `ModuleTable.tsx`
- `AddModuleDialog.tsx`
- `ModuleRow.tsx`, `VersionBadge.tsx`
- Static data (STATIC_MODULES in page)

**To modify:**
- Table layout → `ModuleMgmtPage.tsx`
- Add module dialog → `features/module-mgmt/components/AddModuleDialog.tsx`
- Row display → `features/module-mgmt/components/ModuleRow.tsx`

---

## 7️⃣ User Profile Enrichment

| Property | Value |
|----------|-------|
| **Route** | `/users` |
| **File** | `features/user-enrichment/pages/UserEnrichmentPage.tsx` |
| **Sidebar** | SCC → User Profile Enrichment |
| **Layout** | AppLayout |
| **PageKey** | `user-profile` |

**Related:**
- `useUsers.ts`
- `EditUserModal.tsx`
- `userService.ts`

**To modify:**
- Table layout → `UserEnrichmentPage.tsx`
- Edit user modal → `features/user-enrichment/components/EditUserModal.tsx`
- Fetch users → `features/user-enrichment/hooks/useUsers.ts`
- API → `features/user-enrichment/services/userService.ts`

---

## 8️⃣ Security Role Management

| Property | Value |
|----------|-------|
| **Route** | `/roles` |
| **File** | `features/role-management/RoleManagementPage.tsx` |
| **Sidebar** | SCC → Security Role Management |
| **Layout** | AppLayout |
| **PageKey** | `role-mgmt` |

**Related:**
- `AddSecurityRoleModal.tsx`
- `useRoles.ts`
- `securityRoleService.ts`
- `RoleTable.tsx`, `RoleEmptyState.tsx`, `RoleTableSkeleton.tsx`

**To modify:**
- Table layout → `RoleManagementPage.tsx`
- Create role modal → `features/role-management/components/AddSecurityRoleModal.tsx`
- Fetch roles → `features/role-management/hooks/useRoles.ts`
- API → `features/role-management/services/securityRoleService.ts`

---

## 9️⃣ User Role Assignment

| Property | Value |
|----------|-------|
| **Route** | `/assignments` |
| **File** | `features/user-role-assign/UserRoleAssignmentPage.tsx` |
| **Sidebar** | SCC → User Role Assignment |
| **Layout** | AppLayout |
| **PageKey** | `user-role-assign` |

**Related:**
- `AssignRoleModal.tsx`
- `EditRoleAssignmentModal.tsx`
- `AssignmentTable.tsx`
- `AssignmentFilters.tsx`
- `RoleBadge.tsx`, `StatusBadge.tsx`
- `mockAssignments.ts` (mock data)

**To modify:**
- Page layout → `UserRoleAssignmentPage.tsx`
- Assign modal → `features/user-role-assign/components/AssignRoleModal.tsx`
- Edit modal → `features/user-role-assign/components/EditRoleAssignmentModal.tsx`
- Table → `features/user-role-assign/components/AssignmentTable.tsx`

---

## 🔟 Audit Logs

| Property | Value |
|----------|-------|
| **Route** | `/audit` |
| **File** | `features/audit/AuditActionsPage.tsx` |
| **Sidebar** | SCC → Audit Logs |
| **Layout** | AppLayout |
| **PageKey** | `audit-logs` |

**Related:**
- `useAuditActionsQuery.ts`
- Audit API (via query hook)

**To modify:**
- Table layout → `AuditActionsPage.tsx`
- Data fetch → `features/audit/api/useAuditActionsQuery.ts`

---

## 1️⃣1️⃣ Access Requests (Governance)

| Property | Value |
|----------|-------|
| **Route** | `/access-requests` |
| **File** | `features/PlaceholderPage.tsx` |
| **Sidebar** | ACC → Governance & Compliance; Helpdesk → Access Requests |
| **Layout** | AppLayout |
| **PageKey** | `admin-access-requests` |

**Related:** PlaceholderPage (generic)

**To modify:** Create dedicated page when feature is implemented.

---

## 1️⃣2️⃣ Enterprise Control Centre (ECC)

| Property | Value |
|----------|-------|
| **Route** | `/ecc` |
| **File** | `features/ecc/EccPage.tsx` |
| **Sidebar** | Not in sidebar (via TopBar brand click) |
| **Layout** | EccLayout (standalone, no NavRail) |

**Related:**
- `EccLayout.tsx`
- `EccSection.tsx`
- `EccModuleCard.tsx`, `EccKernelCard.tsx`

**To modify:**
- Module grid → `EccPage.tsx`
- Layout/header → `features/ecc/EccLayout.tsx`

---

## Sidebar Items Without Dedicated Routes

These paths appear in NavRail but hit catch-all → redirect to `/kernel`:

| Label | Path | Status |
|-------|------|--------|
| Workflow Automation | `/workflow` | No route |
| Analytics & KPIs | `/analytics` | No route |
| Deployment & Release | `/deployment` | No route |
| Issue Ticketing | `/tickets` | No route |
| Knowledge Base | `/knowledge` | No route |
| AI Assistant | `/assistant` | No route |

---

## Global Layout Files

| File | Purpose |
|------|---------|
| `app/AppLayout.tsx` | Shell: TopBar + NavRail + Outlet |
| `app/TopBar.tsx` | Header: logo, search, env, icons |
| `navigation/NavRail.tsx` | Sidebar: SCC, ACC, Helpdesk groups |
| `app/AppProviders.tsx` | FluentProvider, Auth, QueryClient |
| `theme/colors.css` | CSS variables (Kernel palette) |
| `theme/kernelTheme.ts` | Fluent theme override |

**To modify:**
- Header background, logo → `TopBar.tsx`
- Sidebar items → `NavRail.tsx`
- Page background (platinum beige) → `AppLayout.tsx`
- Theme/colors → `theme/colors.css`, `theme/kernelTheme.ts`

---

## Summary Table

| Page | Route | File | Feature Folder |
|------|-------|------|----------------|
| Sign In | `/login` | SignInPage.tsx | auth |
| Access Denied | `/forbidden` | ForbiddenPage.tsx | (root features/) |
| Request Access | `/request-access` | PlaceholderPage.tsx | (root features/) |
| SCC Root Landing | `/scc` | SccRootLandingPage.tsx | scc |
| SCC Dashboard | `/kernel` | SccDashboardPage.tsx | scc-dashboard |
| Module Management | `/modules` | ModuleMgmtPage.tsx | module-mgmt |
| User Profile Enrichment | `/users` | UserEnrichmentPage.tsx | user-enrichment |
| Security Role Management | `/roles` | RoleManagementPage.tsx | role-management |
| User Role Assignment | `/assignments` | UserRoleAssignmentPage.tsx | user-role-assign |
| Audit Logs | `/audit` | AuditActionsPage.tsx | audit |
| Access Requests | `/access-requests` | PlaceholderPage.tsx | (root features/) |
| Enterprise Control Centre | `/ecc` | EccPage.tsx | ecc |

---

## Audit Summary

| Metric | Count |
|--------|-------|
| **Total pages found** | 12 |
| **Total routes found** | 12 |
| **Total feature folders** | 9 (auth, scc, scc-dashboard, module-mgmt, user-enrichment, role-management, user-role-assign, audit, ecc) |
| **Duplicate routes** | 0 |
| **Orphaned pages** | 2 |

### Orphaned Pages (not linked in router)

| File | Notes |
|------|-------|
| `features/kernel-dashboard/KernelDashboardPage.tsx` | Superseded by `SccDashboardPage` at `/kernel` |
| `features/dashboard/DashboardPage.tsx` | Not referenced in routing |
