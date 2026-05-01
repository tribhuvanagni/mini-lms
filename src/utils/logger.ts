// strips in production so no console noise in the APK
const isDev = __DEV__;

export const logger = {
  log: (...args: unknown[]) => isDev && console.log('[LMS]', ...args),
  warn: (...args: unknown[]) => isDev && console.warn('[LMS]', ...args),
  error: (...args: unknown[]) => console.error('[LMS]', ...args), // always
  info: (...args: unknown[]) => isDev && console.info('[LMS]', ...args),
};
