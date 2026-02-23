// features/user-enrichment/hooks/useUpdateUser.ts
// Handles update flow — modal must call this hook, NOT the service directly.

import { useState, useCallback } from 'react';
import { updateUser } from '../services/userService';
import type { UserProfile, UpdateUserRequest } from '../types/user';

interface UseUpdateUserReturn {
    isLoading: boolean;
    error: string | null;
    execute: (id: string, payload: UpdateUserRequest) => Promise<UserProfile | null>;
}

export function useUpdateUser(): UseUpdateUserReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(
        async (id: string, payload: UpdateUserRequest): Promise<UserProfile | null> => {
            setIsLoading(true);
            setError(null);
            try {
                const updated = await updateUser(id, payload);
                setIsLoading(false);
                return updated;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to update user';
                setError(msg);
                setIsLoading(false);
                return null;
            }
        },
        []
    );

    return { isLoading, error, execute };
}
