import { apiClient } from '@/api/client';
import {
  AuditListResponseSchema,
  type AuditListResponse,
  AuditSessionsListSchema,
  type AuditSessionsList,
  AuditActionsListSchema,
  type AuditActionsList,
  type ApiResponseEnvelope,
} from './audit.schemas';

// ─── Internal Response Handler ──────────────────────────────────────────────

/**
 * Handles ECC Api Response envelope: { success, data, errorCode, errorMessage }
 * Throws error if success is false.
 */
function handleApiResponse<T>(response: ApiResponseEnvelope<T>): T {
  if (!response.success) {
    const errorMsg = response.errorMessage || 'Unknown API error';
    throw new Error(errorMsg);
  }
  if (!response.data) {
    throw new Error('API returned success but no data');
  }
  return response.data;
}

// ─── Audit API Functions ────────────────────────────────────────────────────

export const auditApi = {
  /**
   * Fetch audit sessions for the current tenant.
   * GET /api/v1/audit/sessions
   *
   * AC-1: Calls endpoint and returns parsed data when success = true
   * AC-3: Throws error using error.message when success = false
   * AC-4: Async function returning typed Promise result
   * AC-5: No mock data imported
   */
  getAuditSessions: async (): Promise<AuditSessionsList> => {
    const response = await apiClient.get<ApiResponseEnvelope<unknown>>(
      '/api/v1/audit/sessions'
    );
    handleApiResponse(response.data);
    // Parse the data field against the sessions list schema
    const parsed = AuditSessionsListSchema.parse(response.data.data);
    return parsed;
  },

  /**
   * Fetch audit actions for the current tenant.
   * GET /api/v1/audit/actions
   *
   * AC-2: Calls endpoint and returns parsed data when success = true
   * AC-3: Throws error using error.message when success = false
   * AC-4: Async function returning typed Promise result
   * AC-5: No mock data imported
   */
  getAuditActions: async (): Promise<AuditActionsList> => {
    const response = await apiClient.get<ApiResponseEnvelope<unknown>>(
      '/api/v1/audit/actions'
    );
    handleApiResponse(response.data);
    // Parse the data field against the actions list schema
    const parsed = AuditActionsListSchema.parse(response.data.data);
    return parsed;
  },

  /**
   * @deprecated Use getAuditActions() instead
   */
  listActions: async (): Promise<AuditListResponse> => {
    const response = await apiClient.get('/api/v1/audit/actions');
    return AuditListResponseSchema.parse(response.data);
  },
} as const;
