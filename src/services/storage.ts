import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'mini-lms-store' });

// typed wrapper — everything is JSON-serialised
export const storage = {
  get<T>(key: string): T | null {
    const raw = mmkv.getString(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    mmkv.set(key, JSON.stringify(value));
  },
  remove(key: string): void {
    mmkv.delete(key);
  },
  clear(): void {
    mmkv.clearAll();
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
