import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

// Types
export interface AuthUser {
  id: string;
  phone: string;
  name?: string;
  email?: string;
}

export interface RequestOtpRequest {
  phone: string;
}

export interface RequestOtpResponse {
  success: boolean;
  // Seconds until the requested OTP expires.
  expiresIn: number;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ---------------------------------------------------------------------------
// DEV-ONLY mock
//
// The backend OTP endpoints (T-0006) are not implemented yet. While running a
// development build we short-circuit the network calls so the auth flow can be
// demoed and tested end to end. The fixed code `000000` is treated as valid.
//
// Remove this block (or gate it behind a real feature flag) once the backend
// is wired. Production builds (`__DEV__ === false`) always hit the real API.
// ---------------------------------------------------------------------------
const DEV_OTP_CODE = '000000';
const DEV_OTP_EXPIRES_IN = 60;

const mockRequestOtp = async (): Promise<RequestOtpResponse> => {
  return { success: true, expiresIn: DEV_OTP_EXPIRES_IN };
};

const mockVerifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  if (data.code !== DEV_OTP_CODE) {
    throw new Error('Mã OTP không đúng');
  }
  return {
    accessToken: 'dev-access-token',
    refreshToken: 'dev-refresh-token',
    user: {
      id: 'dev-user',
      phone: data.phone,
      name: 'Khách Mai Linh',
    },
  };
};

// API Functions
export const authService = {
  // Request an OTP code to be sent to the given phone number.
  requestOtp: (data: RequestOtpRequest): Promise<RequestOtpResponse> => {
    if (__DEV__) {
      return mockRequestOtp();
    }
    return apiClient.post(ENDPOINTS.AUTH.REQUEST_OTP, data);
  },

  // Verify an OTP code and exchange it for auth tokens + user profile.
  verifyOtp: (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    if (__DEV__) {
      return mockVerifyOtp(data);
    }
    return apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
  },

  logout: (): Promise<void> => {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  },
};
