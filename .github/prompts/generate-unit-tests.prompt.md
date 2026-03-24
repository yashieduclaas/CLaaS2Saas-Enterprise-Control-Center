# Copilot Unit Test Generation Prompt — TDD Red Phase

> **What this is:** The template for the Copilot `/generate-unit-tests` slash command used during the TDD Red phase. This prompt ensures every test generation session produces ECC-Kernel-compliant xUnit test classes with complete coverage across all required categories.
>
> **When to use:** At the start of the TDD Red phase, before any implementation code exists.

---

## Developer Input — Describe the Target Handler

**Target class and method:**
- Class name: [e.g., `AssignRoleCommandHandler`]
- Command/Query: [e.g., `AssignRoleCommand`]
- What it does: [e.g., "Assigns a specified role to a user within a specific solution and module, after verifying the assigning user has sufficient authority via IPermissionEvaluator"]
- What it returns on success: [e.g., "Returns a `RoleAssignmentResult` record containing the assignment ID, assigned role code, and timestamp"]

**DTOs and parameters:**
- Input command fields: [e.g., `EntraObjectId` (string), `SolutionCode` (string), `ModuleCode` (string), `RoleCode` (string), `AssignedByEntraObjectId` (string), `AssignmentReason` (string)]
- Output result type: [e.g., `RoleAssignmentResult` record with `AssignmentId` (int), `RoleCode` (string), `AssignedAt` (DateTimeOffset)]

**Dependencies (constructor-injected interfaces):**
- [e.g., `ISecurityUserRepository` — provides user lookup by Entra Object ID]
- [e.g., `IMapSecurityUsersRolesRepository` — provides role assignment CRUD]
- [e.g., `ISecurityRolePermissionRepository` — provides role and permission flag lookup]
- [e.g., `IPermissionEvaluator` — evaluates whether the assigning user is authorized]
- [e.g., `IAuditQueue` — enqueues audit entries after state changes]

---

## Prompt Body — For Copilot

```
Generate a complete xUnit test class for the ECC-Kernel MediatR handler described below.
Follow all ECC-Kernel testing conventions. This is the TDD Red phase — no implementation
exists yet. Every test must fail with a meaningful assertion error.

TARGET HANDLER:
- Class: [PASTE CLASS NAME]
- Command/Query: [PASTE COMMAND/QUERY NAME]
- Description: [PASTE DESCRIPTION]
- Returns on success: [PASTE RETURN DESCRIPTION]

INPUT:
[PASTE COMMAND FIELD DESCRIPTION]

DEPENDENCIES:
[PASTE DEPENDENCY LIST]

GENERATION RULES:

1. Create a test class named [HandlerClassName]Tests in namespace
   ECC.Kernel.Tests.Application.Features.[FeatureCluster]

2. The test class constructor must:
   - Create Mock<T> instances for every dependency
   - Create the system under test (SUT) by passing all mock .Object instances
   - Store mocks as private readonly fields

3. Test method naming: MethodName_Condition_ExpectedResult

4. Every test body follows Arrange-Act-Assert with one blank line between sections
   and exactly one behavior verified per test.

5. Generate at least one test from EACH of the following categories:

   CATEGORY A — Happy Path (minimum 1 test):
   Valid input, all dependencies return expected values, handler succeeds.
   Assert the return value contains expected data.
   Verify IAuditQueue.Enqueue was called exactly once with:
   - ActionType matching the operation (CREATE, UPDATE, DELETE)
   - EntityType matching the SecurityDB table name
   - EntityPid matching the created/modified record's PID
   - OldValue (null for CREATE, JSON of previous state for UPDATE/DELETE)
   - NewValue (JSON of new state for CREATE/UPDATE, null for DELETE)

   CATEGORY B — Validation Failures (minimum 1 test per invalid field):
   Each field that can be invalid gets its own test:
   - EntraObjectId: empty, not matching GUID format (^[0-9a-fA-F\-]{36}$)
   - RoleCode: empty, not matching ^[A-Z_]{2,50}$
   - String fields exceeding SecurityDB column max length
   Assert that a ValidationException is thrown.

   CATEGORY C — Resource Not Found (minimum 1 test):
   The Entra Object ID does not match any user record. Mock repository to return null.
   Assert ResourceNotFoundException.

   CATEGORY D — Insufficient Authority (minimum 1 test):
   The requesting user exists but IPermissionEvaluator.Evaluate returns Deny.
   Assert PermissionDeniedException.

   CATEGORY E — Conflict / Duplicate State (minimum 1 test, if applicable):
   The operation targets a state that already exists (e.g., active role assignment
   for that user-module combination). Assert ConflictException.

   CATEGORY F — Database Error (minimum 1 test):
   The repository throws an exception (simulated via mock).
   Assert the handler wraps it appropriately.

   CATEGORY G — Boundary and Edge Cases (minimum 1 test):
   Null inputs, empty collections, maximum-length strings at SecurityDB column
   boundaries.

   CATEGORY H — RBAC Matrix (minimum 1 parameterized test, if new permission code):
   Test all five roles (GLOBAL_ADMIN, ADMIN, COLLABORATOR, CONTRIBUTOR, VIEWER)
   asserting correct allow/deny for the operation's permission code.

6. All dependencies are mocked via Moq. No real database connections, Entra ID calls,
   or HTTP calls.

7. Include the PROMPT-ID header block after the namespace declaration.

8. Place the file at: tests/ECC.Kernel.Tests/Application/Features/[Cluster]/
   [HandlerClassName]Tests.cs

9. Required using statements:
   - using Xunit;
   - using Moq;
   - using the domain exception types from Kernel.Application
   - using IAuditQueue and AuditActionLogEntry
   - using IPermissionEvaluator and EvaluationResult
   - using the command/query and result types
   - using the repository interface namespaces

10. After generating, confirm expected behavior: dotnet test --filter [TestClassName]
    should produce failing tests with assertion errors (not compilation errors).
    List any types that must be stubbed first.
```

---

## Post-Generation Checklist

1. Every category (A through H where applicable) has at least one test method.
2. Every test follows `MethodName_Condition_ExpectedResult` naming.
3. Every test has Arrange-Act-Assert structure.
4. The PROMPT-ID header is present and populated.
5. No implementation code was generated — only test code.
6. The file is in the correct `tests/` directory path.
7. IAuditQueue.Enqueue verification is present in all state-changing happy path tests with correct EntityType, ActionType, OldValue, and NewValue assertions.
8. IPermissionEvaluator mock setup is present in all authority-related tests.
9. SecurityDB column constraints (GUID format, role code pattern, max lengths) are reflected in validation failure tests.

If any category is missing, ask Copilot to add the missing tests before proceeding. Once complete, switch to the **TDD Green agent**.
