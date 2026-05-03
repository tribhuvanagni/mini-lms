import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

// ─── Expo Go Detection ────────────────────────────────────────────────
// expo-notifications crashes AND shows a banner warning in Expo Go (SDK 53+)
// because remote push support was removed. We detect Expo Go using the
// __DEV__ + Constants pattern and completely skip notification setup.
let _isExpoGo: boolean | null = null;

function isExpoGo(): boolean {
  if (_isExpoGo !== null) return _isExpoGo;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants').default;
    _isExpoGo = Constants.appOwnership === 'expo';
  } catch {
    _isExpoGo = false;
  }
  return _isExpoGo;
}

// ─── Stub Exports (Expo Go) ───────────────────────────────────────────
export async function setupNotificationChannel(): Promise<void> {
  if (isExpoGo()) {
    logger.log('[notifications] Skipped: running in Expo Go.');
    return;
  }
  try {
    const N = await import('expo-notifications');
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    const { status: existing } = await N.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const res = await N.requestPermissionsAsync();
      status = res.status;
    }
    logger.log('[notifications] Permission status:', status);
  } catch (err) {
    logger.warn('[notifications] setupNotificationChannel failed:', String(err));
  }
}

export async function notifyBookmarkMilestone(count: number): Promise<void> {
  if (isExpoGo() || count < 5) return;
  try {
    const N = await import('expo-notifications');
    await N.scheduleNotificationAsync({
      content: {
        title: 'Course Hoarder! 🎉',
        body: `You've bookmarked ${count} courses. Time to start learning!`,
        sound: true,
      },
      trigger: null,
    });
  } catch (err) {
    logger.warn('[notifications] notifyBookmarkMilestone failed:', String(err));
  }
}

const INACTIVITY_ID = 'inactivity_reminder';

export async function scheduleInactivityReminder(): Promise<void> {
  if (isExpoGo()) return;
  try {
    const N = await import('expo-notifications');
    await N.cancelScheduledNotificationAsync(INACTIVITY_ID).catch(() => null);
    await N.scheduleNotificationAsync({
      identifier: INACTIVITY_ID,
      content: {
        title: 'Ready to learn? 📚',
        body: "You haven't opened the app in 24 hours. Jump back in!",
        sound: true,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 24 * 60 * 60,
        repeats: false,
      },
    });
    logger.log('[notifications] 24h reminder scheduled.');
  } catch (err) {
    logger.warn('[notifications] scheduleInactivityReminder failed:', String(err));
  }
}

export async function cancelInactivityReminder(): Promise<void> {
  if (isExpoGo()) return;
  try {
    const N = await import('expo-notifications');
    await N.cancelScheduledNotificationAsync(INACTIVITY_ID);
  } catch (err) {
    logger.warn('[notifications] cancelInactivityReminder failed:', String(err));
  }
}
