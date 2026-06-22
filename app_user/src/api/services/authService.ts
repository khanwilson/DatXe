import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// API Functions
export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
  },

  register: (data: RegisterRequest): Promise<LoginResponse> => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  },

  logout: (): Promise<void> => {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  },
};
