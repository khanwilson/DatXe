import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  RequestOtpRequest,
  VerifyOtpRequest,
} from 'api/services/authService';
import ZustandPersist from 'zustand/persist';

// Query Keys
export const AUTH_KEYS = {
  user: ['user'] as const,
};

// Request OTP mutation hook
export const useRequestOtp = () => {
  return useMutation({
    mutationFn: (data: RequestOtpRequest) => authService.requestOtp(data),
    onError: (error) => {
      console.error('Request OTP failed:', error);
    },
  });
};

// Verify OTP mutation hook
export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (response) => {
      // Save tokens + user to zustand
      ZustandPersist.getState().setTokens(response.accessToken, response.refreshToken);
      ZustandPersist.getState().setUser(response.user);
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
    onError: (error) => {
      console.error('Verify OTP failed:', error);
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
