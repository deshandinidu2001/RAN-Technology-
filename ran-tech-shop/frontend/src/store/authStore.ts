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

          // Restore this user's saved favorites + cart so each customer
          // sees only their own state, even if another account was used
          // on the same browser earlier.
          const savedFavs = localStorage.getItem(`ran-favorites-${user.id}`);
          if (savedFavs) {
            try {
              const parsed = JSON.parse(savedFavs);
              useFavoritesStore.getState().loadUserFavorites(parsed.items || []);
            } catch {}
          }
          const savedCart = localStorage.getItem(`ran-cart-${user.id}`);
          if (savedCart) {
            try {
              const parsed = JSON.parse(savedCart);
              useCartStore.getState().loadUserCart(parsed.items || []);
            } catch {}
          } else {
            // First time this user signs in here — start with an empty cart
            // so they don't inherit the previous account's items.
            useCartStore.getState().clearCart();
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

          // Brand-new account on this device: start with a clean cart and
          // favorites so the new customer doesn't see leftover items from
          // another session on the same browser.
          useCartStore.getState().clearCart();
          useFavoritesStore.getState().clear();
        } catch (error: any) {
          const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        const { user } = get();
        // Save this user's favorites AND cart to user-scoped keys before
        // clearing, so they're restored next time this account logs in.
        if (user?.id) {
          const favorites = useFavoritesStore.getState().items;
          localStorage.setItem(`ran-favorites-${user.id}`, JSON.stringify({ items: favorites }));
          const cartItems = useCartStore.getState().items;
          localStorage.setItem(`ran-cart-${user.id}`, JSON.stringify({ items: cartItems }));
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
