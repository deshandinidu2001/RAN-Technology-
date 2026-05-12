import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import { useCartStore } from './cartStore';
import { useFavoritesStore } from './favoritesStore';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data;

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Restore this user's saved favorites
          const saved = localStorage.getItem(`ran-favorites-${user.id}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              useFavoritesStore.getState().loadUserFavorites(parsed.items || []);
            } catch {}
          }
        } catch (error: any) {
          const message = error.response?.data?.error || error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      loginWithGoogle: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/google', { accessToken });
          const { user, token } = response.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, isAuthenticated: true, isLoading: false });
          const saved = localStorage.getItem(`ran-favorites-${user.id}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              useFavoritesStore.getState().loadUserFavorites(parsed.items || []);
            } catch {}
          }
        } catch (error: any) {
          const message = error.response?.data?.error || 'Google login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      loginWithFacebook: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/facebook', { accessToken });
          const { user, token } = response.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, isAuthenticated: true, isLoading: false });
          const saved = localStorage.getItem(`ran-favorites-${user.id}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              useFavoritesStore.getState().loadUserFavorites(parsed.items || []);
            } catch {}
          }
        } catch (error: any) {
          const message = error.response?.data?.error || 'Facebook login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', {
            email,
            password,
            name,
          });
          const { user, token } = response.data;

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        const { user } = get();
        // Save this user's favorites to a user-scoped key before clearing
        if (user?.id) {
          const favorites = useFavoritesStore.getState().items;
          localStorage.setItem(`ran-favorites-${user.id}`, JSON.stringify({ items: favorites }));
        }

        delete api.defaults.headers.common['Authorization'];
        useCartStore.getState().clearCart();
        useFavoritesStore.getState().clear();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          const response = await api.get('/auth/me');
          set({
            user: response.data.user,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid or expired
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      updateProfile: async (data: { name?: string; email?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put('/auth/profile', data);
          set({
            user: response.data.user,
            isLoading: false,
          });
        } catch (error: any) {
          const message = error.response?.data?.error || error.response?.data?.message || 'Update failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },
    }),
    {
      name: 'ran-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
