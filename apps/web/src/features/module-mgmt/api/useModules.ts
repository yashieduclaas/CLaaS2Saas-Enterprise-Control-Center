import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { modulesApi, type RegisterModuleRequest, type UpdateModuleRequest } from './modules.api';

export function useModules() {
  return useQuery({
    queryKey: ['modules', 'list'] as const,
    queryFn: () => modulesApi.list(),
  });
}

export function useRegisterModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterModuleRequest) => modulesApi.register(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modules', 'list'] });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateModuleRequest) => modulesApi.update(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modules', 'list'] });
    },
  });
}
