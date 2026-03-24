// features/auth/types/auth.ts
// Type contracts for authentication — wired to backend when MSAL/API is ready.

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        roles: string[];
    };
}
