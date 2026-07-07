import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginResponse } from '../types/auth';
import { getCurrentUser } from '../api/authApi';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (data: LoginResponse) => {
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
      },
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },
      setUser: (user: User) => {
        set({ user });
      },
      fetchCurrentUser: async () => {
        try {
          if (!get().accessToken) return;
          const response = await getCurrentUser();
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      // Persist tokens AND isAuthenticated flag
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // If we have a token after rehydration, ensure isAuthenticated is true
        if (state?.accessToken) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);
