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
      if (!token) {
        set({ isAuthenticated: false, isHydrating: false });
        return;
      }
      
      // We have a token, assume authenticated for UI purposes
      // and let subsequent API calls verify the token validity
      const savedUser = await storage.get(STORAGE_KEYS.USER_PROFILE) as User | null;
      set({ user: savedUser, isAuthenticated: !!savedUser });
    } catch (err) {
      logger.warn('hydrate failed:', getErrorMessage(err));
      set({ isAuthenticated: false });
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
      await storage.set(STORAGE_KEYS.USER_PROFILE, user);
      set({ user, isAuthenticated: true });
    } catch (err: any) {
      // Provide clear, context-specific login error messages
      const status: number | undefined = err?.response?.status;
      let message: string;
      if (!err?.response) {
        message = 'No internet connection. Check your network and try again.';
      } else if (status === 401) {
        message = 'Incorrect password. Please try again.';
      } else if (status === 404) {
        message = 'Account not found. The test database may have reset. Please Create a New Account.';
      } else if (status === 400) {
        message = 'Invalid email or password. Please check your details.';
      } else if (status === 429) {
        message = 'Too many attempts. Please wait a moment and try again.';
      } else {
        message = `Login failed (${status ?? 'unknown'}). Please try again.`;
      }
      set({ error: message });
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
      await storage.remove(STORAGE_KEYS.USER_PROFILE);
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
