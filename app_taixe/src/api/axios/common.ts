import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API Response Types - shared across all modules
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface ApiError extends Error {
  config?: InternalAxiosRequestConfig<any>;
  statusCode?: number;
  data?: any;
}

export const handleApiError = (error: AxiosError<any>): ApiError => {
  // Server responded with error status
  const apiError: ApiError = {
    name: 'API Error',
    message: error.message || 'An unexpected error occurred',
  }
  if (error.response) {
    apiError.message = error.response.data?.message || error.message || 'An error occurred';
    apiError.config = error.response.config;
    apiError.statusCode = error.response.status;
    apiError.data = error.response.data;

    return apiError;
  }
  // Request was made but no response received
  if (error.request) {
    apiError.message = 'No response received from server';
    apiError.config = error.request;
    return apiError;
  }
  return apiError;
};
