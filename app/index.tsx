import { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const { isHydrating, isAuthenticated } = useAuthStore();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Show a manual entrance button if auto-redirect fails after 3 seconds
    const timer = setTimeout(() => {
      if (!isHydrating) setShowFallback(true);
    }, 3000);

    if (!isHydrating) {
      if (isAuthenticated) {
        router.replace('/(tabs)/home' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    }

    return () => clearTimeout(timer);
  }, [isHydrating, isAuthenticated]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
      {!showFallback ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/login' as any)}
          style={{ padding: 16, backgroundColor: COLORS.primary, borderRadius: 12 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Enter Mini LMS</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
