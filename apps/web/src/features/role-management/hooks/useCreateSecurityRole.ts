// apps/web/src/features/role-management/hooks/useCreateSecurityRole.ts
// HOOK LAYER — Wraps createSecurityRole service call with loading state.
//
// Architecture note:
//   Modal → this hook → service → API
//   Modal never imports the service directly.

import { useState } from 'react';
import { createSecurityRole } from '../services/securityRoleService';
import type { CreateSecurityRoleRequest, SecurityRole } from '../types/securityRole';

export interface UseCreateSecurityRoleResult {
    create: (payload: CreateSecurityRoleRequest) => Promise<SecurityRole>;
    loading: boolean;
}

export function useCreateSecurityRole(): UseCreateSecurityRoleResult {
    const [loading, setLoading] = useState(false);

    async function create(payload: CreateSecurityRoleRequest): Promise<SecurityRole> {
        setLoading(true);
        try {
            const result = await createSecurityRole(payload);
            return result;
        } finally {
            setLoading(false);
        }
    }

    return { create, loading };
}
