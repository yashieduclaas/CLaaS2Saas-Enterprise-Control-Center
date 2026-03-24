# Architecture

ECC follows Clean Architecture with strict layering:
1. ECC.API: HTTP concerns only
2. ECC.Application: business logic and orchestration
3. ECC.Domain: entities, enums, events, interfaces, exceptions
4. ECC.Infrastructure: persistence, repository implementations, integrations

Dependencies flow inward only.
