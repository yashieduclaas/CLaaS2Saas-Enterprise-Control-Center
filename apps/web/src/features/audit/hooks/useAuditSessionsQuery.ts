// apps/web/src/features/audit/hooks/useAuditSessionsQuery.ts

import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/audit.api';

/**
 * React Query hook for fetching audit sessions.
 *
 * AC-1: Calls getAuditSessions() inside useQuery
 * AC-2: Returns { data, isLoading, error } from React Query
 * AC-3: Query key is exactly ["audit-sessions"]
 * AC-4: No direct API calls inside hook
 * AC-5: TypeScript shows no errors and types are correctly inferred
 */
export function useAuditSessionsQuery() {
  return useQuery({
    queryKey: ['audit-sessions'] as const,
    queryFn: () => auditApi.getAuditSessions(),
    staleTime: 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
