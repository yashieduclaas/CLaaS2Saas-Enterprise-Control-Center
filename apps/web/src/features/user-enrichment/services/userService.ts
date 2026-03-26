// features/user-enrichment/services/userService.ts
// Mock service — replace bodies with real API calls when backend is ready.
// getUsers  → apiClient.get('/users')
// updateUser → apiClient.put(`/users/${id}`, payload)

import type { UserProfile, UpdateUserRequest } from '../types/user';

export async function getUsers(): Promise<UserProfile[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    email: 'admin@lithan.com',
                    displayName: 'Admin User',
                    role: 'Platform Director',
                    manager: 'rabiul',
                    status: 'Active',
                },
                {
                    id: '2',
                    email: 'alice.johnson@lithan.com',
                    displayName: 'Alice Johnson',
                    role: 'Senior Developer',
                    manager: 'Admin User',
                    status: 'Active',
                },
                {
                    id: '3',
                    email: 'bob.smith@lithan.com',
                    displayName: 'Bob Smith',
                    role: 'Project Manager',
                    manager: 'Admin User',
                    status: 'Active',
                },
            ]);
        }, 400);
    });
}

export async function updateUser(
    id: string,
    payload: UpdateUserRequest
): Promise<UserProfile> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id,
                email: 'mock@email.com',
                displayName: payload.displayName,
                role: payload.role,
                manager: payload.manager,
                status: payload.status,
            });
        }, 400);
    });
}
