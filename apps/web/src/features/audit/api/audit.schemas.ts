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
