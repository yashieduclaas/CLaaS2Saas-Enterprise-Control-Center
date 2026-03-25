import { apiClient } from '@/api/client';

export interface ModuleDto {
  solutionCode: string;
  moduleCode: string;
  moduleName: string;
  description: string;
  baseUrl: string;
  moduleLead: string;
  moduleLeadEmail: string;
  moduleVersion: string;
}

export interface RegisterModuleRequest {
  solutionCode: string;
  moduleCode: string;
  moduleName: string;
  description: string;
  baseUrl: string;
  moduleLead: string;
  moduleLeadEmail: string;
  moduleVersion: string;
}

export interface UpdateModuleRequest {
  solutionCode: string;
  moduleCode: string;
  moduleName: string;
  description: string;
  baseUrl: string;
  moduleLead: string;
  moduleLeadEmail: string;
  moduleVersion: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorCode: string | null;
  errorMessage: string | null;
}

export const modulesApi = {
  list: async (): Promise<ModuleDto[]> => {
    const response = await apiClient.get<ApiResponse<ModuleDto[]>>('/api/v1/modules');
    return response.data.data;
  },

  register: async (payload: RegisterModuleRequest): Promise<void> => {
    await apiClient.post<ApiResponse<Record<string, never>>>('/api/v1/modules/register', {
      SolutionCode: payload.solutionCode,
      ModuleCode: payload.moduleCode,
      ModuleName: payload.moduleName,
      Description: payload.description,
      BaseUrl: payload.baseUrl,
      ModuleLead: payload.moduleLead,
      ModuleLeadEmail: payload.moduleLeadEmail,
      ModuleVersion: payload.moduleVersion,
    });
  },

  update: async (payload: UpdateModuleRequest): Promise<void> => {
    await apiClient.put<ApiResponse<Record<string, never>>>('/api/v1/modules/update', {
      SolutionCode: payload.solutionCode,
      ModuleCode: payload.moduleCode,
      ModuleName: payload.moduleName,
      Description: payload.description,
      BaseUrl: payload.baseUrl,
      ModuleLead: payload.moduleLead,
      ModuleLeadEmail: payload.moduleLeadEmail,
      ModuleVersion: payload.moduleVersion,
    });
  },
} as const;
