import { z } from 'zod';
import { PERMISSION_CODES } from '@claas2saas/contracts/rbac';

const PermissionCodeSchema = z.enum(PERMISSION_CODES);

const ResponseMetaSchema = z.object({
  requestId: z.string(),
  timestamp: z.string(),
  apiVersion: z.string(),
});

export const RoleDtoSchema = z.object({
  roleId: z.string().uuid(),
  tenantId: z.string(),
  moduleId: z.string(),
  roleCode: z.string(),
  roleName: z.string(),
  roleType: z.enum(['VIEWER', 'CONTRIBUTOR', 'COLLABORATOR', 'ADMIN', 'GLOBAL_ADMIN']),
  isSystemRole: z.boolean(),
  isActive: z.boolean(),
  permissionCodes: z.array(PermissionCodeSchema),
  createdAt: z.string(),
});

export type RoleDtoValidated = z.infer<typeof RoleDtoSchema>;

export const RoleListResponseSchema = z.object({
  data: z.array(RoleDtoSchema),
  meta: ResponseMetaSchema,
});

export type RoleListResponse = z.infer<typeof RoleListResponseSchema>;
