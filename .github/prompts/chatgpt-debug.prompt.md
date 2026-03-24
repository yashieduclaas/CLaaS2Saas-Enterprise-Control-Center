# ChatGPT Debug Diagnosis Prompt — ECC-Kernel Deterministic Debug Protocol (Step 5)

> **What this is:** The structured debug diagnosis template used at Step 5 of the ECC-Kernel deterministic debug protocol — when a developer has an isolated, reproducible test failure and needs GPT-assisted root cause analysis.
>
> **When to use:** After you have (1) isolated a specific failing test, (2) collected the complete stack trace, (3) confirmed the failure is reproducible, and (4) identified a code snippet of at most 30 lines showing the relevant implementation. Do not use for vague failures, intermittent issues, or compilation errors.

---

## Developer Input — What to Include

1. **The exact failing test name** — full namespace and method name.
2. **The complete stack trace** — do not truncate.
3. **A code snippet of at most 30 lines** showing the relevant implementation (the handler, repository, or controller method the test exercises).
4. **The environment** — `unit test` (Moq), `integration test` (WebApplicationFactory), or `production`.

---

## Prompt Body — Submit This to the ECC Custom GPT

```
You are performing a structured debug diagnosis for the ECC-Kernel codebase. ECC-Kernel is the
centralized security control plane for the CLaaS2SaaS platform, built with Clean Architecture
(.NET 10, EF Core 9, MediatR, React 18, Azure SQL, Microsoft Entra ID). Refer to the Tech Stack
Knowledge Base for version details.

I have an isolated, reproducible test failure. Here are the details:

FAILING TEST: [PASTE FULL TEST NAME]
ENVIRONMENT: [unit test / integration test / production]

STACK TRACE:
[PASTE COMPLETE STACK TRACE]

RELEVANT CODE (max 30 lines):
[PASTE CODE SNIPPET]

Follow this diagnostic protocol in order:

**STEP 1 — Known Pattern Check**
Check the failure against the ECC-Kernel known failure pattern library:

PAT-001: Mock setup returns null when test expects a populated object — missing
  .ReturnsAsync() on a mock repository method the handler calls.
PAT-002: Domain exception type mismatch — test asserts PermissionDeniedException but
  handler throws ResourceNotFoundException (or vice versa). Usually a guard clause
  using the wrong exception type.
PAT-003: IAuditQueue.Enqueue verification fails — handler does not call Enqueue, or calls
  it with the wrong EntityType/ActionType, or calls it before the database write succeeds.
PAT-004: EF Core query filter interference — test expects a record returned but global
  query filter on deleted_flag excludes it. Check if test data has DeletedFlag = true.
PAT-005: Async deadlock — .Result or .Wait() in a handler causes deadlock in the test
  runner's synchronization context.
PAT-006: Null reference on User.FindFirst("oid") — the controller integration test does
  not set up the ClaimsPrincipal with an "oid" claim.
PAT-007: FluentValidation pipeline behaviour not registered — validator exists but MediatR
  pipeline behaviour is not registered in DI, so validation never runs.
PAT-008: Constructor parameter order mismatch — test creates the handler with mock
  dependencies in the wrong order.
PAT-009: MediatR handler not registered — handler exists but ISender.Send() throws
  because the handler is not registered in the DI container (integration test issue).
PAT-010: IPermissionEvaluator mock returns wrong result — test mocks Evaluate() to return
  Allow but the handler expects a specific EvaluationResult shape with permission flags.
PAT-011: EF Core projection mismatch — repository uses .Select() projection but the test
  expects a full entity to be returned, or the projection omits a field the handler needs.
PAT-012: CancellationToken not propagated — handler method accepts CancellationToken but
  does not pass it to EF Core async calls, causing different execution behavior in tests.
PAT-013: Zod schema validation failure on frontend — API response shape changed but the
  Zod schema in the frontend was not updated to match.

**STEP 2 — Root Cause Analysis**
If no known pattern matches, reason from the stack trace and code. Return top three most
likely root causes with confidence percentages (sum to 100% or less).

1. [Root cause] — [confidence]%
2. [Root cause] — [confidence]%
3. [Root cause] — [confidence]%

**STEP 3 — Minimal Patch**
Propose a minimal patch with a hard limit of 10 lines changed. Show as unified diff:
- File path
- Lines to remove (prefixed with -)
- Lines to add (prefixed with +)

If the fix requires more than 10 lines:
ARCHITECTURAL ISSUE: The root cause requires structural changes beyond a 10-line patch.
The likely fix involves [description]. Recommend returning to PLAN mode to re-scope.

**STEP 4 — Architecture Safety Check**
Verify the proposed patch does not violate any ECC-Kernel architecture rule:
- Does it introduce a Clean Architecture layer violation?
- Does it skip or modify an IAuditQueue.Enqueue call?
- Does it introduce string concatenation in a SQL query or bypass EF Core?
- Does it remove or bypass an [Authorize(Policy = ...)] attribute?
- Does it expose PII in a log statement?
- Does it modify a frozen artifact?
- Does it bypass IPermissionEvaluator?
- Does it introduce a banned npm package?

Return: ARCHITECTURE SAFE — no rule violations detected
Or: ARCHITECTURE WARNING — [description of potential violation]

**STEP 5 — Validation Command**
Provide the exact validation command:
dotnet test --filter [TestClassName.TestMethodName]

List any additional tests to run to confirm no regression.
```

---

## Post-Diagnosis Instructions

1. If a minimal patch (≤10 lines) was proposed and marked ARCHITECTURE SAFE, proceed to the **Copilot Fix prompt** (`.github/prompts/copilot-fix.prompt.md`).
2. If an ARCHITECTURAL ISSUE was flagged, return to PLAN mode to re-scope.
3. If an ARCHITECTURE WARNING was returned, consult the Engineering Lead before applying.
