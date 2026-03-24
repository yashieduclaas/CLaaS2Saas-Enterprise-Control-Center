import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { auditApi } from './audit.api';

export function useAuditActionsQuery() {
  const { tenantId, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['audit', 'actions', { tenantId }] as const,
    queryFn: () => auditApi.listActions(),
    enabled: isAuthenticated && !!tenantId,
    staleTime: 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
