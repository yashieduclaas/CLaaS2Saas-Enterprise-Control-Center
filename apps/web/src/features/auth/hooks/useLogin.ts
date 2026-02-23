// features/auth/hooks/useLogin.ts
// Manages login state and calls authService.
// SignInPage must never call the service directly.

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { getRoutePath } from '@/rbac/RoutePermissionMap';

interface LoginState {
    isLoading: boolean;
    error: string | null;
}

interface UseLoginReturn extends LoginState {
    signIn: () => Promise<void>;
}

export function useLogin(): UseLoginReturn {
    const navigate = useNavigate();
    const [state, setState] = useState<LoginState>({
        isLoading: false,
        error: null,
    });

    const signIn = useCallback(async () => {
        setState({ isLoading: true, error: null });
        try {
            // Mock: simulates auth handshake
            // Replace with MSAL popup/redirect when ready:
            //   await msalInstance.loginPopup(loginRequest);
            await login({ email: 'demo@claas2saas.com', password: '' });

            // On success → redirect to kernel dashboard
            navigate(getRoutePath('kernel-dashboard'), { replace: true });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
            setState({ isLoading: false, error: message });
        }
    }, [navigate]);

    return { ...state, signIn };
}
