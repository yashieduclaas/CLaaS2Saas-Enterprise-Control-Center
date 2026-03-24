# AI Context

## Repository Structure
- services/api/src/ECC.Domain
- services/api/src/ECC.Application
- services/api/src/ECC.Infrastructure
- services/api/src/ECC.API
- apps/frontend
- services/api/examples
- apps/frontend/examples
- tests/unit
- tests/integration
- infrastructure/docker
- infrastructure/database

## Three-File Rule (Current Paths)
- services/api/examples/example-service.cs
- services/api/examples/example-controller.cs
- services/api/examples/example-repository.cs
- services/api/examples/example-dto.cs
- services/api/examples/example-test.cs
- apps/frontend/examples/example-component.tsx
- apps/frontend/examples/example-service.ts

## Key Rules
- Controller -> Service -> Repository layering only
- [Authorize] on protected endpoints
- Entra OID extraction via User.FindFirst("oid").Value
- AppException with ErrorCodes in service/repository logic
- IEventDispatcher dispatch after state changes
- Parameterized SQL only (or EF Core queries)
