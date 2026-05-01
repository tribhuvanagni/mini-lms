import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/theme';

export default function Splash() {
  const router = useRouter();
  const { isHydrating, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isHydrating) return;
    if (isAuthenticated) {
      router.replace('/(tabs)/home' as any);
    } else {
      router.replace('/(auth)/login' as any);
    }
  }, [isHydrating, isAuthenticated]);

  return (
    <View className="flex-1 bg-bgPrimary items-center justify-center">
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
