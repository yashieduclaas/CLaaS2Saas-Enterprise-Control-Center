/**
 * Audit contracts — placeholder.
 */

export interface AuditEntry {
  readonly eventId: string;
  readonly tenantId: string;
  readonly principalId: string;
  readonly action: string;
  readonly timestamp: string; // ISO 8601
}
