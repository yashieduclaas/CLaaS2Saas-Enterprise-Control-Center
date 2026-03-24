---
doc_id: "PR-NNN-[layer]-[entity]"
title: "[Descriptive title — e.g., 'Generate RoleAssignmentService implementation']"
owner: "[Developer name who will execute this prompt]"
status: "draft"
  # Valid values: draft (prompt prepared, not yet executed),
  #               validated (prompt reviewed by Engineering Lead),
  #               executed (Copilot has generated the code),
  #               archived (feature complete, PR merged, entry retained for audit)
version: "1.0"
last_updated: "YYYY-MM-DD"
related_docs:
  - "FEAT-NNN — [Parent feature specification this prompt belongs to]"
  - "T-NNN — [The specific implementation task within the feature that this prompt executes]"
---

# PR-NNN-[layer]-[entity] — [Descriptive Title]

> **What this is:** A prompt registry entry — the audit record for a single AI-generated source file in ECC. This entry is created before the Copilot prompt is executed (status: draft), updated after execution (status: executed), and referenced in PRs and CI checks. The prompt registry is the central audit trail for all AI-generated code in the ECC codebase.
>
> **Why it exists:** Every AI-generated file in ECC must be traceable to the prompt that produced it, the feature specification that required it, and the architecture review that approved it. This traceability is what allows the team to audit AI-generated code, reproduce any generation session, and identify prompt patterns that produce high-quality or low-quality output.

---

## Identity Fields

| Field | Value |
|-------|-------|
| FEAT-ID | [e.g., FEAT-012 — the parent feature specification] |
| TASK-ID | [e.g., T-004 — the specific task within the feature's implementation task list] |
| PROMPT-ID | [e.g., PR-012-svc-roleassignment — format is PR-[FEAT number]-[layer abbreviation]-[entity name]] |
| Layer | [Controller / Service / Repository / DTO / Test / Frontend Component / Frontend Service] |
| Module | [SecurityKernel / RBACEngine / ApplicationRegistry / AuditService / UserManagement] |
| Output File Path | [e.g., src/ECC.API/Services/Identity/RoleAssignmentService.cs — the exact path where the generated file will be placed] |

Layer abbreviations for PROMPT-ID: `ctrl` (Controller), `svc` (Service), `repo` (Repository), `dto` (DTO), `test` (Test), `comp` (Frontend Component), `fsvc` (Frontend Service).

---

## Micro-Prompt — The Six Sections

> *This is the complete micro-prompt exactly as it will be pasted into Copilot. The six sections (CONTEXT, FILE, TASK, CONSTRAINTS, ACCEPTANCE, TESTS) are the standard structure that the Custom GPT Decision Engine generates during PLAN mode. Each section serves a specific purpose in constraining Copilot's output.*

### CONTEXT

> *Establishes the architectural context. Tells Copilot which module this code belongs to, what already exists, and what role this file plays in the overall feature. Copilot uses this to determine which existing files to reference in its semantic index.*

```
MODULE: [e.g., Identity]
FEATURE: [e.g., Role Assignment — enables module administrators to assign roles to users within their module scope]
EXISTING FILES:
  - [e.g., src/ECC.API/DTOs/Identity/AssignRoleRequestDto.cs — the request DTO this service will accept]
  - [e.g., src/ECC.API/Repositories/Identity/ISecurityUserRepository.cs — the repository interface this service will inject]
  - [e.g., tests/ECC.API.Tests/Services/Identity/RoleAssignmentServiceTests.cs — the test class this implementation must satisfy]
THREE-FILE RULE: Open the following files in VS Code editor tabs before executing this prompt:
  1. src/ECC.API/Examples/example-service.cs (canonical service pattern)
  2. [most similar existing service in this module]
  3. [the interface this service will implement, or the DTO it depends on]
```

### FILE

> *Specifies exactly what file to create or modify and where it goes.*

```
CREATE: [e.g., src/ECC.API/Services/Identity/RoleAssignmentService.cs]
NAMESPACE: [e.g., ECC.API.Services.Identity]
IMPLEMENTS: [e.g., IRoleAssignmentService]
```

### TASK

> *Describes what the generated code should do. This is the behavioral specification — not pseudocode, but a clear description of the method's responsibilities, inputs, outputs, and side effects.*

```
[e.g., Implement the AssignRoleAsync method on RoleAssignmentService.

The method accepts an AssignRoleRequestDto and performs the following sequence:
1. Resolve the target user by EntraObjectId via ISecurityUserRepository — throw IDENTITY_NOT_FOUND if not found.
2. Resolve the assigning user by AssignedByEntraObjectId via ISecurityUserRepository — throw IDENTITY_NOT_FOUND if not found.
3. Retrieve the assigning user's role permissions for the target module via ISecurityRolePermissionRepository.
4. Verify the assigning user has authority to assign the requested role — throw INSUFFICIENT_AUTHORITY if not.
5. Check for an existing active role assignment for the target user in the target module — throw ROLE_ALREADY_ACTIVE if found.
6. Create the new role assignment via ISecurityUserRoleRepository.
7. Dispatch a RoleAssignedEvent via IEventDispatcher.
8. Return a RoleAssignmentResult with the assignment ID, role code, and timestamp.]
```

### CONSTRAINTS

> *Lists the specific Rule-IDs from the ECC architecture that this code must comply with. These constraints are verified during Gate 3 review.*

```
- RULE-SVC-001: All dependencies injected via constructor interfaces. No direct instantiation.
- RULE-SVC-002: No HttpContext or HttpRequest imports. Identity arrives as parameters.
- RULE-SVC-003: Exceptions thrown as AppException only. Error codes: IDENTITY_NOT_FOUND, INSUFFICIENT_AUTHORITY, VALIDATION_FAILED, ROLE_ALREADY_ACTIVE, DATABASE_ERROR.
- RULE-SVC-004: IEventDispatcher.Dispatch after every successful state change.
- RULE-SVC-005: async/await throughout. Zero .Result or .Wait() calls.
- RULE-SEC-001: Privilege escalation guard — Admin cannot assign Admin role. Only Global Admin (hasFullPlatformAccess) can.
- RULE-SEC-002: No PII in log statements.
- RULE-HDR-001: PROMPT-ID header block immediately after namespace declaration.
```

### ACCEPTANCE

> *Defines the conditions under which this code is considered complete. These map directly to the acceptance criteria in the feature specification.*

```
- [ ] AssignRoleAsync resolves target user and throws IDENTITY_NOT_FOUND when not found.
- [ ] AssignRoleAsync validates assigning user's authority and throws INSUFFICIENT_AUTHORITY when insufficient.
- [ ] AssignRoleAsync detects duplicate active assignments and throws ROLE_ALREADY_ACTIVE.
- [ ] AssignRoleAsync creates the role assignment record on success.
- [ ] AssignRoleAsync dispatches RoleAssignedEvent after successful assignment.
- [ ] Privilege escalation guard prevents Admin from assigning Admin role.
- [ ] PROMPT-ID header is present and populated.
- [ ] All methods are async. No .Result or .Wait() calls.
```

### TESTS

> *Specifies the validation command and the test class that this implementation must satisfy.*

```
VALIDATION COMMAND: dotnet test --filter RoleAssignmentServiceTests
TEST CLASS: tests/ECC.API.Tests/Services/Identity/RoleAssignmentServiceTests.cs
EXPECTED RESULT: All tests pass green with zero failures.
```

---

## Execution Metadata

> *Updated after the prompt is executed. This section records what happened during the Copilot generation session.*

| Field | Value |
|-------|-------|
| Execution Date | [YYYY-MM-DD] |
| Copilot Agent / Mode | [tdd-green.agent / tdd-red.agent / security.agent / inline / chat] |
| `dotnet build` Result | [PASS / FAIL — if FAIL, note the error] |
| `dotnet test --filter [TestClass]` Result | [PASS / FAIL — if FAIL, note which tests failed] |
| Lint Result | [PASS / FAIL] |
| Manual Edits Before Gate 1 | [Count and description — e.g., "2 edits: fixed namespace typo, added missing using statement"] |

---

## ChatGPT REVIEW

> *Updated after Gate 3 architecture review. This section records the review outcome.*

| Field | Value |
|-------|-------|
| Review Timestamp | [YYYY-MM-DD HH:MM UTC] |
| REVIEW RESULT | [PASS / FAIL] |
| Findings (if FAIL) | [Paste the findings table from the GPT review output] |
| Re-review Timestamp (if applicable) | [YYYY-MM-DD HH:MM UTC] |
| Final REVIEW RESULT | [PASS — after all Critical/High findings addressed] |

---

## Quality Metrics

> *Recorded after the feature is complete and the PR is merged. These metrics feed back into prompt optimization — they help the team understand which prompts produce high-quality output and which need refinement.*

| Metric | Value |
|--------|-------|
| Lines of Code Generated | [Total lines in the output file as generated by Copilot] |
| Lines Manually Edited | [Lines changed by the developer after Copilot generation, before Gate 1] |
| Edit Ratio | [Lines Manually Edited / Lines of Code Generated — lower is better] |
| Test Coverage (%) | [Test coverage percentage for the generated file, from dotnet test coverage report] |
| First-Run Lint Success | [Yes / No — did the generated code pass lint on the first run?] |
| First-Run Build Success | [Yes / No — did the generated code compile on the first run?] |
| First-Run Test Success | [Yes / No — did all target tests pass on the first run of the Green phase?] |
| Gate 3 First-Pass Success | [Yes / No — did the code pass Gate 3 review on the first submission?] |

---

## PR Linkage

| Field | Value |
|-------|-------|
| PR Number | [#NNN] |
| PR Merge Date | [YYYY-MM-DD] |
| Reviewer Names | [Names of code reviewers who approved the PR] |

---

## Notes

> *Record any deviations from the original prompt, architectural observations, or pattern improvements that should be fed back into the prompt standards. This section is the feedback loop that makes the AI-First workflow improve over time.*

[e.g., "The generated service initially used `InvalidOperationException` instead of `AppException` for the duplicate assignment check. This was caught in Gate 1 (lint) and corrected manually. Suggest updating the tdd-green.agent.md to include a specific check for non-AppException throws in service methods."]

[e.g., "The Copilot output was significantly better when example-service.cs was open in a VS Code tab. Without it, the generated code used a different constructor injection pattern. This confirms the Three-File Rule is essential for consistent output."]
