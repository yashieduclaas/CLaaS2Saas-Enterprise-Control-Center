import { useQuery } from '@tanstack/react-query';
import { auditApi } from './audit.api';

/**
 * React Query hook for fetching audit actions.
 *
 * AC-1: Calls getAuditActions() internally via useQuery
 * AC-2: Returns { data, isLoading, error } from React Query
 * AC-3: Query key is exactly ["audit-actions"]
 * AC-4: No direct API calls (fetch/axios) inside hook
 * AC-5: TypeScript shows no errors and types are inferred correctly
 */
export function useAuditActionsQuery() {
  return useQuery({
    queryKey: ['audit-actions'] as const,
    queryFn: () => auditApi.getAuditActions(),
    staleTime: 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
