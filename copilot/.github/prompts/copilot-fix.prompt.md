# Copilot Minimal Fix Prompt — Post-Debug Patch Application

> **What this is:** The Copilot agent fix template applied after a developer has received a GPT debug diagnosis with a specific patch of 10 lines or fewer. This prompt constrains Copilot to applying only the prescribed patch — no more, no less.
>
> **When to use:** Only after completing the ChatGPT Debug Diagnosis (`.github/prompts/chatgpt-debug.prompt.md`) and receiving a minimal patch proposal marked ARCHITECTURE SAFE. Never use this template speculatively or for exploratory fixes.

---

## Developer Input — What to Include

Before invoking this prompt in Copilot, prepare the following:

1. **The failing test method name** — the exact test that the patch is intended to fix (e.g., `AssignRole_UserNotFound_ThrowsIdentityNotFoundException`).

2. **The exact patch proposed by the GPT** — copy the unified diff output from Step 3 of the debug diagnosis verbatim. Do not modify the patch, add to it, or paraphrase it.

3. **The architecture safety check result** — copy the ARCHITECTURE SAFE confirmation (or ARCHITECTURE WARNING with its description) from Step 4 of the debug diagnosis.

---

## Prompt Body — For Copilot

```
Apply the following patch exactly as specified. This patch was proposed by the ECC Custom GPT
debug diagnosis and has been verified as ARCHITECTURE SAFE.

FAILING TEST: [PASTE FAILING TEST METHOD NAME]

PROPOSED PATCH:
[PASTE THE EXACT UNIFIED DIFF FROM GPT DIAGNOSIS]

ARCHITECTURE SAFETY CHECK:
[PASTE THE ARCHITECTURE SAFE / ARCHITECTURE WARNING RESULT]

Instructions:
1. Apply ONLY the specified changes to the specified file(s). Do not modify any other files.
2. Do NOT modify any test files. The fix goes into the implementation, not the test.
3. Do NOT make any additional changes beyond the specified patch — even if you see other
   improvements that could be made. Those improvements belong in a separate Refactor phase
   task with their own test coverage.
4. Do NOT introduce any new imports or using statements that were not in the original file
   unless the patch explicitly adds them. New imports can pull in unintended dependencies.
5. After applying the patch, run the validation command below and report the result.

VALIDATION COMMAND:
dotnet test --filter [PASTE TEST CLASS OR METHOD NAME FROM DIAGNOSIS]
```

---

## Hard Constraints

These constraints are absolute and override any other Copilot behavior:

**10-line maximum change.** The patch must not exceed 10 lines of modification (additions + deletions). If the patch as proposed exceeds this limit, do not apply it — return to the developer with a message that the patch exceeds the 10-line limit and may require re-scoping as a new task.

**No test file modifications.** The fix goes into the implementation code. If the test needs to change, that is a Red phase activity with its own review cycle — not a fix operation.

**No layer boundary violations.** The patch must not introduce any pattern that violates the ECC three-layer architecture as defined in `.github/copilot-instructions.md`. Specifically: no controller importing a repository namespace, no service importing HttpContext, no repository containing business logic, no direct fetch() in React components.

**No new dependencies.** The patch must not add new NuGet packages, npm packages, or project references unless the patch diff explicitly includes the package addition. Implicit dependency changes can break the build for other developers.

**Architecture safety check compliance.** If the diagnosis returned ARCHITECTURE WARNING instead of ARCHITECTURE SAFE, do not apply the patch. Instead, return: *"The architecture safety check returned a warning: [description]. This patch should not be applied without Engineering Lead review. Please consult the Engineering Lead before proceeding."*

---

## Post-Fix Verification

After applying the patch and running the validation command:

**If all target tests pass:** Report success and confirm that the patch was applied exactly as specified with no additional modifications.

**If any target test still fails:** Report the test output, including the assertion error message. Do not attempt a second fix — the developer should return to the ChatGPT Debug Diagnosis with the updated failure information for a revised diagnosis.

**If the patch causes other tests to regress:** Report which tests regressed and their assertion errors. Roll back the patch and notify the developer that the fix has unintended side effects requiring a broader diagnosis.
