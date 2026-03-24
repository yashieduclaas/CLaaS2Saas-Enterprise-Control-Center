# API Reference

## Identity
- GET /api/identity/profile
- GET /api/identity/users
- GET /api/identity/users/{id}

## RBAC
- POST /api/rbac/assign-role
- POST /api/rbac/revoke-role
- GET /api/rbac/permissions/{solution}/{module}

## Registry
- GET /api/registry/modules
- GET /api/registry/modules/{id}
- POST /api/registry/modules

## Audit
- GET /api/audit/sessions/{userId}
- GET /api/audit/actions/{userId}
