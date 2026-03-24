# ChatGPT Debug Diagnosis Prompt — ECC Deterministic Debug Protocol (Step 5)

> **What this is:** The structured debug diagnosis template used at Step 5 of the ECC deterministic debug protocol — when a developer has an isolated, reproducible test failure and needs GPT-assisted root cause analysis.
>
> **When to use:** After you have (1) isolated a specific failing test, (2) collected the complete stack trace, (3) confirmed the failure is reproducible by running the test at least twice with the same result, and (4) identified a code snippet of at most 30 lines showing the relevant implementation. Do not use this template for vague failures, intermittent issues, or compilation errors — those require different diagnostic approaches.

---

## Developer Input — What to Include

Before submitting this prompt to the ECC Custom GPT, prepare the following:

1. **The exact failing test name** — full namespace and method name (e.g., `ECC.API.Tests.Services.Identity.RoleAssignmentServiceTests.AssignRole_UserNotFound_ThrowsIdentityNotFoundException`).

2. **The complete stack trace** — do not truncate. Truncated stack traces hide the root cause in the omitted frames, forcing the GPT to guess rather than diagnose.

3. **A code snippet of at most 30 lines** showing the relevant implementation. This should be the method the test is exercising, not the entire file. Include the method signature, the relevant logic, and the line where the failure appears to originate.

4. **The environment** where the failure occurs: `unit test` (running via `dotnet test` with Moq dependencies), `integration test` (running against a test database), or `production` (observed in deployed environment).

Paste these four items into the GPT session after the prompt below.

---

## Prompt Body — Submit This to the ECC Custom GPT

```
You are performing a structured debug diagnosis for the Enterprise Control Center (ECC) codebase. ECC is a centralized RBAC control plane built on React 18, ASP.NET Core 8, Microsoft SQL Server, and Microsoft Entra ID.

I have an isolated, reproducible test failure. Here are the details:

FAILING TEST: [PASTE FULL TEST NAME]
ENVIRONMENT: [unit test / integration test / production]

STACK TRACE:
[PASTE COMPLETE STACK TRACE]

RELEVANT CODE (max 30 lines):
[PASTE CODE SNIPPET]

Follow this diagnostic protocol in order:

**STEP 1 — Known Pattern Check**
Before reasoning from first principles, check the failure against the ECC known failure pattern library. If the failure matches a known pattern, cite it and proceed to the fix.

PAT-001: Mock setup returns null when the test expects a populated object — caused by missing .ReturnsAsync() setup on a mock method that the implementation calls.
PAT-002: AppException error code mismatch — test asserts one error code but the service throws a different one. Usually caused by a guard clause using the wrong error code constant.
PAT-003: IEventDispatcher.Verify fails — the implementation does not call Dispatch, or calls it with the wrong event type, or calls it before the database operation completes (so it dispatches even on failure).
PAT-004: SqlCommand.Parameters mismatch — the parameter name in AddWithValue does not match the @parameter name in the SQL string.
PAT-005: Async deadlock — .Result or .Wait() in a service method causes a deadlock in the test runner's synchronization context.
PAT-006: Null reference on User.FindFirst("oid") — the controller test does not set up the ClaimsPrincipal with an "oid" claim.
PAT-007: FluentValidation not triggered — the validator is defined but not registered in the DI container, so raw ModelState is used instead.
PAT-008: Constructor parameter order mismatch — the test creates the SUT with mock dependencies in the wrong order, so the service receives the wrong mock for each dependency.
PAT-009: SqlDataReader ordinal out of range — the SELECT column list does not match the reader.GetOrdinal("ColumnName") calls in the mapping code.
PAT-010: Test isolation failure — a shared mock state from a previous test bleeds into the current test because the mock was not reset or the test class does not create a fresh SUT per test.

**STEP 2 — Root Cause Analysis**
If the failure does not match a known pattern, reason from the stack trace and code to identify the root cause. Return the top three most likely root causes with confidence percentages. Confidence percentages must sum to 100% or less — if the evidence is ambiguous, it is better to have low confidence across multiple hypotheses than to overstate confidence in one.

Format:
1. [Root cause description] — [confidence]%
2. [Root cause description] — [confidence]%
3. [Root cause description] — [confidence]%

**STEP 3 — Minimal Patch**
Propose a minimal patch with a hard limit of 10 lines changed. Show the patch as a unified diff format:
- File path
- Lines to remove (prefixed with -)
- Lines to add (prefixed with +)

If the real fix requires more than 10 lines of change, do NOT propose a partial patch. Instead, return:

ARCHITECTURAL ISSUE: The root cause requires structural changes beyond a 10-line patch. The likely fix involves [description]. Recommend returning to PLAN mode to re-scope this task as [suggested new task description].

**STEP 4 — Architecture Safety Check**
Verify that the proposed patch does not violate any ECC architecture rule. Specifically check:
- Does the patch introduce a layer boundary violation? (Controller importing repository, service importing HttpContext, etc.)
- Does the patch skip or modify an IEventDispatcher.Dispatch call?
- Does the patch introduce string concatenation in a SQL query?
- Does the patch remove or bypass an [Authorize] attribute?
- Does the patch expose PII in a log statement?

Return: ARCHITECTURE SAFE — no rule violations detected
Or: ARCHITECTURE WARNING — [description of potential violation]

**STEP 5 — Validation Command**
Provide the exact validation command to verify the fix:

dotnet test --filter [TestClassName.TestMethodName]

If additional tests should be run to confirm no regression, list them as well.
```

---

## Post-Diagnosis Instructions

After receiving the GPT's diagnosis:

1. If a minimal patch (≤10 lines) was proposed and marked ARCHITECTURE SAFE, proceed to the **Copilot Fix prompt** (`.github/prompts/copilot-fix.prompt.md`) to apply the patch.

2. If an ARCHITECTURAL ISSUE was flagged, return to PLAN mode with the Custom GPT to re-scope the task before attempting any code changes.

3. If an ARCHITECTURE WARNING was returned, consult the Engineering Lead before applying the patch.
