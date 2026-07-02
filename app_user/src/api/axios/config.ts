export const baseUrl = {
  value: 'http://192.168.1.25:3000/api/v1',
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
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
  // Routes / Places (Goong)
  ROUTES: {
    AUTOCOMPLETE: '/routes/places/autocomplete',
    PLACE_DETAIL: '/routes/places',
    DIRECTIONS: '/routes/directions',
  },
};
