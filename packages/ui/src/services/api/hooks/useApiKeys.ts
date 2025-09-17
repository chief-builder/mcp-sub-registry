import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiKeyService, type ApiKeyFilters } from '../../apiKeys';
import type { CreateApiKeyRequest } from '../models';

// Query keys
export const apiKeyKeys = {
  all: ['apiKeys'] as const,
  lists: () => [...apiKeyKeys.all, 'list'] as const,
  list: (filters: ApiKeyFilters) => [...apiKeyKeys.lists(), filters] as const,
  details: () => [...apiKeyKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiKeyKeys.details(), id] as const,
};

// Get all API keys
export function useApiKeys(filters: ApiKeyFilters = {}) {
  return useQuery({
    queryKey: apiKeyKeys.list(filters),
    queryFn: () => ApiKeyService.getApiKeys(filters),
  });
}

// Get single API key by ID - not implemented in current API
// export function useApiKey(id: string) {
//   return useQuery({
//     queryKey: apiKeyKeys.detail(id),
//     queryFn: () => ApiKeyService.getApiKey(id),
//     enabled: !!id,
//   });
// }

// Create new API key
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => ApiKeyService.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
    },
  });
}

// Update API key - not implemented in current API
// export function useUpdateApiKey() {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: UpdateApiKeyRequest }) =>
//       ApiKeyService.updateApiKey(id, data),
//     onSuccess: (_, { id }) => {
//       queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
//       queryClient.invalidateQueries({ queryKey: apiKeyKeys.detail(id) });
//     },
//   });
// }

// Delete API key
export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApiKeyService.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
    },
  });
}