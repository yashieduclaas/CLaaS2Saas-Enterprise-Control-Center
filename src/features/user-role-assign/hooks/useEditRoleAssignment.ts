// apps/web/src/features/user-role-assign/hooks/useEditRoleAssignment.ts
// FEATURE HOOK — Wraps the updateRoleAssignment service call with loading state.
//
// Architecture note:
//   - Modal calls this hook. Hook calls the service. Service calls the API.
//   - Modal never imports the service directly.
//   - Swapping the service for a real API call requires zero changes here or in the modal.

import { useState } from 'react';
import { updateRoleAssignment } from '../services/mockAssignments';
import type { UpdateRoleAssignmentRequest, UserRoleAssignment } from '../types/security';

export interface UseEditRoleAssignmentResult {
    save: (payload: UpdateRoleAssignmentRequest) => Promise<UserRoleAssignment>;
    loading: boolean;
}

export function useEditRoleAssignment(): UseEditRoleAssignmentResult {
    const [loading, setLoading] = useState(false);

    async function save(payload: UpdateRoleAssignmentRequest): Promise<UserRoleAssignment> {
        setLoading(true);
        try {
            const updated = await updateRoleAssignment(payload);
            return updated;
        } finally {
            setLoading(false);
        }
    }

    return { save, loading };
}
