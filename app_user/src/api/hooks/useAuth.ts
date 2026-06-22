import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginRequest, RegisterRequest } from 'api/services/authService';
import ZustandPersist from 'zustand/persist';

// Query Keys
export const AUTH_KEYS = {
  user: ['user'] as const,
};

// Login mutation hook
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // Save tokens to zustand
      ZustandPersist.getState().setTokens(response.accessToken, response.refreshToken);
      ZustandPersist.getState().setUser(response.user);
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// Register mutation hook
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      // Save tokens to zustand
      ZustandPersist.getState().setTokens(response.accessToken, response.refreshToken);
      ZustandPersist.getState().setUser(response.user);
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
    onError: (error) => {
      console.error('Register failed:', error);
    },
  });
};

// Logout mutation hook
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear tokens from zustand
      ZustandPersist.getState().logout();
      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still clear local state on error
      ZustandPersist.getState().logout();
      queryClient.clear();
    },
  });
};
