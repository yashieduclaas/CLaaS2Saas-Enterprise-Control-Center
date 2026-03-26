// features/user-enrichment/hooks/useUsers.ts
// Fetches user list once on mount. Page components must not call service directly.

import { useState, useEffect } from 'react';
import { getUsers } from '../services/userService';
import type { UserProfile } from '../types/user';

interface UseUsersState {
    data: UserProfile[];
    isLoading: boolean;
    error: string | null;
}

export function useUsers(): UseUsersState {
    const [state, setState] = useState<UseUsersState>({
        data: [],
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        getUsers()
            .then((users) => {
                if (!cancelled) setState({ data: users, isLoading: false, error: null });
            })
            .catch((err) => {
                if (!cancelled)
                    setState({
                        data: [],
                        isLoading: false,
                        error: err instanceof Error ? err.message : 'Failed to load users',
                    });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
