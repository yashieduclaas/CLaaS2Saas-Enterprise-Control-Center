/**
 * API envelope contracts.
 * Backend wraps all list/detail responses in ApiResponse<T>.
 */

export interface ResponseMeta {
  readonly requestId: string;
  readonly timestamp: string;
  readonly apiVersion: string;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly meta: ResponseMeta;
}

export interface ListQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface RoleDto {
  readonly roleId: string;
  readonly tenantId: string;
  readonly moduleId: string;
  readonly roleCode: string;
  readonly roleName: string;
  readonly roleType: 'VIEWER' | 'CONTRIBUTOR' | 'COLLABORATOR' | 'ADMIN' | 'GLOBAL_ADMIN';
  readonly isSystemRole: boolean;
  readonly isActive: boolean;
  readonly permissionCodes: string[];
  readonly createdAt: string;
}
