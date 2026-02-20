// packages/contracts/src/rbac/RoleDto.ts
// ADDITIVE — Do NOT modify existing exports in index.ts; add this file alongside.
// ARB-approved DTO for the roles list endpoint.

import type { IsoDateTime, RoleId } from "../shared";

/**
 * Read-only projection of a tenant role returned by GET /api/v1/roles.
 * Columns: Role Name | Description | Is System Role | Updated At
 */
export interface RoleDto {
  readonly id: RoleId;
  readonly name: string;
  readonly description: string | null;
  readonly isSystemRole: boolean;
  readonly updatedAt: IsoDateTime;
}
