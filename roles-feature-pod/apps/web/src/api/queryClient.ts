// apps/web/src/api/queryClient.ts
// Singleton React Query client.
// NOTE: If this file already exists in the platform, do NOT overwrite it.

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30 s
      retry: 1,                // One retry — avoid storms
      refetchOnWindowFocus: false,
    },
  },
});
