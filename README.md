# ECC Repository

This repository has been restructured to the ECC clean architecture layout with separate backend and frontend roots.

## Current Structure

- apps/frontend
- services/api
- tests/unit
- tests/integration
- infrastructure/docker
- infrastructure/database

## Verified Build and Test Commands

### Backend

```bash
cd services/api
dotnet build ECC.sln
```

### Tests

```bash
cd services/api
dotnet test ECC.sln
```

### Frontend

```bash
cd apps/frontend
npm run build
```

## Unit Test Status

- Total unit tests in ECC.Application.Tests: 8
- Result: 8/8 passing

## Governance and Reference Documents

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODING_STANDARDS.md](CODING_STANDARDS.md)
- [SECURITY.md](SECURITY.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md)
- [CHANGELOG.md](CHANGELOG.md)
- [governance/PLATFORM_FREEZE.md](governance/PLATFORM_FREEZE.md)

## Solutions

- Root entry solution: ECC.sln
- Backend solution: services/api/ECC.sln
