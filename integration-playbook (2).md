# CLaaS2SaaS Security Kernel — Feature Pod Integration Playbook

**Document Path:** `/docs/feature-pods/integration-playbook.md`  
**Document ID:** DOC-C2S-PODS-001  
**Version:** 1.0 — Authoritative  
**Status:** APPROVED  
**Classification:** Internal  
**Audience:** AI code-generation agents (Claude, Copilot, other), engineers integrating AI-generated features, platform maintainers  
**Last Updated:** February 2026

---

> ⚠️ **THIS DOCUMENT IS OPERATIONALLY EXECUTABLE.**
> Every AI agent generating code for this platform must internalize this document before producing any output. Every integration engineer processing a feature pod must follow this playbook exactly. Deviation is not permitted. This document defines the **only** safe path for AI-generated code to enter the CLaaS2SaaS codebase.

---

## Table of Contents

1. [Feature Pod Packaging Contract](#1-feature-pod-packaging-contract)
2. [Pod Intake Workflow](#2-pod-intake-workflow)
3. [Automated Validation Gates](#3-automated-validation-gates)
4. [Rejection Criteria](#4-rejection-criteria)
5. [Blast Radius Rules](#5-blast-radius-rules)
6. [Rollback Procedure](#6-rollback-procedure)
7. [Multi-Claude Operational Guidance](#7-multi-claude-operational-guidance)

---

## 1. Feature Pod Packaging Contract

A feature pod is a compressed archive containing exactly one new feature slice. It is the only mechanism by which AI-generated code enters the monorepo. There is no other path. Direct commits from AI agents to `main`, `develop`, or any branch other than a pod-derived integration branch are prohibited.

### 1.1 Required Archive Structure

The pod is a `tar.gz` archive. Naming convention is enforced by the validation script — any archive that does not match the pattern below is rejected before unpacking.

**Filename format:**
```
feat-<kebab-case-feature-name>-<YYYYMMDD>.tar.gz
```

**Examples:**
```
feat-role-crud-20260215.tar.gz
feat-audit-export-20260301.tar.gz
feat-access-request-workflow-20260310.tar.gz
```

**Archive internal structure:**
```
feat-<name>-<date>/
├── MANIFEST.json                          ← REQUIRED. Machine-readable pod metadata.
├── web/                                   ← Frontend contribution (optional if API-only)
│   └── src/
│       └── features/<feature-name>/
│           ├── <FeatureName>Page.tsx
│           ├── components/
│           │   └── ...
│           ├── hooks/
│           │   └── ...
│           └── index.ts
├── api/                                   ← Backend contribution (optional if frontend-only)
│   └── src/
│       ├── Kernel.Application/
│       │   └── Features/<FeatureName>/
│       │       ├── Commands/
│       │       │   └── ...
│       │       └── Queries/
│       │           └── ...
│       ├── Kernel.Infrastructure/
│       │   └── Repositories/
│       │       └── <FeatureName>Repository.cs
│       └── Kernel.API/
│           └── Controllers/
│               └── <FeatureName>Controller.cs
├── routes/                                ← RoutePermissionMap addition (if frontend)
│   └── route-additions.ts                 ← ADDITIVE ONLY. Append to ROUTE_MAP only.
└── tests/
    ├── rbac-matrix/
    │   └── <feature-name>-matrix.cs      ← REQUIRED if any new permission code is used
    └── integration/
        └── <feature-name>-integration.cs  ← REQUIRED
```

### 1.2 MANIFEST.json Specification

`MANIFEST.json` is required in every pod. The validation script will reject any pod missing this file or containing an invalid manifest. All fields marked REQUIRED must be present. Empty strings fail validation.

```json
{
  "podName": "feat-role-crud-20260215",
  "featureName": "Role CRUD",
  "featureKey": "role-crud",
  "generatedBy": "claude-sonnet-4",
  "generatedAt": "2026-02-15T10:30:00Z",
  "targetTicket": "CLAAS-142",
  "schemaVersion": "1.0",

  "scope": {
    "hasWebChanges": true,
    "hasApiChanges": true,
    "hasNewPermissionCodes": false,
    "hasRouteMapAddition": true,
    "affectedModules": ["security-kernel"]
  },

  "contractsUsed": [
    "@claas2saas/contracts/rbac",
    "@claas2saas/contracts/api",
    "@claas2saas/contracts/routes"
  ],

  "permissionCodesUsed": [
    "ROLE:CREATE",
    "ROLE:READ",
    "ROLE:UPDATE",
    "ROLE:DELETE"
  ],

  "newPermissionCodesDeclared": [],

  "routeMapAdditions": [
    {
      "key": "roleCreate",
      "path": "/roles/new",
      "requiredPermission": "ROLE:CREATE"
    }
  ],

  "immutablePathsTouched": [],

  "testCoverage": {
    "rbacMatrixTestsIncluded": true,
    "integrationTestsIncluded": true,
    "unitTestsIncluded": true,
    "coverageStatement": "All CRUD operations covered with positive and negative RBAC cases for each of the 5 canonical test personas."
  },

  "agentDeclarations": {
    "noLocalDtosDefined": true,
    "noRoleNameChecks": true,
    "noImmutablePathsModified": true,
    "noGlobalStateIntroduced": true,
    "allApiEndpointsAuthorized": true,
    "allPermissionsFromContracts": true,
    "griffelOnlyForStyling": true
  }
}
```

**All fields in `agentDeclarations` must be `true`.** A pod with any `false` value in `agentDeclarations` is rejected immediately without further validation. These declarations are verified programmatically — the agent's self-report is checked against static analysis results.

### 1.3 What a Pod MUST Include

- `MANIFEST.json` at the archive root.
- At least one of `web/` or `api/` directories.
- Tests in `tests/integration/` for every new endpoint or component.
- Tests in `tests/rbac-matrix/` for every permission code used.
- `routes/route-additions.ts` if the feature adds any UI route.

### 1.4 What a Pod MUST NOT Include

- Any file under the immutable paths listed in Section 5.2.
- Any new type definition that belongs in `packages/contracts/`.
- Any modification to existing test files (additions to test files are permitted; edits are not).
- Any modification to `RoutePermissionMap.ts` other than appending new entries.
- Any file outside the permitted contribution paths listed in Section 5.1.
- `node_modules/`, `.git/`, build artifacts, or compiled output.

---

## 2. Pod Intake Workflow

This workflow is deterministic. Every pod follows this exact path. Steps cannot be skipped, reordered, or combined.

### Step 1 — Pod Drop

The AI agent places the finished `tar.gz` archive in:

```
/feature-pods/inbox/feat-<name>-<YYYYMMDD>.tar.gz
```

No other location is monitored. The `inbox/` directory is the only valid entry point. The agent must not push to `main`, `develop`, or any application directory.

**Agent action:** Produce the archive. Verify it matches the naming convention. Drop it in `inbox/`. Report the filename and MANIFEST summary to the integration engineer.

**Validation trigger:** A GitHub Actions workflow (`pod-validate.yml`) is triggered on any push to `feature-pods/inbox/**`. Automated validation begins immediately.

### Step 2 — Unpack and Inventory

The CI workflow unpacks the archive to:

```
/feature-pods/staging/<pod-name>/
```

It then:
1. Verifies the archive was produced from a single root directory matching the filename.
2. Reads `MANIFEST.json` and validates all required fields.
3. Produces an inventory of all files in the pod.
4. Checks the inventory against the permitted and prohibited path lists.

**Failure:** Any file outside permitted paths → reject. Missing `MANIFEST.json` → reject. Malformed `MANIFEST.json` → reject.

### Step 3 — Contract Verification

The validation script `tools/validate/pod-contracts-check.ts` runs against the unpacked pod. It verifies:

1. Every `import` statement in the pod resolves to `@claas2saas/contracts/*` or a file within the pod itself. No imports from `packages/contracts/` internal paths. No imports from `apps/web/src/shell/`, `apps/web/src/auth/`, or any immutable path.
2. Every permission code string used in the pod exists in the `PermissionCode` static class / TypeScript union. Unknown strings fail.
3. `MANIFEST.json.permissionCodesUsed` exactly matches the permission codes found by static analysis. Missing codes or extra codes both fail.
4. `MANIFEST.json.newPermissionCodesDeclared` is empty. Declaring new permission codes in a pod is prohibited — new codes require a contracts package update via the standard ARB process.
5. All `agentDeclarations` are verified against static analysis. A `true` declaration that static analysis contradicts causes an immediate rejection with a detailed mismatch report.

**Failure:** Any contract violation → reject with detailed report.

### Step 4 — Type Check and Lint

```bash
pnpm turbo run typecheck --filter=<pod-web-scope>
pnpm turbo run lint --filter=<pod-web-scope>
dotnet build apps/api  # if API changes present
```

TypeScript strict mode. No suppressed errors. ESLint with full rule set from `.eslintrc.cjs`. Zero violations permitted. All custom rules (`no-hardcoded-colors`, `no-inline-styles`, `no-makestyles-in-component`, `require-permission-context`, `no-direct-fetch`) enforced.

**Failure:** Any type error → reject. Any ESLint error-level violation → reject.

### Step 5 — Security Checks

The security gate runs four checks:

1. **Forbidden import scan:** Scans for banned packages (`zustand`, `redux`, `@emotion/*`, `styled-components`, `lodash`, `moment`, `react-query` v3). Any match → reject.
2. **Role-name check scan:** Scans for `ClaimTypes.Role`, `user.roles`, `user.role ===`, `roles.includes(`. Any match → reject.
3. **Raw fetch scan:** Scans for `window.fetch(`, `fetch(`, `XMLHttpRequest`. Any match → reject.
4. **IgnoreQueryFilters scan (API pods):** Scans for `IgnoreQueryFilters()` in any C# file. Any match → reject.

**Failure:** Any security check match → reject with file and line reference.

### Step 6 — Test Execution

```bash
dotnet test --filter Category=pod-<feature-name>  # Backend tests
pnpm vitest run --reporter=verbose                 # Frontend tests (pod-scoped)
```

Tests must be tagged with the pod's feature name to run in isolation. The test runner executes only the tests included in the pod plus any RBAC matrix tests for permission codes the pod uses.

**Failure criteria:**
- Any test failure → reject.
- Frontend RBAC-related coverage below 80% → reject.
- Missing RBAC matrix test for any permission code in `MANIFEST.json.permissionCodesUsed` → reject.

### Step 7 — Bundle Impact Check

The bundle size gate measures the impact of the pod's frontend contribution on bundle sizes:

```bash
pnpm turbo run build --filter=web
tools/bundle-check.sh --pod-name=<name>
```

Checks:
- Shell bundle remains ≤ 100 KB gzipped.
- The pod's page chunk is ≤ 200 KB gzipped.
- Total application bundle remains ≤ 1.5 MB gzipped.

**Failure:** Any bundle limit exceeded → reject with size breakdown report.

### Step 8 — Accessibility Check

axe-core runs against a rendered snapshot of the pod's UI components.

```bash
pnpm axe:ci --pod=<feature-name>
```

**Failure:** Any WCAG 2.1 AA violation → reject with violation detail.

### Step 9 — Validation Report

The CI workflow posts a summary validation report as a PR comment. The report includes:
- Pass/fail status for each gate.
- File-level detail for any failures.
- Bundle size impact summary.
- Test coverage summary.
- RBAC matrix coverage confirmation.

If all gates pass, the report marks the pod as **READY FOR HUMAN REVIEW**. If any gate fails, the report marks the pod as **REJECTED** with the specific failure reasons.

### Step 10 — Human Review Gate

A human integration engineer reviews the validated pod in `staging/`. This review is mandatory regardless of validation results. The review checklist:

- [ ] Feature scope matches the assigned ticket.
- [ ] MANIFEST.json accurately describes the pod's content.
- [ ] No logic exists that approximates a permission bypass (clever code that technically passes static analysis but achieves the same effect).
- [ ] API response shapes follow the contract envelope pattern from `@claas2saas/contracts/api`.
- [ ] Error handling is consistent with the platform pattern (no silent swallowing, no raw error messages exposed to the client).
- [ ] UI loading states use `<PageSkeleton />` and Fluent `Skeleton` components — no raw spinners.
- [ ] Destructive operations have confirmation dialogs with explicit acknowledgment text.
- [ ] The RBAC matrix tests are substantive — they test actual permission enforcement, not just that the endpoint is reachable.

**Human reviewer has veto authority.** A pod that passes all automated gates can still be rejected by the human reviewer. Rejection reason must be documented in the PR comment for the AI agent to consume and revise.

### Step 11 — Promotion to Main

If the human review passes:

1. The engineer runs the promotion script:
   ```bash
   tools/scaffold/promote-pod.sh feat-<name>-<date>
   ```
2. The script copies the validated pod contents from `staging/` to their target paths in `apps/` and `tests/`.
3. The script appends the `routes/route-additions.ts` entries to `RoutePermissionMap.ts`.
4. A PR is created from the promotion branch targeting `main`.
5. The standard `ci.yml` PR gates run.
6. The pod archive is moved to `feature-pods/archive/` (never deleted — audit trail).

**The pod archive in `archive/` is permanent.** It serves as the audit trail for every AI-generated contribution, including the agent that generated it, the date, and the validation report.

---

## 3. Automated Validation Gates

This section provides the precise specification for each automated gate. CI configuration lives in `.github/workflows/pod-validate.yml`.

### Gate 1 — Forbidden Import Scan

**Tool:** `tools/validate/forbidden-imports.ts`  
**Checks all files in `web/` subdirectory of pod**

Banned patterns (ESLint `no-restricted-imports` equivalents, scanned as strings):

```
zustand, zustand/*, redux, @reduxjs/*, react-redux, jotai, recoil, mobx,
@fortawesome/*, styled-components, @emotion/*, tailwindcss, bootstrap,
@mui/*, material-ui, lodash, lodash/*, moment, jquery,
react-query (v3 only, detected by version check against package.json imports)
```

Any match in any `.ts` or `.tsx` file in the pod → gate fails.

### Gate 2 — Permission Literal Scan

**Tool:** `tools/validate/permission-literal-scan.ts`  
**Checks all files in the pod**

Scans for:
1. Any string literal matching the pattern `[A-Z_]+:[A-Z_]+` that is not a reference to `PermissionCode.*` or a value from `PERMISSION_CODES`. These are inline permission strings, which are banned.
2. Any `import` that references `packages/contracts/rbac/internal/PermissionCodes` directly (as opposed to the public export path).

Any match → gate fails with file, line, and matched literal.

### Gate 3 — RoutePermissionMap Validation

**Tool:** `tools/validate/route-map-check.ts`  
**Checks `routes/route-additions.ts` if present**

Validates:
1. Every entry in `route-additions.ts` has `path`, `label`, `icon`, `navSection`, `requiredPermission`, and `showInNav` fields.
2. `requiredPermission` is either `null` (public route) or a valid `PermissionCode` string from the catalog.
3. `icon` references a valid Fluent System Icon export name.
4. `path` does not conflict with any existing path in `RoutePermissionMap.ts`.
5. The `routeKey` in each addition is unique and uses camelCase.

Any failure → gate fails with specific field and rule violation.

### Gate 4 — Bundle Impact Check

**Tool:** `vite-bundle-analyzer` + `tools/bundle-check.sh`

Runs a production build of the web application with the pod's changes applied to `staging/`. Compares gzipped chunk sizes against the hard limits:

| Bundle | Hard Limit |
|---|---|
| Shell (main entry) | 100 KB gzipped |
| Any single page chunk | 200 KB gzipped |
| Total application | 1.5 MB gzipped |

Any limit exceeded → gate fails with the size breakdown by chunk.

### Gate 5 — Accessibility Check

**Tool:** `axe-core` (CI mode via `@axe-core/playwright`)

Renders the pod's page components using a headless browser against the development server. Runs axe accessibility checks against each rendered page.

Zero WCAG 2.1 AA violations permitted. Any violation → gate fails with rule ID, element selector, and remediation guidance.

### Gate 6 — RBAC Matrix Test Coverage

**Tool:** `dotnet test --filter Category=rbac-matrix`

Verifies:
1. A matrix test file exists for every permission code listed in `MANIFEST.json.permissionCodesUsed`.
2. Each test file contains at minimum:
   - One positive test per canonical persona that should have the permission.
   - One negative test per canonical persona that should not have the permission.
   - One cross-tenant isolation test.
3. All tests pass with test personas provisioned in the test environment.

Any missing test file, insufficient coverage, or test failure → gate fails.

---

## 4. Rejection Criteria

The following are hard failure cases. A pod exhibiting any of these characteristics is rejected without exception. There is no waiver process for these rules.

### Category A — Immutability Violations (Immediate Reject, No Review)

| Criterion | Reason |
|---|---|
| Pod modifies any file in `apps/web/src/shell/` | Shell is immutable. Owned by platform team only. |
| Pod modifies any file in `apps/web/src/auth/` | Auth providers are immutable. No feature pod may touch AuthContext, PermissionContext, MsalAuthProvider, or MockAuthProvider. |
| Pod modifies `packages/contracts/` | Contracts are immutable for feature pods. New codes require ARB-approved contracts PR. |
| Pod modifies `apps/api/src/Kernel.Domain/` | Domain layer is immutable. Value objects, entities, and domain events are platform-team owned. |
| Pod modifies `Program.cs`, `appsettings.json`, or any startup configuration | Application configuration is immutable for feature pods. |
| Pod modifies `vite.config.ts` | Build configuration is immutable for feature pods. |
| Pod modifies any existing test file | Existing tests must not be altered. New test files may be added. |
| Pod adds a `node_modules/` or new npm dependency | Dependency changes require ARB approval via a separate PR. |

### Category B — Security Violations (Immediate Reject)

| Criterion | Reason |
|---|---|
| Any endpoint missing `[Authorize(Policy = "...")]` | Every endpoint must have explicit authorization. No implicit permit. |
| Any controller or handler checks `ClaimTypes.Role` or `user.roles` | Role-name checks bypass `IPermissionEvaluator`. Banned. |
| Any permission string defined outside `packages/contracts/rbac` | All permission codes must come from the contracts package. |
| Any call to `IgnoreQueryFilters()` | Bypasses tenant isolation. Banned in application layer. |
| `IPermissionEvaluator` not called for any operation that modifies data | Every write must be gated by the evaluator. |
| Any DTO type defined locally instead of using contracts types | Creates drift from the contracts package and breaks cross-layer type safety. |
| `permLoading` guard missing from any component that renders permission-gated content | Unauthorized UI flash. P0 security UX invariant. |

### Category C — Architecture Violations (Reject with Report)

| Criterion | Reason |
|---|---|
| Pod introduces any global state library (zustand, redux, jotai, recoil) | Four-quadrant state model is the only approved approach. |
| Pod uses any styling method other than Griffel `makeStyles()` | Griffel is the only approved CSS authoring method. |
| Pod uses any non-Fluent UI component for interactive elements | Fluent v9 is the only approved component library. |
| Pod includes a `makeStyles()` call inside a component function body | Defeats Griffel's build-time optimization. Banned by ESLint. |
| Pod uses raw `fetch()` or `XMLHttpRequest` for API calls | All HTTP calls must use the Axios client. |
| Pod calls a React Query hook from a feature component (instead of a page component or page-local hook) | Violates component architecture. Feature components receive data via props. |
| `RoutePermissionMap.ts` entries removed or modified (additions only) | Route map is append-only. Removal requires ARB process. |
| NavRail, NavItem, AppLayout, or TopBar modified | Navigation shell is platform-owned. Feature pods must not touch it. |
| Pod imports from `apps/web/src/shell/` | Shell internals are not available to feature pods. Use public hooks and contracts. |

### Category D — Quality Gate Failures (Reject with Report)

| Criterion | Threshold |
|---|---|
| TypeScript compilation error | Any error |
| ESLint error-level violation | Any violation |
| RBAC matrix test missing | Any permission code without a matrix test |
| Integration test missing | Any new endpoint without an integration test |
| Test failure | Any failing test |
| Frontend RBAC module coverage | Below 80% |
| Bundle size violation | Shell > 100 KB, any page chunk > 200 KB, total > 1.5 MB |
| Accessibility violation | Any WCAG 2.1 AA violation |

---

## 5. Blast Radius Rules

These rules define the precise boundaries of what a feature pod may and must not modify. These boundaries are non-negotiable. They are enforced by the validation script. Violations cause automatic rejection.

### 5.1 Permitted Contribution Paths

A feature pod may contribute files to — and only to — the following paths:

```
apps/web/src/features/<new-feature-name>/**
  ↳ New feature slice. React components, hooks, styles, types local to the feature.
  ↳ MUST NOT use a name that conflicts with any existing feature directory.

apps/api/src/Kernel.Application/Features/<FeatureName>/Commands/**
apps/api/src/Kernel.Application/Features/<FeatureName>/Queries/**
  ↳ CQRS command and query handlers for the feature.
  ↳ Must follow existing handler patterns exactly.

apps/api/src/Kernel.Infrastructure/Repositories/<FeatureName>Repository.cs
  ↳ Single repository file. Must implement `I<FeatureName>Repository` interface.
  ↳ Interface lives in Kernel.Application, not Kernel.Infrastructure.

apps/api/src/Kernel.API/Controllers/<FeatureName>Controller.cs
  ↳ Single controller file. All endpoints must carry [Authorize(Policy=...)].
  ↳ Must inherit from the platform-defined ControllerBase extension.

tests/rbac-matrix/<feature-name>-matrix.cs
  ↳ RBAC matrix tests. Must use canonical test personas.

tests/integration/<feature-name>-integration.cs
  ↳ Integration tests. Must test happy path and error paths.

routes/route-additions.ts (in pod archive only)
  ↳ Specifies new ROUTE_MAP entries to be appended by the promotion script.
  ↳ The pod must NOT directly modify RoutePermissionMap.ts.
  ↳ The promotion script applies these additions atomically.
```

### 5.2 Immutable Paths — Feature Pods Must Not Touch

Any pod that modifies any file in these paths is rejected automatically. CODEOWNERS enforces this on all PRs. The pod validation script enforces this before human review.

```
apps/web/src/shell/**                    # App shell, routing, providers
apps/web/src/auth/**                     # Auth and permission providers
apps/web/src/shell/RoutePermissionMap.ts # Modified only by promotion script
packages/contracts/**                    # Contracts are immutable for pods
apps/api/src/Kernel.Domain/**            # Domain layer is platform-owned
apps/api/Program.cs                      # Application startup
apps/api/appsettings*.json               # Application configuration
vite.config.ts                           # Build configuration
.eslintrc.cjs                            # Linting configuration
tsconfig*.json                           # TypeScript configuration
.github/workflows/**                     # CI configuration
tools/**                                 # Internal tooling
docs/**                                  # Documentation (separate PR process)
```

### 5.3 Read-Only Paths (Consume, Never Modify)

Feature pods read from these paths to understand existing patterns and imports. They must not modify them.

```
packages/contracts/**
  ↳ Import from here. Never define types here from within a pod.

apps/web/src/components/**
  ↳ Use shared components. Never modify them from within a pod.

apps/web/src/hooks/**
  ↳ Use shared hooks (usePermission, useTenantId, etc.). Never modify from within a pod.

apps/api/src/Kernel.Domain/**
  ↳ Reference domain types. Never add entities, value objects, or domain events from within a pod.
```

---

## 6. Rollback Procedure

A feature pod that was successfully merged but is subsequently found to be defective must be rolled back cleanly. This procedure is deterministic and must be followed in order.

### 6.1 Decision Criteria for Rollback

Rollback is triggered when any of the following are confirmed post-merge:

- A security defect is found in the pod's code (unauthorized access path, information disclosure, etc.).
- A production bug that cannot be hot-fixed without modifying immutable platform code.
- The pod's RBAC behavior does not match the RBAC Permission Matrix.
- The pod has introduced a performance regression that exceeds the P99 SLO thresholds.

### 6.2 Rollback Steps

**Step 1 — Incident declaration.** The engineer declares an incident. The pod name and the defect description are recorded in the incident log.

**Step 2 — Revert PR creation.** GitHub's revert function is used on the pod's merge commit:

```bash
git revert <pod-merge-commit-sha> --no-edit
git push origin revert/feat-<name>-<date>
```

A PR is opened from the revert branch targeting `main`. This PR bypasses pod validation (it is a revert, not a new pod) but requires a Principal Engineer approval.

**Step 3 — RoutePermissionMap cleanup.** If the pod added route entries, the revert removes them from `RoutePermissionMap.ts` (the promotion script's additions are reverted as part of the revert commit).

**Step 4 — Cache invalidation.** If the pod introduced new permission codes that were assigned to users before rollback, `IPermissionEvaluator` cache entries for affected permission codes must be flushed:

```bash
tools/ops/flush-permission-cache.ps1 --codes "PERMISSION:CODE1,PERMISSION:CODE2"
```

**Step 5 — Dataverse cleanup.** If the pod created new Dataverse records (new role definitions, new module registrations), these must be deactivated — not deleted — via the admin UI or a migration script. Deletion of Dataverse records requires a separate ARB-approved data operation.

**Step 6 — Archive update.** The pod archive in `feature-pods/archive/` is updated with a `ROLLBACK.json` file documenting the incident, the rollback commit SHA, and the date. The original archive is never deleted.

**Step 7 — AI agent notification.** The integration engineer provides the defect report to the AI agent responsible for the pod so it can produce a corrected revision.

### 6.3 Post-Rollback Validation

After the revert PR merges, the full CI suite (`ci.yml`) must pass. The RBAC matrix tests must confirm the reverted permission codes no longer produce `200 OK` for the positive cases.

---

## 7. Multi-Claude Operational Guidance

This section governs the safe operation of multiple Claude instances generating features in parallel for the CLaaS2SaaS platform. It is written for integration engineers managing the multi-agent environment.

### 7.1 Core Safety Principles

**Each Claude instance owns exactly one feature at a time.** An agent must not generate code for two features simultaneously. If an agent produces an archive that contains changes for more than one feature slice (detectable by inspection of the `web/src/features/` directory containing more than one new directory), the archive is rejected.

**Agents do not share context between invocations.** Every Claude instance starts from the provided context documents. No agent assumes that another agent's work has already been merged. If Feature B depends on Feature A, Feature A must be merged first, and the Claude instance generating Feature B must be started after Feature A's merge is confirmed.

**Agents do not modify contracts.** The contracts package (`packages/contracts/`) is the shared source of truth. No agent modifies it. Permission code additions require a human-authored contracts PR that is merged before any agent work that depends on the new codes begins.

### 7.2 Context Package — What Every Agent Must Receive

Before a Claude instance begins feature generation, the integration engineer must provide it with the following documents as context. Providing partial context produces non-compliant output.

**Required context documents:**

| Document | Path | Purpose |
|---|---|---|
| Frontend Standards | `docs/standards/frontend-standards.md` | TypeScript, React, Griffel, RBAC UI rules |
| Coding Constitution | `docs/standards/coding-constitution.md` | Immutable rules for all code |
| Golden Contracts | `packages/contracts/README.md` | Permission codes, API shapes, route types |
| RBAC Permission Matrix | `architecture/security/rbac-permission-matrix.md` | Role definitions, permission catalog |
| This Playbook | `docs/feature-pods/integration-playbook.md` | Pod packaging and intake rules |
| Scaffold Specification | `architecture/scaffold-specification.md` | Monorepo structure and ownership |
| Frozen Skeleton | `architecture/frozen-skeleton.md` | Current file tree and immutable paths |
| Feature Ticket | `<ticket-URL-or-content>` | Specific feature requirements |

**Optional but recommended:**

- The most recently merged pod archive from `feature-pods/archive/` as a worked example.
- The RBAC matrix test file format example from `tests/rbac-matrix/example-matrix.cs`.

### 7.3 Agent Task Prompt Requirements

The prompt given to each Claude instance must contain:

1. **Feature description:** What the feature does in plain language.
2. **Target ticket:** The ticket ID the feature addresses.
3. **Permission codes to use:** The exact `PermissionCode` strings the feature will require (from the contracts package). Do not ask the agent to determine which permissions to use — provide them explicitly.
4. **Route key and path:** The exact `RouteKey` and URL path for any new UI route.
5. **API endpoint spec:** The request and response shapes the API must implement, using contract types.
6. **Explicit instruction:** "Produce a `tar.gz` archive named `feat-<name>-<YYYYMMDD>.tar.gz` containing exactly the files for this feature. Do not modify any file outside the permitted contribution paths."

### 7.4 Parallelism Rules

**Maximum concurrent agents:** Four Claude instances may run simultaneously. Beyond four, the human review bottleneck at Step 10 exceeds engineering capacity and creates merge conflict risks.

**Feature dependency ordering:** Before starting a new agent, confirm that:
1. All features the new feature depends on are merged to `main`.
2. The context documents provided to the agent reflect the current `main` state (not a stale copy).

**ROUTE_MAP conflict prevention:** Each agent is given a unique `RouteKey` prefix for its feature. No two agents operating in parallel may target the same URL path prefix. The integration engineer assigns `RouteKey` values from a tracking sheet before dispatching agents.

**Permission code freeze:** While agents are in flight, no changes to `packages/contracts/rbac/index.ts` are merged. A contracts change mid-flight invalidates all in-progress agent work for features that use the affected codes. Schedule contracts changes between agent batches.

### 7.5 Quality Control Patterns for Multi-Agent Output

**Do not assume the agent's self-assessment is accurate.** Run the full validation pipeline (`pod-validate.yml`) on every archive before human review, even if the agent's output appears correct. Agents can produce syntactically valid code that fails semantic validation.

**Verify MANIFEST.json against the archive contents.** The promotion script reads `MANIFEST.json` — if the manifest claims the pod has no API changes but the archive contains `api/` files, the manifest is wrong and the pod must be revised.

**Check for agent-to-agent contamination.** If two agents run in the same session context or share files, one agent may inadvertently include the other agent's output in its archive. The forbidden-path scan catches most contamination, but review the file inventory manually for any unexpected files.

**Reject and re-generate rather than manually patching.** If a pod fails validation on a substantive issue (not a minor documentation correction), reject the pod entirely and re-run the agent with a corrected prompt. Manual patching of agent output creates an audit gap — the archive no longer represents the agent's actual output.

### 7.6 Agent Communication Protocol

After an agent produces an archive, it must provide a structured handoff report to the integration engineer containing:

1. The archive filename.
2. A summary of `MANIFEST.json` fields.
3. A list of every file created, with a one-line description of its purpose.
4. Explicit confirmation of every `agentDeclarations` field.
5. Any assumptions made that were not covered by the context documents (these may require engineer review before validation).
6. Any areas of uncertainty where the agent was not confident in its implementation choices.

The integration engineer reads this report before dropping the archive in `inbox/`. If the report contains unexplained assumptions or uncertainty about permission codes or API contracts, clarification is sought before proceeding.

### 7.7 Revision Loop

If a pod is rejected, the revision loop is:

1. The integration engineer reads the full validation report from the PR comment.
2. The engineer compiles the rejection reasons into a structured revision prompt.
3. The agent is re-invoked with the original context documents plus the rejection report.
4. The agent produces a new archive with a new date-stamped filename.
5. The original rejected archive remains in `inbox/` (renamed to `<name>.rejected`) for audit purposes.
6. The new archive goes through the full validation pipeline as a new pod.

Maximum three revision cycles before escalating to a human engineer to produce the feature manually. Repeated failures from an AI agent on the same feature suggest either an underspecified prompt or a feature that is too complex for the current agent context window.

---

*This document is maintained by the CLaaS2SaaS Platform Engineering team. Changes require a Principal Engineer review and a documented ADR. AI agents must be re-contextualized with the latest version of this document when the version number changes. Version history is maintained in Git.*
