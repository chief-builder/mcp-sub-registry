import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updateApiToken, initializeApiClientWithToken } from '../services/api/config';
// Temporary simple user type
interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (token: string, user: User) => {
        updateApiToken(token);
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        updateApiToken(null);
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'mcp-registry-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          initializeApiClientWithToken(state.token);
        }
      },
    }
  )
);