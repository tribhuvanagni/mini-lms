import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const INACTIVITY_ID_KEY = 'inactivity_notif_id';

async function hasPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6366f1',
  });
}

export async function notifyBookmarkMilestone(count: number) {
  if (!(await hasPermission())) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎉 You\'re on a roll!',
      body: `${count} courses bookmarked. Keep exploring!`,
      data: { type: 'bookmark_milestone', count },
    },
    trigger: null,
  });
}

export async function scheduleInactivityReminder(): Promise<void> {
  if (!(await hasPermission())) return;
  await cancelInactivityReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📚 Miss learning?',
      body: "You haven't opened the app in a while. Pick up where you left off.",
      data: { type: 'inactivity' },
    },
    trigger: { seconds: 60 * 60 * 24, repeats: false } as any,
  });

  const { storage } = await import('@/services/storage');
  storage.set(INACTIVITY_ID_KEY, id);
  logger.log('inactivity reminder scheduled:', id);
}

export async function cancelInactivityReminder(): Promise<void> {
  const { storage } = await import('@/services/storage');
  const id = storage.get<string>(INACTIVITY_ID_KEY);
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => null);
}
