import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '@/services/storage';

interface Prefs {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}

interface PrefsState extends Prefs {
  setTheme: (t: Prefs['theme']) => void;
  setNotificationsEnabled: (v: boolean) => void;
  hydrate: () => Promise<void>;
}

const defaults: Prefs = { theme: 'system', notificationsEnabled: true };

export const usePrefsStore = create<PrefsState>((set) => ({
  ...defaults,

  hydrate: async () => {
    const saved = await storage.get<Prefs>(STORAGE_KEYS.PREFS);
    if (saved) set(saved);
  },

  setTheme: (theme) => {
    set({ theme });
    const current = usePrefsStore.getState();
    storage.set(STORAGE_KEYS.PREFS, { theme, notificationsEnabled: current.notificationsEnabled });
  },

  setNotificationsEnabled: (notificationsEnabled) => {
    set({ notificationsEnabled });
    const current = usePrefsStore.getState();
    storage.set(STORAGE_KEYS.PREFS, { theme: current.theme, notificationsEnabled });
  },
}));
