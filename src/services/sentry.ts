import { ENV } from '@/constants/env';
import { logger } from '@/utils/logger';

/**
 * Sentry initialization — guarded for Expo Go compatibility.
 *
 * @sentry/react-native requires native modules that are NOT available in
 * Expo Go. We lazy-import and wrap in try/catch so the app never crashes
 * regardless of environment.
 *
 * In production builds (EAS Build), Sentry will work fully.
 * In Expo Go, it will silently skip initialization.
 */

let sentryInitialized = false;

export async function initSentry(): Promise<void> {
  if (sentryInitialized) return;
  if (!ENV.SENTRY_DSN) {
    logger.log('Sentry DSN not configured — skipping initialization.');
    return;
  }

  try {
    const Sentry = await import('@sentry/react-native');

    Sentry.init({
      dsn: ENV.SENTRY_DSN,
      debug: __DEV__,
      // Reduce noise in dev
      enabled: !__DEV__,
      // Performance monitoring — sample 20% of transactions in production
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      // Session replay — off by default (heavy)
      _experiments: {
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
      },
    });

    sentryInitialized = true;
    logger.log('Sentry initialized successfully.');
  } catch (err) {
    // Expected failure in Expo Go — native modules not available
    logger.warn('Sentry init failed (expected in Expo Go):', String(err));
  }
}

/**
 * Capture an exception in Sentry (if initialized).
 * Safe to call from anywhere — silently no-ops if Sentry isn't available.
 */
export async function captureException(error: unknown, context?: Record<string, unknown>): Promise<void> {
  try {
    const Sentry = await import('@sentry/react-native');
    if (context) {
      Sentry.withScope(scope => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch {
    // Sentry not available — swallow silently
  }
}

/**
 * Capture a breadcrumb for debugging context.
 */
export async function addBreadcrumb(
  message: string,
  category: string = 'app',
  level: 'info' | 'warning' | 'error' = 'info',
): Promise<void> {
  try {
    const Sentry = await import('@sentry/react-native');
    Sentry.addBreadcrumb({ message, category, level });
  } catch {
    // Sentry not available
  }
}
