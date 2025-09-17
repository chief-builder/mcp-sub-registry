import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthService, type LoginData, type RegisterData } from '../../auth';
// import type { User } from '../models'; // Not needed currently

// Query keys
export const authKeys = {
  me: ['auth', 'me'] as const,
};

// Get current user
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => AuthService.getCurrentUser(),
    retry: false,
  });
}

// Login mutation
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginData) =>
      AuthService.login(credentials),
  });
}

// Register mutation
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) =>
      AuthService.register(data),
  });
}