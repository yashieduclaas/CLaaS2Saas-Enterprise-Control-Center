# Copilot Minimal Fix Prompt — Post-Debug Patch Application

> **What this is:** The Copilot agent fix template applied after a developer has received a GPT debug diagnosis with a specific patch of 10 lines or fewer. This prompt constrains Copilot to applying only the prescribed patch — no more, no less.
>
> **When to use:** Only after completing the ChatGPT Debug Diagnosis (`.github/prompts/chatgpt-debug.prompt.md`) and receiving a minimal patch proposal marked ARCHITECTURE SAFE.

---

## Developer Input — What to Include

1. **The failing test method name** — the exact test the patch is intended to fix.
2. **The exact patch proposed by the GPT** — copy the unified diff output verbatim. Do not modify or paraphrase it.
3. **The architecture safety check result** — copy the ARCHITECTURE SAFE confirmation (or ARCHITECTURE WARNING with description).

---

## Prompt Body — For Copilot

```
Apply the following patch exactly as specified. This patch was proposed by the ECC-Kernel
Custom GPT debug diagnosis and has been verified as ARCHITECTURE SAFE.

FAILING TEST: [PASTE FAILING TEST METHOD NAME]

PROPOSED PATCH:
[PASTE THE EXACT UNIFIED DIFF FROM GPT DIAGNOSIS]

ARCHITECTURE SAFETY CHECK:
[PASTE THE ARCHITECTURE SAFE / ARCHITECTURE WARNING RESULT]

Instructions:
1. Apply ONLY the specified changes to the specified file(s). Do not modify any other files.
2. Do NOT modify any test files. The fix goes into the implementation, not the test.
3. Do NOT make any additional changes beyond the specified patch — even if you see other
   improvements. Those belong in a separate Refactor phase task.
4. Do NOT introduce new imports or using statements not in the original file unless the
   patch explicitly adds them.
5. After applying the patch, run the validation command below and report the result.

VALIDATION COMMAND:
dotnet test --filter [PASTE TEST CLASS OR METHOD NAME FROM DIAGNOSIS]
```

---

## Hard Constraints

**10-line maximum change.** If the patch exceeds 10 lines of modification (additions + deletions), do not apply it — return to the developer with a message that the patch exceeds the limit and may require re-scoping.

**No test file modifications.** If the test needs to change, that is a Red phase activity.

**No Clean Architecture layer violations.** The patch must not introduce: Kernel.API importing Kernel.Infrastructure, Kernel.Domain referencing EF Core, DbContext in a controller, more than 5 lines of logic in a controller action, bypass of IPermissionEvaluator, bypass of IAuditQueue, fetch() or axios in a React component, useEffect + fetch pattern, role name string comparison, banned npm package, modification of a frozen artifact.

**No new dependencies.** The patch must not add NuGet packages, npm packages, or project references unless the diff explicitly includes them.

**Architecture safety compliance.** If the diagnosis returned ARCHITECTURE WARNING, do not apply the patch. Return: *"The architecture safety check returned a warning: [description]. This patch should not be applied without Engineering Lead review."*

---

## Post-Fix Verification

**If all target tests pass:** Report success and confirm the patch was applied exactly as specified.

**If any target test still fails:** Report the test output. Do not attempt a second fix — return to the ChatGPT Debug Diagnosis with the updated failure information.

**If the patch causes other tests to regress:** Report which tests regressed. Roll back the patch and notify the developer.
