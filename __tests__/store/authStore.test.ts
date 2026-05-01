// mock modules before imports
jest.mock('../../src/services/secureStorage', () => ({
  secureStorage: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
  TOKEN_KEYS: { ACCESS: 'auth_access_token', REFRESH: 'auth_refresh_token' },
}));

jest.mock('../../src/services/storage', () => ({
  storage: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  STORAGE_KEYS: {
    USER_PROFILE: 'user_profile_v1',
    COURSES: 'courses_v1',
    BOOKMARKS: 'bookmark_ids_v1',
    ENROLLED: 'enrolled_ids_v1',
    PREFS: 'user_prefs_v1',
  },
}));

jest.mock('../../src/api/auth', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    currentUser: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

import { useAuthStore } from '../../src/store/authStore';
import { secureStorage } from '../../src/services/secureStorage';
import { storage } from '../../src/services/storage';
import { authApi } from '../../src/api/auth';

const mockUser = {
  _id: '1',
  username: 'testuser',
  email: 'test@example.com',
  fullName: 'Test User',
  avatar: { url: '', localPath: '' },
  role: 'USER' as const,
  isEmailVerified: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

// reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isHydrating: true,
    error: null,
  });
  jest.clearAllMocks();
});

describe('authStore', () => {
  describe('hydrate', () => {
    it('sets isAuthenticated when token exists and currentUser succeeds', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue('valid-token');
      (authApi.currentUser as jest.Mock).mockResolvedValue({
        data: { data: mockUser },
      });

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isHydrating).toBe(false);
      expect(storage.set).toHaveBeenCalledWith('user_profile_v1', mockUser);
    });

    it('stays unauthenticated when no token', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue(null);

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrating).toBe(false);
      expect(authApi.currentUser).not.toHaveBeenCalled();
    });

    it('calls logout when currentUser throws', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue('expired-token');
      (authApi.currentUser as jest.Mock).mockRejectedValue(new Error('401'));
      (authApi.logout as jest.Mock).mockResolvedValue(undefined);

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(secureStorage.remove).toHaveBeenCalledWith('auth_access_token');
    });
  });

  describe('login', () => {
    it('stores tokens and sets user on success', async () => {
      (authApi.login as jest.Mock).mockResolvedValue({
        data: {
          data: {
            user: mockUser,
            accessToken: 'access-123',
            refreshToken: 'refresh-456',
          },
        },
      });

      await useAuthStore.getState().login({ email: 'test@example.com', password: 'password123' });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(secureStorage.set).toHaveBeenCalledWith('auth_access_token', 'access-123');
      expect(secureStorage.set).toHaveBeenCalledWith('auth_refresh_token', 'refresh-456');
    });

    it('sets error and throws on API failure', async () => {
      (authApi.login as jest.Mock).mockRejectedValue(new Error('bad creds'));

      await expect(
        useAuthStore.getState().login({ email: 'bad@email.com', password: 'wrong' })
      ).rejects.toThrow();

      expect(useAuthStore.getState().error).toBeTruthy();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('calls register then auto-login', async () => {
      (authApi.register as jest.Mock).mockResolvedValue({ data: { data: { user: mockUser } } });
      (authApi.login as jest.Mock).mockResolvedValue({
        data: {
          data: {
            user: mockUser,
            accessToken: 'a',
            refreshToken: 'r',
          },
        },
      });

      await useAuthStore.getState().register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(authApi.register).toHaveBeenCalled();
      expect(authApi.login).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears state even if API logout fails', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      (authApi.logout as jest.Mock).mockRejectedValue(new Error('network'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(secureStorage.remove).toHaveBeenCalledWith('auth_access_token');
      expect(secureStorage.remove).toHaveBeenCalledWith('auth_refresh_token');
      expect(storage.remove).toHaveBeenCalledWith('user_profile_v1');
    });
  });
});
