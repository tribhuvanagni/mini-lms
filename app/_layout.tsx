import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { usePrefsStore } from '@/store/prefsStore';
import { useNotifications } from '@/hooks/useNotifications';

function AppContent() {
  const hydrate = useAuthStore(s => s.hydrate);
  const hydratePrefs = usePrefsStore(s => s.hydrate);
  const hydrateCourses = useCourseStore(s => s.hydrate);
  useNotifications();

  useEffect(() => {
    hydratePrefs();
    hydrateCourses();
    hydrate();
  }, []);

  return (
    <>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
