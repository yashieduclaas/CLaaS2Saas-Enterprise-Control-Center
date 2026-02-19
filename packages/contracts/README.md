# @claas2saas/contracts

> ⚠️ **AUTHORITATIVE SOURCE OF TRUTH** ⚠️
>
> TypeScript contracts defined in this package govern the interface between all services.
> Backend DTOs and frontend models MUST derive from these contracts.
> No direct type duplication is permitted.

## Principle

Changes to this package require explicit architecture approval.
Feature pods may ADD to existing modules. Existing types are immutable once published.
