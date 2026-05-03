// Web polyfill for secure storage.
// Browsers do not have a native secure store equivalent to iOS Keychain.
// This falls back to localStorage, which is standard practice for web SPAs.

export const secureStorage = {
  get: async (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  set: async (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  remove: async (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export const TOKEN_KEYS = {
  ACCESS: 'auth_access_token',
  REFRESH: 'auth_refresh_token',
} as const;
