// fail fast if something critical is missing at startup
const get = (key: string, fallback?: string): string => {
  const val = process.env[key] ?? fallback;
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
};

export const ENV = {
  API_BASE_URL: get('EXPO_PUBLIC_API_BASE_URL', 'https://api.freeapi.app'),
  SENTRY_DSN: process.env['EXPO_PUBLIC_SENTRY_DSN'] ?? '',
  GEMINI_API_KEY: process.env['EXPO_PUBLIC_GEMINI_API_KEY'] ?? '',
} as const;

