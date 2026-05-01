import { apiClient } from './client';
import type { LoginPayload, LoginResponse, RegisterPayload, User } from '@/types/auth';
import type { ApiResponse } from '@/types/api';
import { retry } from '@/utils/retry';

export const authApi = {
  register: (payload: RegisterPayload) =>
    retry(() =>
      apiClient.post<ApiResponse<{ user: User }>>('/api/v1/users/register', payload)
    ),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<LoginResponse>>('/api/v1/users/login', payload),
  // intentionally no retry on login — wrong password shouldn't retry

  currentUser: () =>
    retry(() => apiClient.get<ApiResponse<User>>('/api/v1/users/current-user')),

  logout: () => apiClient.post('/api/v1/users/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/api/v1/users/refresh-token',
      { refreshToken }
    ),
};
