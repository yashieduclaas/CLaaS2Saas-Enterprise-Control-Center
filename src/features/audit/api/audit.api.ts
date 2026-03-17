import { apiClient } from '@/api/client';
import { AuditListResponseSchema, type AuditListResponse } from './audit.schemas';

export const auditApi = {
  listActions: async (): Promise<AuditListResponse> => {
    const response = await apiClient.get('/api/v1/audit/actions');
    return AuditListResponseSchema.parse(response.data);
  },
} as const;
