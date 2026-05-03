import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  setupNotificationChannel,
  scheduleInactivityReminder,
  cancelInactivityReminder,
} from '@/services/notifications';
import { logger } from '@/utils/logger';

export function useNotifications() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    setupNotificationChannel().catch(logger.error);

    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current === 'active' && next.match(/inactive|background/)) {
        scheduleInactivityReminder().catch(logger.error);
      } else if (next === 'active') {
        cancelInactivityReminder().catch(logger.error);
      }
      appState.current = next;
    });

      // Notifications listener removed to avoid static import crashes in Expo Go 53+

    return () => {
      sub.remove();
    };
  }, []);
}
