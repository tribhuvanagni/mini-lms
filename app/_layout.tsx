import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useAuthStore } from '@/store/authStore';
import { initSentry } from '@/services/sentry';
import { useCourseStore } from '@/store/courseStore';
import { usePrefsStore } from '@/store/prefsStore';
import { useNotifications } from '@/hooks/useNotifications';
import { ThreeSplash } from '@/components/ThreeSplash';

import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const hydrate = useAuthStore(s => s.hydrate);
  const hydratePrefs = usePrefsStore(s => s.hydrate);
  const hydrateCourses = useCourseStore(s => s.hydrate);
  const theme = usePrefsStore(s => s.theme);
  useNotifications();

  const [appReady, setAppReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    async function load() {
      // Initialize error tracking (silently no-ops in Expo Go)
      await initSentry();
      await hydratePrefs();
      await hydrateCourses();
      await hydrate();
      setAppReady(true);
      SplashScreen.hideAsync();
    }
    load();
  }, []);

  const bgColor = theme === 'light' ? '#F8FAFC' : '#0F172A';
  const statusStyle = theme === 'light' ? 'dark' : 'light';

  return (
    <>
      {(!appReady || !splashFinished) && (
        <ThreeSplash 
          onAnimationComplete={() => setSplashFinished(true)} 
        />
      )}
      
      {appReady && (
        <>
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bgColor } }} />
          <StatusBar style={statusStyle} />
        </>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
