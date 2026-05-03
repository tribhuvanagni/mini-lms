import AsyncStorage from '@react-native-async-storage/async-storage';

// typed wrapper — everything is JSON-serialised
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {
      // ignore
    }
  },
};

export const STORAGE_KEYS = {
  COURSES: 'courses_v1',
  BOOKMARKS: 'bookmark_ids_v1',
  ENROLLED: 'enrolled_ids_v1',
  USER_PROFILE: 'user_profile_v1',
  LAST_ACTIVE: 'last_active_ts',
  PREFS: 'user_prefs_v1',
} as const;
