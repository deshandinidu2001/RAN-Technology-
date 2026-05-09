import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuth,
    updateProfile,
  } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    if (token && !user) {
      checkAuth();
    }
  }, [token, user, checkAuth]);

  // Login handler
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [login]
  );

  // Register handler
  const handleRegister = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        await register(email, password, name);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [register]
  );

  // Logout handler
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Update profile handler
  const handleUpdateProfile = useCallback(
    async (data: { name?: string; email?: string }) => {
      try {
        await updateProfile(data);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [updateProfile]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
    updateProfile: handleUpdateProfile,
  };
};

export default useAuth;
