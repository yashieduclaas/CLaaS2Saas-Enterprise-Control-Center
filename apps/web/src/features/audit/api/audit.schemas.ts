import { z } from 'zod';
import { PERMISSION_CODES } from '@claas2saas/contracts/rbac';

const PermissionCodeSchema = z.enum(PERMISSION_CODES);

const ResponseMetaSchema = z.object({
  requestId: z.string(),
  timestamp: z.string(),
  apiVersion: z.string(),
});

export const AuditEventSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  moduleId: z.string(),
  actionName: z.string(),
  permissionCode: PermissionCodeSchema,
  outcome: z.enum(['success', 'denied', 'error']),
  permissionsVersion: z.string(),
  isBreakGlass: z.boolean(),
  timestamp: z.string(),
  correlationId: z.string(),
  info: z.string(),
});

export type AuditEventValidated = z.infer<typeof AuditEventSchema>;

export const AuditListResponseSchema = z.object({
  data: z.array(AuditEventSchema),
  meta: ResponseMetaSchema,
});

export type AuditListResponse = z.infer<typeof AuditListResponseSchema>;

// ─── Audit Session Schema ────────────────────────────────────────────────────

export const AuditSessionSchema = z.object({
  sessionId: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  duration: z.number().nullable(),
  isActive: z.boolean(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
});

export type AuditSession = z.infer<typeof AuditSessionSchema>;

export const AuditSessionsListSchema = z.object({
  data: z.array(AuditSessionSchema),
  meta: ResponseMetaSchema,
});

export type AuditSessionsList = z.infer<typeof AuditSessionsListSchema>;

// ─── Audit Action Log Schema ─────────────────────────────────────────────────

export const AuditActionLogSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  action: z.string(),
  resource: z.string(),
  result: z.string(),
  permissionsVersion: z.string().nullable(),
  timestamp: z.string(),
});

export type AuditActionLog = z.infer<typeof AuditActionLogSchema>;

export const AuditActionsListSchema = z.object({
  data: z.array(AuditActionLogSchema),
  meta: ResponseMetaSchema,
});

export type AuditActionsList = z.infer<typeof AuditActionsListSchema>;

// ─── ECC API Response Envelope ────────────────────────────────────────────────

export const ApiResponseEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.any().nullable(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type ApiResponseEnvelope<T> = {
  success: boolean;
  data: T | null;
  errorCode?: string;
  errorMessage?: string;
};
