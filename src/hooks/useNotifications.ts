import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
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

    const notifSub = Notifications.addNotificationResponseReceivedListener(res => {
      const data = res.notification.request.content.data;
      logger.log('notification tapped:', data);
    });

    return () => {
      sub.remove();
      notifSub.remove();
    };
  }, []);
}
