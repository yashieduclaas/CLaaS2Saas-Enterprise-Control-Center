// apps/web/src/features/user-role-assign/hooks/useCreateAssignment.ts
// HOOK LAYER — Wraps createAssignment service call with loading state.
//
// Architecture: Modal → this hook → service → API
// Modal never imports the service directly.

import { useState } from 'react';
import { createAssignment } from '../services/assignmentService';
import type {
    CreateUserRoleAssignmentRequest,
    AssignableUserRoleAssignment,
} from '../types/assignment';

export interface UseCreateAssignmentResult {
    create: (payload: CreateUserRoleAssignmentRequest) => Promise<AssignableUserRoleAssignment>;
    loading: boolean;
}

export function useCreateAssignment(): UseCreateAssignmentResult {
    const [loading, setLoading] = useState(false);

    async function create(
        payload: CreateUserRoleAssignmentRequest,
    ): Promise<AssignableUserRoleAssignment> {
        setLoading(true);
        try {
            return await createAssignment(payload);
        } finally {
            setLoading(false);
        }
    }

    return { create, loading };
}
