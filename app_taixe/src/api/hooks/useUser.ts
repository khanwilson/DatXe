import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UpdateProfileRequest, userService } from 'api/services/userService';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';

// Query Keys
export const USER_KEYS = {
  profile: ['user', 'profile'] as const,
};

// Get user profile query hook
export const useUserProfile = () => {
  const accessToken = ZustandPersist(useShallow((state) => state.accessToken));

  return useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: () => userService.getProfile(),
    enabled: !!accessToken, // Only fetch if user is logged in
  });
};

// Update profile mutation hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update user in zustand
      ZustandPersist.getState().setUser(updatedUser);
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile });
    },
    onError: (error) => {
      console.error('Update profile failed:', error);
    },
  });
};
