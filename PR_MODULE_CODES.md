# PR: Canonical Module Codes & Display Names

**Branch:** `chore/module-codes-cc-20250225`

## Summary

Apply canonical module code and display name mapping across the repository so all UI pages and backend fixtures show the new standardized labels.

### Authoritative Mapping

| Code | Display Name |
|------|--------------|
| AESS | Agentic ERP & Shared Services |
| AIW | Agentic Intelligent Workplace |
| ADLT | Adaptive Learning & Talent |
| ACRM | Agentic CRM & Marketer |

## Files Changed

### New Files
- `apps/web/src/constants/modules.ts` – Central `MODULES` mapping and `getModuleName()` helper
- `apps/web/src/constants/module_code_inventory.txt` – Inventory of module-related files

### Modified Files
- `apps/web/src/features/ecc/EccPage.tsx` – `LOCKED_MODULES` updated to canonical codes/names
- `apps/web/src/features/module-mgmt/ModuleMgmtPage.tsx` – `STATIC_MODULES` updated
- `apps/web/src/features/module-mgmt/components/AddModuleDialog.tsx` – Solution/module options
- `apps/web/src/features/role-management/components/AddSecurityRoleModal.tsx` – Solution/module options
- `apps/web/src/features/role-management/components/EditSecurityRoleModal.tsx` – Solution/module options
- `apps/web/src/features/role-management/services/securityRoleService.ts` – Mock roles updated
- `apps/web/src/features/user-role-assign/components/AssignRoleModal.tsx` – Solution/module options
- `apps/web/src/features/user-role-assign/components/AssignmentTable.tsx` – Uses `getModuleName()` for display
- `apps/web/src/features/user-role-assign/components/EditRoleAssignmentModal.tsx` – Solution/module options
- `apps/web/src/features/user-role-assign/services/mockAssignments.ts` – Assignments use AESS, AIW, ADLT, ACRM
- `apps/web/src/features/scc-dashboard/services/dashboardService.ts` – Mock activity messages
- `apps/web/src/features/user-enrichment/pages/UserEnrichmentPage.tsx` – Module references

## Tests Run

- **TypeScript:** `npx tsc --noEmit` (pre-existing errors in TopBar, access-request, AddSecurityRoleModal; none from this change)
- **Lint:** ESLint not installed as standalone; no new lint issues in changed files

## Visual Verification

Screenshots captured for:
- `/ecc` – Enterprise Control Centre: Module buttons show Agentic ERP & Shared Services, Agentic Intelligent Workplace, Adaptive Learning & Talent, Agentic CRM & Marketer
- `/kernel` – Dashboard
- `/modules` – Module Management
- `/roles` – Security Role Management
- `/assignments` – User Role Assignment
- `/users` – User Profile Enrichment

## Migration Notes

- **Scope:** Changes are limited to UI, mocks, fixtures, and constants. No production backend or DB changes.
- **Old codes removed:** ADC, ACM, ELX, CLX; AGNT_HR, KNL, AGNT_TLNT, AGNT_CRCLM, etc.
- **Backend coordination:** If any `code` values used as keys in production APIs or DBs were changed, backend team should be notified. Current changes do **not** modify production backend or DB.

## Rollback Plan

```bash
git revert <merge-commit-sha>
# or
git checkout master
git branch -D chore/module-codes-cc-20250225
```

## Inventory

See `apps/web/src/constants/module_code_inventory.txt` for full search results and file list.
