import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServerService, type ServerFilters } from '../../servers';
import type { PublishServerRequest } from '../models';

// Query keys
export const serverKeys = {
  all: ['servers'] as const,
  lists: () => [...serverKeys.all, 'list'] as const,
  list: (filters: ServerFilters) => [...serverKeys.lists(), filters] as const,
  details: () => [...serverKeys.all, 'detail'] as const,
  detail: (name: string) => [...serverKeys.details(), name] as const,
  versions: (name: string) => [...serverKeys.all, 'versions', name] as const,
};

// Get servers with cursor-based filtering
export function useServers(filters: ServerFilters = {}) {
  return useQuery({
    queryKey: serverKeys.list(filters),
    queryFn: () => ServerService.getServers(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get the latest version of a server by name
export function useServer(serverName: string) {
  return useQuery({
    queryKey: serverKeys.detail(serverName),
    queryFn: () => ServerService.getServer(serverName),
    enabled: !!serverName,
  });
}

// Get all versions of a server by name
export function useServerVersions(serverName: string) {
  return useQuery({
    queryKey: serverKeys.versions(serverName),
    queryFn: () => ServerService.getServerVersions(serverName),
    enabled: !!serverName,
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
