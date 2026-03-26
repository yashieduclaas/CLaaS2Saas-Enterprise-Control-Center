// features/user-enrichment/hooks/useUsers.ts
// React Query hook for fetching the user list from GET /api/v1/users.
// All server state goes through React Query — no useEffect + fetch patterns.

import { useQuery } from '@tanstack/react-query';
import { listUsers } from '@/api/usersApi';
import type { UserDto } from '@/api/usersApi';

export const USERS_QUERY_KEY = ['users'] as const;

interface UseUsersReturn {
    data: UserDto[];
    isLoading: boolean;
    error: string | null;
}

export function useUsers(): UseUsersReturn {
    const { data, isLoading, error } = useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: listUsers,
        staleTime: 30_000,
    });

    return {
        data: data ?? [],
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load users') : null,
    };
}
