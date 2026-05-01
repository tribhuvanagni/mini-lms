import { create } from 'zustand';
import { authApi } from '@/api/auth';
import { secureStorage, TOKEN_KEYS } from '@/services/secureStorage';
import { storage, STORAGE_KEYS } from '@/services/storage';
import { getErrorMessage } from '@/utils/errorMessage';
import { logger } from '@/utils/logger';
import type { User, LoginPayload, RegisterPayload } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  error: string | null;
}

interface AuthActions {
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,
  error: null,

  hydrate: async () => {
    set({ isHydrating: true });
    try {
      const token = await secureStorage.get(TOKEN_KEYS.ACCESS);
      if (!token) return;

      const { data } = await authApi.currentUser();
      set({ user: data.data, isAuthenticated: true });
      storage.set(STORAGE_KEYS.USER_PROFILE, data.data);
    } catch (err) {
      logger.warn('hydrate failed:', getErrorMessage(err));
      await get().logout();
    } finally {
      set({ isHydrating: false });
    }
  },

  login: async (payload) => {
    set({ error: null });
    try {
      const { data } = await authApi.login(payload);
      const { user, accessToken, refreshToken } = data.data;
      await secureStorage.set(TOKEN_KEYS.ACCESS, accessToken);
      await secureStorage.set(TOKEN_KEYS.REFRESH, refreshToken);
      storage.set(STORAGE_KEYS.USER_PROFILE, user);
      set({ user, isAuthenticated: true });
    } catch (err) {
      set({ error: getErrorMessage(err) });
      throw err;
    }
  },

  register: async (payload) => {
    set({ error: null });
    try {
      await authApi.register({ ...payload, role: 'USER' });
      // auto-login after register
      await get().login({ email: payload.email, password: payload.password });
    } catch (err) {
      set({ error: getErrorMessage(err) });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // best effort
    } finally {
      await secureStorage.remove(TOKEN_KEYS.ACCESS);
      await secureStorage.remove(TOKEN_KEYS.REFRESH);
      storage.remove(STORAGE_KEYS.USER_PROFILE);
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  clearError: () => set({ error: null }),

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    set({ user: updated });
    storage.set(STORAGE_KEYS.USER_PROFILE, updated);
  },
}));
