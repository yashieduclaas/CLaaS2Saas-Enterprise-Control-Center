import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { rolesApi } from './roles.api';
import type { ListQueryParams } from '@claas2saas/contracts/api';

export interface UseRoleListQueryParams extends Partial<ListQueryParams> {}

export function useRoleListQuery(params: UseRoleListQueryParams = {}) {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['roles', 'list', { tenantId, ...params }] as const,
    queryFn: () => rolesApi.list(params),
    enabled: isAuthenticated && !!tenantId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
