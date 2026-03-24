# Restructuring Plan

## PART 2: Target Architecture
- services/api/src/ECC.Domain
- services/api/src/ECC.Application
- services/api/src/ECC.Infrastructure
- services/api/src/ECC.API
- apps/frontend
- tests/unit, tests/integration, tests/e2e
- infrastructure/docker, infrastructure/database

## Moved + Refactored
- Shared errors/DTOs moved to Domain/Application layers
- Services/repositories split by one-public-type-per-file
- Frontend moved to apps/frontend
