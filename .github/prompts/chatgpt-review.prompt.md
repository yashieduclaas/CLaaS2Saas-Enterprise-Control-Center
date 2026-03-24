# Gate 3 — ChatGPT Architecture Review Prompt

> **What this is:** The mandatory Gate 3 architecture review prompt template. After Copilot generates code and the developer has passed Gate 1 (automated checks: build, test, lint) and Gate 2 (manual scan), this template is submitted to the ECC Custom GPT with the git diff attached. The GPT performs the formal architecture review and returns a structured PASS or FAIL result.
>
> **When to use:** After Gate 1 and Gate 2 have passed. Never before.

---

## Developer Instructions — What to Include

1. **The complete unified git diff** — `git diff main..HEAD --unified=5`. Do not truncate.
2. **The FEAT-ID** (e.g., `FEAT-012`).
3. **The T-NNN task ID** (e.g., `T-003`).

---

## Prompt Body — Submit This to the ECC Custom GPT

```
You are performing a Gate 3 Architecture Review for the ECC-Kernel codebase. ECC-Kernel is the
centralized security control plane for the CLaaS2SaaS platform, built with Clean Architecture
(.NET 10, React 18, EF Core, Azure SQL, Microsoft Entra ID). Refer to the Tech Stack Knowledge
Base for all technology and version details.

I am submitting the git diff for FEAT-ID: [PASTE FEAT-ID] / TASK-ID: [PASTE TASK-ID].

Evaluate the attached diff against the following seven review categories. For each category,
examine every changed file and every changed line. Do not skip files. Do not assume compliance.

**CATEGORY 1 — Clean Architecture Layer Violations**
Verify the four-project dependency rule is maintained:
- No file in Kernel.API imports from Kernel.Infrastructure (controllers must go through
  Kernel.Application via MediatR)
- No file in Kernel.Domain references EF Core, ASP.NET, or any infrastructure package
- No DbContext injection in Kernel.API controllers (only ISender)
- No file in Kernel.Application references Kernel.Infrastructure
- Controller actions have maximum 5 lines of orchestration
- No React component calls fetch() or axios directly (all calls through src/api/ modules)
- No useEffect + fetch pattern (use React Query useQuery hooks)

**CATEGORY 2 — Authorization Compliance**
- Every protected controller action carries [Authorize(Policy = PermissionCode.XxxYyy)]
  (bare [Authorize] alone is insufficient)
- No User.IsInRole() calls anywhere
- IPermissionEvaluator is called in handlers before any state-changing database operation
- Permission cache key uses solution_module_pid (integer), not module_code (string)
- Frontend permission gating uses usePermission(PermissionCode.XxxYyy) hook, never role
  name string comparison

**CATEGORY 3 — Exception Handling and Error Codes**
- All exceptions are domain exceptions: PermissionDeniedException (403),
  ResourceNotFoundException (404), ValidationException (400), ConflictException (409)
- No System.Exception, InvalidOperationException, or ArgumentException thrown from handlers
- All responses use ApiResponseFactory.Create(result)
- No stack traces in API responses in any environment

**CATEGORY 4 — Security Violations**
- No PII (email, display name, Entra Object ID, JWT token, SQL query) in any log statement
- All database access uses EF Core LINQ or parameterized queries — zero string
  concatenation or interpolation with variable values, no SELECT *
- All MediatR commands have FluentValidation validators enforcing SecurityDB column constraints
- No custom JWT parsing code (Microsoft.Identity.Web handles all validation)
- No secrets in source control (no connection strings, API keys, hash values)
- Handoff token code sets is_used = 1 before validation (TOCTOU protection)
- No [AllowAnonymous] on endpoints reading or mutating SecurityDB data (only GET /health)
- EF Core global query filters for deleted_flag are present on all entities except audit tables
- No UPDATE or DELETE on audit_sessions or audit_action_logs

**CATEGORY 5 — Audit Trail Completeness**
- IAuditQueue.Enqueue is called after every state-changing handler operation
- Audit entry includes action_type, entity_type, entity_pid, old_value, new_value
- audit_sessions records are created for login attempts (success and failure)
- No audit enqueue before the database write succeeds (avoid phantom audit records)
- No audit enqueue call on operation failure paths

**CATEGORY 6 — PROMPT-ID Headers**
- Every AI-generated file includes the PROMPT-ID header block immediately after the
  namespace declaration or file-level imports
- Files missing this header must be flagged

**CATEGORY 7 — Frontend Security and Patterns**
- All styling uses Griffel makeStyles() with Fluent tokens.* (no hardcoded values,
  no banned CSS libraries)
- Server state managed by React Query only (no useEffect + fetch)
- No banned npm packages (styled-components, @emotion/*, tailwindcss, zustand, redux, etc.)
- No localStorage for JWT tokens
- No dangerouslySetInnerHTML
- Unauthorized content renders null (not hidden via CSS, not disabled)
- Feature-flagged components render null when disabled (not a placeholder)
- DTOs validated by Zod at API boundary before use in component state

**OUTPUT FORMAT**

Begin your response with exactly one of:

REVIEW RESULT: PASS

or

REVIEW RESULT: FAIL

If FAIL, provide a findings table:

| File:Line | Rule-ID | Description | Severity |
|-----------|---------|-------------|----------|

Severity definitions:
- Critical: Security vulnerability, SQL injection risk, missing authorization, PII exposure,
  audit gap, TOCTOU violation. Blocks merge.
- High: Architecture layer violation, missing audit dispatch, wrong exception type, banned
  package, frozen artifact modification. Blocks merge.
- Medium: Naming convention violation, missing documentation, minor pattern deviation.
  Does not block merge but must be addressed before the next review cycle.

If PASS, confirm that all seven categories were evaluated and no violations were found.
```

---

## Post-Review Instructions

**On PASS:** Record the review timestamp in the PR description. Update the PROMPT-ID header in each generated file to change `ChatGPT REVIEW: PENDING` to `ChatGPT REVIEW: PASS [timestamp]`. Proceed to PR merge.

**On FAIL:** Address every Critical and High severity finding. Re-run Gate 1 and Gate 2, then resubmit the updated diff. Record all review cycles in the PR description with timestamps.
