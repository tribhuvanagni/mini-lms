/**
 * Privacy-friendly Analytics Service
 * ─────────────────────────────────────
 * No third-party SDKs. No PII sent to any external server.
 * Events are stored locally in AsyncStorage and can be read
 * for a local dashboard or exported for submission purposes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = '@minilms:analytics_events';
const MAX_EVENTS = 500; // rolling cap to avoid unbounded storage

export interface AnalyticsEvent {
  name: string;
  screen?: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
}

async function getEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(ANALYTICS_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

async function saveEvents(events: AnalyticsEvent[]): Promise<void> {
  try {
    // Keep only the latest MAX_EVENTS entries
    const trimmed = events.slice(-MAX_EVENTS);
    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {
    // fail silently — analytics must never crash the app
  }
}

/** Record any named event with optional metadata. */
export async function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean>,
): Promise<void> {
  const events = await getEvents();
  events.push({ name, properties, timestamp: Date.now() });
  await saveEvents(events);
}

/** Convenience: record a screen view. */
export async function trackScreen(screen: string): Promise<void> {
  await trackEvent('screen_view', { screen });
}

/** Retrieve all stored events (for debugging / reporting). */
export async function getAllEvents(): Promise<AnalyticsEvent[]> {
  return getEvents();
}

/** Clear all analytics data (for GDPR / logout). */
export async function clearAnalytics(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANALYTICS_KEY);
  } catch {
    // fail silently
  }
}
