// apps/web/src/features/audit/hooks/useAuditSessionsQuery.ts

import { useQuery } from '@tanstack/react-query';
import { auditSessionService } from '../services/auditSessionService';

export function useAuditSessionsQuery() {
    return useQuery({
        queryKey: ['audit', 'sessions'] as const,
        queryFn: () => auditSessionService.getSessions(),
        staleTime: 60 * 1000,
        retry: 2,
    });
}
