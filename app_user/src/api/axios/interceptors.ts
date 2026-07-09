import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import ZustandPersist from 'zustand/persist';
import { handleApiError } from './common';
import { baseUrl, ENDPOINTS } from './config';

export const requestInterceptorSuccess = (config: InternalAxiosRequestConfig) => {
  const token = ZustandPersist.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseInterceptorSuccess = (response: AxiosResponse) => {
  console.info('[API Response]: ', response);
  return response;
};

// Module-level variables for refresh token handling
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

export const responseInterceptorError = (error: AxiosError) => {
  const apiError = handleApiError(error);
  console.info('[API Error]: ', apiError);

  const originalRequest = error.config;

  if (apiError.statusCode === 401 && originalRequest) {
    const refreshToken = ZustandPersist.getState().refreshToken;

    if (!refreshToken) {
      ZustandPersist.getState().logout();
      return Promise.reject(apiError);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axios(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    isRefreshing = true;

    // Use a separate axios instance to avoid infinite loop
    const refreshInstance = axios.create({
      baseURL: baseUrl.value,
    });

    return new Promise((resolve, reject) => {
      refreshInstance.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken })
        .then(response => {
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          ZustandPersist.getState().setTokens(accessToken, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);
          resolve(axios(originalRequest));
        })
        .catch(err => {
          processQueue(err, null);
          ZustandPersist.getState().logout();
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }

  return Promise.reject(apiError);
};
