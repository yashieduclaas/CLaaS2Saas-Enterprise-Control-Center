# Copilot Unit Test Generation Prompt — TDD Red Phase

> **What this is:** The template for the Copilot `/generate-unit-tests` slash command used during the TDD Red phase. This prompt ensures that every test generation session produces ECC-compliant xUnit test classes with complete coverage across all required test categories.
>
> **When to use:** At the start of the TDD Red phase, before any implementation code exists. The developer fills in the target method details below and submits this to Copilot to generate a complete test class.

---

## Developer Input — Describe the Target Method

Fill in the following sections before submitting to Copilot:

**Target class and method:**
- Class name: [e.g., `RoleAssignmentService`]
- Method name: [e.g., `AssignRoleAsync`]
- What it does: [e.g., "Assigns a specified role to a user within a specific solution and module, after verifying the assigning user has sufficient authority"]
- What it returns on success: [e.g., "Returns a `RoleAssignmentResult` record containing the assignment ID, assigned role code, and timestamp"]

**DTOs and parameters:**
- Input DTO or parameters: [e.g., `AssignRoleRequestDto` with fields: `EntraObjectId` (string), `SolutionCode` (string), `ModuleCode` (string), `RoleCode` (string), `AssignedByEntraObjectId` (string), `AssignmentReason` (string)]
- Output DTO or return type: [e.g., `RoleAssignmentResult` record with fields: `AssignmentId` (int), `RoleCode` (string), `AssignedAt` (DateTimeOffset)]

**Dependencies (constructor-injected interfaces):**
- [e.g., `ISecurityUserRepository` — provides user lookup by Entra Object ID]
- [e.g., `ISecurityUserRoleRepository` — provides role assignment CRUD]
- [e.g., `ISecurityRolePermissionRepository` — provides role and permission flag lookup]
- [e.g., `IEventDispatcher` — dispatches audit events after state changes]

---

## Prompt Body — For Copilot

```
Generate a complete xUnit test class for the ECC method described below. Follow all ECC testing
conventions exactly. This is the TDD Red phase — no implementation exists yet. Every test you
generate must fail with a meaningful assertion error when the test runner executes.

TARGET METHOD:
- Class: [PASTE CLASS NAME]
- Method: [PASTE METHOD NAME]
- Description: [PASTE DESCRIPTION]
- Returns on success: [PASTE RETURN DESCRIPTION]

INPUT:
[PASTE DTO/PARAMETER DESCRIPTION]

DEPENDENCIES:
[PASTE DEPENDENCY LIST]

GENERATION RULES:

1. Create a test class named [ClassName]Tests in namespace ECC.API.Tests.Services.[Module]
   (or the appropriate test namespace mirroring the implementation path).

2. The test class constructor must:
   - Create Mock<T> instances for every dependency listed above
   - Create the system under test (SUT) by passing all mock .Object instances to the constructor
   - Store mocks as private readonly fields for use in test methods

3. Every test method name follows: MethodName_Condition_ExpectedResult

4. Every test method body follows Arrange-Act-Assert with one blank line between sections
   and exactly one behavior verified per test.

5. Generate at least one test from EACH of the following categories:

   CATEGORY A — Happy Path (minimum 1 test):
   Valid input, all dependencies return expected values, method succeeds.
   Assert the return value contains expected data.
   Verify IEventDispatcher.Dispatch was called exactly once with the correct event type
   and correct payload values.

   CATEGORY B — Validation Failures (minimum 1 test per invalid input):
   Each field that can be invalid gets its own test. The test provides invalid input
   (empty string, null where not permitted, value exceeding max length) and asserts that
   an AppException is thrown with error code "VALIDATION_FAILED".

   CATEGORY C — Identity Not Found (minimum 1 test):
   The Entra Object ID does not match any user record. Mock the user repository to return
   null. Assert AppException with error code "IDENTITY_NOT_FOUND".

   CATEGORY D — Insufficient Authority (minimum 1 test):
   The requesting user exists but does not hold a role with sufficient permission flags
   for this operation. Mock the role permission repository to return a role with
   insufficient flags. Assert AppException with error code "INSUFFICIENT_AUTHORITY".

   CATEGORY E — Conflict / Duplicate State (minimum 1 test, if applicable):
   The operation targets a state that already exists (e.g., role already assigned and active).
   Assert AppException with error code "ROLE_ALREADY_ACTIVE" (or appropriate conflict code).

   CATEGORY F — Database Error (minimum 1 test):
   The repository throws a SqlException (simulated by configuring the mock to throw).
   Assert that the service catches it and rethrows as AppException with error code
   "DATABASE_ERROR".

   CATEGORY G — Boundary and Edge Cases (minimum 1 test):
   Null inputs where the parameter is nullable, empty collections, maximum-length strings
   at the boundary, or any other edge case relevant to the method's contract.

6. All dependencies are mocked via Moq. No real database connections. No real Entra ID calls.
   No real HTTP calls.

7. Include the PROMPT-ID header block immediately after the namespace declaration:
   // ============================================================
   // AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
   // FEAT-ID:    [from developer input]
   // TASK-ID:    [from developer input]
   // PROMPT-ID:  [from developer input]
   // Generated:  [today's date] | ChatGPT REVIEW: PENDING
   // ============================================================

8. Place the file at: tests/ECC.API.Tests/Services/[Module]/[ClassName]Tests.cs
   (mirroring the implementation file's path under src/).

9. Add necessary using statements:
   - using Xunit;
   - using Moq;
   - using ECC.Shared.Errors;
   - using ECC.Shared.Events;
   - using the DTO namespace
   - using the service interface namespace
   - using the repository interface namespaces

10. After generating the test file, confirm the expected behavior: running
    `dotnet test --filter [TestClassName]` should produce failing tests with assertion
    errors (not compilation errors). If any types referenced in the tests do not yet exist,
    list them so the developer can create interface stubs before running the tests.
```

---

## Post-Generation Checklist

After Copilot generates the test file, verify:

1. Every test category (A through G) has at least one test method.
2. Every test method follows `MethodName_Condition_ExpectedResult` naming.
3. Every test method has Arrange-Act-Assert structure.
4. The PROMPT-ID header is present and populated.
5. No implementation code was generated — only test code.
6. The file is placed in the correct `tests/` directory path.

If any category is missing, ask Copilot to add the missing tests before proceeding. Once the test file is complete and committed, switch to the **TDD Green agent** to generate the implementation.
