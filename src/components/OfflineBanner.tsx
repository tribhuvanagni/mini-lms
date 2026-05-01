import { View, Text } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  if (isOnline) return null;

  return (
    <View className="bg-danger px-4 py-2 flex-row items-center justify-center">
      <Text className="text-white text-xs font-medium">
        You're offline — showing cached content
      </Text>
    </View>
  );
}
