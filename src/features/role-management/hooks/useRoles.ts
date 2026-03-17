// apps/web/src/features/role-management/hooks/useRoles.ts
// Fetches role list once on mount. Page must not call service directly.

import { useState, useEffect } from 'react';
import { getRoles } from '../services/securityRoleService';
import type { SecurityRole } from '../types/securityRole';

interface UseRolesState {
    data: SecurityRole[];
    isLoading: boolean;
    error: string | null;
}

export function useRoles(): UseRolesState {
    const [state, setState] = useState<UseRolesState>({
        data: [],
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        getRoles()
            .then((roles) => {
                if (!cancelled) setState({ data: roles, isLoading: false, error: null });
            })
            .catch((err) => {
                if (!cancelled)
                    setState({
                        data: [],
                        isLoading: false,
                        error: err instanceof Error ? err.message : 'Failed to load roles',
                    });
            });
        return () => { cancelled = true; };
    }, []);

    return state;
}
