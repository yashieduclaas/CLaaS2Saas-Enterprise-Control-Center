import { useState } from 'react';
import { createSecurityRole } from '../services/securityRoleService';
import type { CreateSecurityRoleRequest, SecurityRole } from '../types/securityRole';

export interface UseCreateSecurityRoleResult {
  create: (payload: CreateSecurityRoleRequest) => Promise<SecurityRole>;
  loading: boolean;
}

export function useCreateSecurityRole(): UseCreateSecurityRoleResult {
  const [loading, setLoading] = useState(false);

  async function create(payload: CreateSecurityRoleRequest): Promise<SecurityRole> {
    setLoading(true);
    try {
      return await createSecurityRole(payload);
    } finally {
      setLoading(false);
    }
  }

  return { create, loading };
}
