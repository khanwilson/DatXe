export const baseUrl = {
  value: 'http://192.168.1.40:4000/api',
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/phone',
    REQUEST_OTP: '/auth/otp/request',
    VERIFY_OTP: '/auth/otp/verify',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
  },
  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
};
