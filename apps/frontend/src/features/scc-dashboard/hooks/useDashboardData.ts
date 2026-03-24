// features/scc-dashboard/hooks/useDashboardData.ts
// Fetches dashboard data once on mount with loading/error state.

import { useState, useEffect } from 'react';
import type { DashboardData } from '../types/dashboard';
import { getDashboardData } from '../services/dashboardService';

interface UseDashboardDataResult {
    data: DashboardData | null;
    isLoading: boolean;
    isError: boolean;
}

export function useDashboardData(): UseDashboardDataResult {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setIsError(false);

        getDashboardData()
            .then((result) => {
                if (!cancelled) {
                    setData(result);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setIsError(true);
                    setIsLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, []);

    return { data, isLoading, isError };
}
