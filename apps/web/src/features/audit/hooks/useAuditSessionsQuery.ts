// apps/web/src/features/audit/hooks/useAuditSessionsQuery.ts

import { useQuery } from '@tanstack/react-query';
import { auditSessionService } from '../services/auditSessionService';
import type { AuditSessionLog } from '../types/auditSession';

export function useAuditSessionsQuery() {
    return useQuery<AuditSessionLog[]>({
        queryKey: ['audit', 'sessions'] as const,
        queryFn: () => auditSessionService.getSessions(),
        staleTime: 60 * 1000,
        retry: 2,
    });
}
