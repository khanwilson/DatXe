import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';
import ZustandPersist from 'zustand/persist';

// Types
export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

// ---------------------------------------------------------------------------
// DEV-ONLY mock
//
// The backend profile endpoints are not implemented yet (baseUrl is still a
// placeholder). While running a development build we short-circuit the network
// calls so the profile view/edit flow can be demoed end to end against the
// locally persisted user in ZustandPersist.
//
// Remove this block (or gate it behind a real feature flag) once the backend is
// wired. Production builds (`__DEV__ === false`) always hit the real API.
// ---------------------------------------------------------------------------
const mockGetProfile = async (): Promise<User> => {
  const user = ZustandPersist.getState().user;
  return {
    id: user?.id ?? 'dev-user',
    phone: user?.phone ?? '',
    name: user?.name,
    email: user?.email,
  };
};

const mockUpdateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  const user = ZustandPersist.getState().user;
  return {
    id: user?.id ?? 'dev-user',
    phone: user?.phone ?? '',
    name: data.name ?? user?.name,
    email: user?.email,
    avatar: data.avatar,
  };
};

// API Functions
export const userService = {
  getProfile: (): Promise<User> => {
    if (__DEV__) {
      return mockGetProfile();
    }
    return apiClient.get(ENDPOINTS.USER.PROFILE);
  },

  updateProfile: (data: UpdateProfileRequest): Promise<User> => {
    if (__DEV__) {
      return mockUpdateProfile(data);
    }
    return apiClient.put(ENDPOINTS.USER.UPDATE_PROFILE, data);
  },
};
