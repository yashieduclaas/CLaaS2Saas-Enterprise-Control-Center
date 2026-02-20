// apps/web/src/features/roles/api/useRolesQuery.ts
//
// React Query hook for GET /api/v1/roles
//
// Rules obeyed:
//   - Typed with RoleDto from contracts
//   - Stable query key (ROLES_QUERY_KEY)
//   - No manual caching
//   - Single retry (no storm)
//   - Cancellation via AbortSignal
//   - Prepared for future pagination via ListQuery parameters

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { RoleDto } from "@claas2saas/contracts";
import type { ListQuery } from "@claas2saas/contracts";
import { useAuth } from "@/auth/useAuth";
import { apiFetch } from "@/api/apiClient";

// ── Query key factory ──────────────────────────────────────────────────────
export const ROLES_QUERY_KEY = {
  all: ["roles"] as const,
  list: (query?: ListQuery) => ["roles", "list", query ?? {}] as const,
} as const;

// ── Hook ───────────────────────────────────────────────────────────────────
/**
 * Fetches the paginated roles list for the current tenant.
 *
 * @param query - Optional pagination/sort params. Reserved for future use.
 *                Pass undefined for the initial MVP (full list, no pagination).
 */
export function useRolesQuery(
  query?: ListQuery,
): UseQueryResult<readonly RoleDto[], Error> {
  const { getAccessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ROLES_QUERY_KEY.list(query),
    enabled: isAuthenticated,
    retry: 1,
    queryFn: async ({ signal }) => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Unable to acquire access token.");
      }

      // Future: append query params for pagination
      // e.g. /api/v1/roles?pageNumber=1&pageSize=50
      return apiFetch<readonly RoleDto[]>("/api/v1/roles", token, signal);
    },
  });
}
