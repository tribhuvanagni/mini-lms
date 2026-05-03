import { logger } from '@/utils/logger';

/**
 * Stub Sentry service to prevent runtime crashes caused by 
 * dynamic imports of uninstalled native modules in the build environment.
 */
export async function initSentry() {
  logger.log('[Sentry Stub] initSentry');
}

export function addBreadcrumb(message: string, category?: string, level?: string) {
  logger.log('[Sentry Stub] addBreadcrumb:', message, category, level);
}

export function captureException(error: any, options?: any) {
  logger.error('[Sentry Stub] captureException:', error, options);
}
