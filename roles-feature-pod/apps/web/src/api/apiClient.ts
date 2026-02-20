// apps/web/src/api/apiClient.ts
// Shared authenticated HTTP client.
// Uses getAccessToken from useAuth — never imports MSAL directly.
//
// NOTE: If this file already exists in the platform, do NOT overwrite it.
// This is provided as the baseline pattern; skip if already present.

import type { ApiEnvelope } from "@claas2saas/contracts";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly correlationId?: string,
  ) {
    super(`API ${status}: ${detail}`);
    this.name = "ApiError";
  }
}

/**
 * Minimal typed fetch wrapper.
 *
 * @param path     - API path e.g. "/api/v1/roles"
 * @param token    - Bearer token from useAuth().getAccessToken()
 * @param signal   - AbortSignal for React Query cancellation
 */
export async function apiFetch<T>(
  path: string,
  token: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(path, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let detail = text;
    let correlationId: string | undefined;

    try {
      const json = JSON.parse(text) as { detail?: string; correlationId?: string };
      detail = json.detail ?? text;
      correlationId = json.correlationId;
    } catch {
      // ignore JSON parse failure — use raw text
    }

    throw new ApiError(response.status, detail, correlationId);
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}
