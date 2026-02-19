import { apiClient } from '@/api/client';
import type { ListQueryParams } from '@claas2saas/contracts/api';
import { RoleListResponseSchema, type RoleListResponse } from './roles.schemas';

const isDemo = (import.meta.env['VITE_AUTH_MODE'] as string | undefined) === 'demo';

export const rolesApi = {
  list: async (params?: Partial<ListQueryParams>): Promise<RoleListResponse> => {
    const path = isDemo ? '/api/demo/roles' : '/api/v1/roles';
    const response = await apiClient.get(path, { params });
    return RoleListResponseSchema.parse(response.data);
  },
} as const;
