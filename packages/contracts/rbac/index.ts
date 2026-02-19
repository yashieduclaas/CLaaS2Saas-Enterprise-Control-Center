/**
 * RBAC contracts — authoritative permission code registry.
 * TypeScript source of truth. C# enum is derived from this via tools/sync-permission-codes.ps1
 * Never add permission codes outside this file.
 */

export const PERMISSION_CODES = [
  // Role management
  'ROLE:CREATE',
  'ROLE:READ',
  'ROLE:UPDATE',
  'ROLE:DELETE',
  // User management
  'USER:CREATE',
  'USER:READ',
  'USER:UPDATE',
  'USER:DELETE',
  'USER:ASSIGN_ROLE',
  'USER:REVOKE_ROLE',
  // Module management
  'MODULE:CREATE',
  'MODULE:READ',
  'MODULE:UPDATE',
  'MODULE:DELETE',
  // Audit
  'AUDIT:VIEW_SESSIONS',
  'AUDIT:VIEW_ACTIONS',
  'AUDIT:EXPORT',
  // Access requests
  'ACCESS_REQUEST:SUBMIT',
  'ACCESS_REQUEST:REVIEW',
  'ACCESS_REQUEST:RESOLVE',
  // Admin
  'ADMIN:MODULE_SCOPED',
  'ADMIN:GLOBAL',
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export const isPermissionCode = (v: unknown): v is PermissionCode =>
  typeof v === 'string' && (PERMISSION_CODES as readonly string[]).includes(v);

export type SecurityRoleType =
  | 'VIEWER'
  | 'CONTRIBUTOR'
  | 'COLLABORATOR'
  | 'ADMIN'
  | 'GLOBAL_ADMIN';
