export interface ModulePermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  fullAccessAllModules: boolean;
}

export interface AuthorizedModule {
  solutionModuleId: string;
  solutionCode: string;
  moduleCode: string;
  moduleName: string;
  roleCode: string;
  roleName: string;
  permissions: ModulePermissions;
}

export interface UserSecurityProfile {
  userId: string;
  entraObjectId: string;
  displayName: string;
  email: string;
  isActive: boolean;
  lastLoginDate?: string;
  authorizedModules: AuthorizedModule[];
}

export interface UserListItem {
  userId: string;
  displayName: string;
  email: string;
  isActive: boolean;
  lastLoginDate?: string;
  activeRoleCount: number;
}
