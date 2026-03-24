# Gate 3 — ChatGPT Architecture Review Prompt

> **What this is:** The mandatory Gate 3 architecture review prompt template. After Copilot generates code and the developer has passed Gate 1 (automated checks: build, test, lint) and Gate 2 (manual scan), this template is submitted to the ECC Custom GPT Decision Engine with the git diff attached. The GPT performs the formal architecture review and returns a structured PASS or FAIL result that must be recorded in the PR.
>
> **When to use:** After Gate 1 and Gate 2 have passed. Never before — submitting unbuilt or untested code for architecture review wastes a review cycle and dilutes the GPT's effectiveness.

---

## Developer Instructions — What to Include

Before submitting this prompt to the ECC Custom GPT, prepare the following:

1. **The complete unified git diff** of all changed files. Generate with `git diff main..HEAD --unified=5` to include 5 lines of context around each change. Do not truncate the diff — the GPT needs the full context to evaluate layer boundaries and cross-file interactions.

2. **The FEAT-ID** being implemented (e.g., `FEAT-012`).

3. **The T-NNN task ID** within that feature (e.g., `T-003`).

Paste these three items into the GPT session after the prompt below.

---

## Prompt Body — Submit This to the ECC Custom GPT

```
You are performing a Gate 3 Architecture Review for the Enterprise Control Center (ECC) codebase. ECC is a centralized RBAC control plane built on React 18, ASP.NET Core 8, Microsoft SQL Server, and Microsoft Entra ID, serving the CLaaS2SaaS platform.

I am submitting the git diff for FEAT-ID: [PASTE FEAT-ID] / TASK-ID: [PASTE TASK-ID].

Evaluate the attached diff against the following six review categories. For each category, examine every changed file and every changed line. Do not skip files. Do not assume compliance — verify it.

**CATEGORY 1 — Layer Boundary Violations**
Verify that the three-layer architecture (Controller → Service → Repository) is maintained with zero exceptions. Specifically check:
- No controller file imports a repository namespace (Rule: Controllers talk to services, never directly to repositories)
- No service file imports Microsoft.AspNetCore.Http (Rule: Services are HTTP-unaware; identity context arrives as parameters)
- No repository file contains if/else business logic (Rule: Repositories translate data; decisions belong in services)
- No DTO calls any service or repository method (Rule: DTOs are data containers only)
- No React component calls fetch() directly (Rule: All API calls go through service modules in src/ECC.UI/services/)

**CATEGORY 2 — Error Handling**
Verify that all exceptions are thrown as AppException with the correct error code:
- IDENTITY_NOT_FOUND for missing user records
- INSUFFICIENT_AUTHORITY for permission failures
- VALIDATION_FAILED for input validation failures
- ROLE_ALREADY_ACTIVE for duplicate state conflicts
- DATABASE_ERROR for SqlException wrappers
Verify that no System.Exception, InvalidOperationException, or ArgumentException is thrown from service methods.

**CATEGORY 3 — Security Violations**
Verify that every security rule is enforced:
- [Authorize] attribute present on every protected controller action
- No PII (email, display name, Entra Object ID, JWT token, SQL query) in any log statement
- All SQL queries use SqlCommand.Parameters exclusively — zero string interpolation or concatenation with variable values
- All request DTOs have a FluentValidation AbstractValidator
- No custom JWT parsing code (Microsoft.Identity.Web handles all validation)

**CATEGORY 4 — Audit Event Dispatch**
Verify that IEventDispatcher.Dispatch is called after every state-changing service operation. State-changing operations include: role assignment, role revocation, user provisioning, permission modification, module registration, and any operation that writes to the database. Missing dispatch calls break the audit trail.

**CATEGORY 5 — PROMPT-ID Headers**
Verify that every AI-generated file includes the PROMPT-ID header block immediately after the namespace declaration or file-level imports:
// FEAT-ID, TASK-ID, PROMPT-ID, Generated date, ChatGPT REVIEW status
Files missing this header must be flagged.

**CATEGORY 6 — JWT Handling**
Verify that:
- Entra Object ID is extracted exclusively via User.FindFirst("oid").Value in controllers
- No manual JWT decoding (JwtSecurityTokenHandler or similar) appears anywhere
- No raw Authorization header access in controllers or services
- Token acquisition in React uses useMsalAuthentication hook, not manual fetch with Bearer tokens

**OUTPUT FORMAT**

Begin your response with exactly one of these lines:

REVIEW RESULT: PASS

or

REVIEW RESULT: FAIL

If FAIL, provide a findings table with the following columns:

| File:Line | Rule-ID | Description | Severity |
|-----------|---------|-------------|----------|
| [file path]:[line number] | [Category]-[Number] | [What is wrong and what the correct pattern should be] | Critical / High / Medium |

Severity definitions:
- Critical: Security vulnerability, SQL injection risk, missing authorization, PII exposure. Blocks merge.
- High: Architecture violation, missing audit dispatch, wrong error code. Blocks merge.
- Medium: Naming convention violation, missing documentation, minor pattern deviation. Does not block merge but must be addressed before the next review cycle.

If PASS, confirm that all six categories were evaluated and no violations were found.
```

---

## Post-Review Instructions

**On PASS:** Record the review timestamp in the PR description:
```
REVIEW PASS: [YYYY-MM-DD HH:MM UTC]
```
Update the PROMPT-ID header in each generated file to change `ChatGPT REVIEW: PENDING` to `ChatGPT REVIEW: PASS [timestamp]`. Proceed to PR merge.

**On FAIL:** Address every Critical and High severity finding. Medium findings should be addressed if practical but do not block resubmission. After fixes are applied, re-run Gate 1 (build, test, lint) and Gate 2 (manual scan), then resubmit the updated diff to the GPT using this same template. Record the re-review in the PR description:
```
REVIEW FAIL: [first review timestamp]
REVIEW RESUBMIT: [resubmission timestamp]
REVIEW PASS: [final pass timestamp]
```
