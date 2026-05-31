import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '../../settings';
import type { AppSettings } from '../models';

export const settingsKeys = {
  all: ['settings'] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => SettingsService.getSettings(),
    staleTime: 30 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AppSettings>) => SettingsService.updateSettings(data),
    onSuccess: (res) => queryClient.setQueryData(settingsKeys.all, res),
  });
}
