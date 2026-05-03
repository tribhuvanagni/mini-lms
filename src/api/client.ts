import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/constants/env';
import { secureStorage, TOKEN_KEYS } from '@/services/secureStorage';
import { logger } from '@/utils/logger';
import { addBreadcrumb } from '@/services/sentry';

let isRefreshing = false;
// queue requests that come in while a refresh is in flight
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(err: unknown, token: string | null) {
  refreshQueue.forEach(p => (err ? p.reject(err) : p.resolve(token!)));
  refreshQueue = [];
}

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.get(TOKEN_KEYS.ACCESS);
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

apiClient.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      addBreadcrumb(
        `API error: ${error.response?.status ?? 'network'} ${original.url ?? ''}`,
        'http',
        'error',
      );
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(token => {
        original.headers.set('Authorization', `Bearer ${token}`);
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await secureStorage.get(TOKEN_KEYS.REFRESH);
      if (!refreshToken) throw new Error('no refresh token');

      const { data } = await axios.post(
        `${ENV.API_BASE_URL}/api/v1/users/refresh-token`,
        { refreshToken },
        { timeout: 8_000 }
      );

      const newAccess: string = data.data.accessToken;
      await secureStorage.set(TOKEN_KEYS.ACCESS, newAccess);

      processQueue(null, newAccess);
      original.headers.set('Authorization', `Bearer ${newAccess}`);
      return apiClient(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      logger.warn('refresh failed, clearing tokens');
      await secureStorage.remove(TOKEN_KEYS.ACCESS);
      await secureStorage.remove(TOKEN_KEYS.REFRESH);
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
