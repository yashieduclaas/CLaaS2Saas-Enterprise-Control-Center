// apps/web/src/api/usersApi.ts
// Typed API client for the /api/v1/users endpoints.
// All HTTP calls go through apiClient — no component may call fetch/axios directly.

import { apiClient } from './client';

// ── DTOs matching the backend ListUsersResult / EnrichUserResult shapes ───────

export interface UserDto {
  security_user_pid: number;
  entra_email_id: string;
  display_name: string;
  org_role: string | null;
  manager_email_id: string | null;
  manager_name: string | null;
  is_active: boolean;
}

export interface ListUsersResponse {
  users: Array<Record<string, unknown>>;
}

export interface EnrichUserRequest {
  entraEmailId: string;
  displayName: string;
  orgRole: string | null;
  managerEmailId: string | null;
  managerName: string | null;
  isActive: boolean;
}

export interface EnrichUserResponse {
  security_user_pid: number;
  is_created: boolean;
}

export interface BulkError {
  row: number;
  entraEmailId: string;
  error: string;
}

export interface BulkEnrichUsersResponse {
  total: number;
  success: number;
  failed: number;
  errors: BulkError[];
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}

function readBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

function normalizeUser(raw: Record<string, unknown>): UserDto {
  return {
    security_user_pid: readNumber(raw['security_user_pid'] ?? raw['securityUserPid']),
    entra_email_id: readString(raw['entra_email_id'] ?? raw['entraEmailId']),
    display_name: readString(raw['display_name'] ?? raw['displayName']),
    org_role: readNullableString(raw['org_role'] ?? raw['orgRole']),
    manager_email_id: readNullableString(raw['manager_email_id'] ?? raw['managerEmailId']),
    manager_name: readNullableString(raw['manager_name'] ?? raw['managerName']),
    is_active: readBoolean(raw['is_active'] ?? raw['isActive']),
  };
}

// ── API functions ─────────────────────────────────────────────────────────────

/** Retrieves all users for the resolved tenant. */
export async function listUsers(): Promise<UserDto[]> {
  const response = await apiClient.get<ListUsersResponse>('/api/v1/users');
  return response.data.users.map((raw) => normalizeUser(raw));
}

/** Upserts a single user via the enrich endpoint. */
export async function enrichUser(payload: EnrichUserRequest): Promise<EnrichUserResponse> {
  const response = await apiClient.post<EnrichUserResponse>('/api/v1/users/enrich', payload);
  return response.data;
}

/** Uploads a CSV file for bulk user enrichment. */
export async function bulkEnrichUsers(file: File): Promise<BulkEnrichUsersResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<BulkEnrichUsersResponse>('/api/v1/users/enrich/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
