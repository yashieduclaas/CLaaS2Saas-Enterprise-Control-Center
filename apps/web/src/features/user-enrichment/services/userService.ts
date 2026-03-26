// features/user-enrichment/services/userService.ts
// Thin wrappers kept for backward compat with useUpdateUser hook.
// All new calls go directly through usersApi.ts + React Query.

import { enrichUser } from '@/api/usersApi';
import type { UserProfile, UpdateUserRequest } from '../types/user';

export async function updateUser(
    id: string,
    payload: UpdateUserRequest
): Promise<UserProfile> {
    // Map UserProfile fields back to the enrich endpoint shape.
    // `id` is the entra_email_id (set by the page component).
    await enrichUser({
        entraEmailId: id,
        displayName: payload.displayName,
        orgRole: payload.role || null,
        managerEmailId: null,
        managerName: payload.manager || null,
        isActive: payload.status === 'Active',
    });
    // Return the updated profile so the modal can merge it back.
    return {
        id,
        email: id,
        displayName: payload.displayName,
        role: payload.role,
        manager: payload.manager,
        status: payload.status,
    };
}
