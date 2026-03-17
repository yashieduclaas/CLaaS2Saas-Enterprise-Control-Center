// features/user-enrichment/types/user.ts

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    role: string;
    manager: string;
    status: 'Active' | 'Inactive';
}

export interface UpdateUserRequest {
    displayName: string;
    role: string;
    manager: string;
    status: 'Active' | 'Inactive';
}
