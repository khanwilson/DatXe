import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

// API Functions
export const userService = {
  getProfile: (): Promise<User> => {
    return apiClient.get(ENDPOINTS.USER.PROFILE);
  },

  updateProfile: (data: UpdateProfileRequest): Promise<User> => {
    return apiClient.put(ENDPOINTS.USER.UPDATE_PROFILE, data);
  },
};
