import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServerService, type ServerFilters } from '../../servers';
import type { PublishServerRequest } from '../models';

// Query keys
export const serverKeys = {
  all: ['servers'] as const,
  lists: () => [...serverKeys.all, 'list'] as const,
  list: (filters: ServerFilters) => [...serverKeys.lists(), filters] as const,
  details: () => [...serverKeys.all, 'detail'] as const,
  detail: (id: string) => [...serverKeys.details(), id] as const,
};

// Get all servers with filtering
export function useServers(filters: ServerFilters = {}) {
  return useQuery({
    queryKey: serverKeys.list(filters),
    queryFn: () => ServerService.getServers(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single server by ID
export function useServer(id: string) {
  return useQuery({
    queryKey: serverKeys.detail(id),
    queryFn: () => ServerService.getServer(id),
    enabled: !!id,
  });
}

// Publish new server
export function usePublishServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublishServerRequest) => ServerService.publishServer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serverKeys.lists() });
    },
  });
}