/**
 * Use **direct** `process.env.EXPO_PUBLIC_*` references only.
 * Expo Metro inlines these at bundle time; dynamic access like `process.env[key]`
 * or bracket-only forms may not be replaced, so values stay empty in APK / OTA builds.
 */
const DEFAULT_API = 'https://api.freeapi.app';

export const ENV = {
  API_BASE_URL: (process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API).replace(/\/$/, ''),
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  GEMINI_API_KEY: (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '').trim(),
} as const;
