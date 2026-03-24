// features/auth/services/authService.ts
// Mock auth service — replace body with:
//   return apiClient.post('/auth/login', payload);
// when backend is ready.

import type { LoginRequest, LoginResponse } from '../types/auth';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                accessToken: 'mock-token',
                refreshToken: 'mock-refresh',
                user: {
                    id: '1',
                    name: 'Demo User',
                    email: payload.email,
                    roles: ['GLOBAL_ADMIN'],
                },
            });
        }, 500);
    });
}
