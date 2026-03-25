import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { modulesApi, type RegisterModuleRequest } from './modules.api';

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
