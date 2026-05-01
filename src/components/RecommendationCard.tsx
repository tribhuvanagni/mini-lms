import { View, Text } from 'react-native';

interface Props {
  title: string;
  reason: string;
}

export function RecommendationCard({ title, reason }: Props) {
  return (
    <View className="bg-surface rounded-xl p-4 mb-2 border border-border">
      <Text className="text-textPrimary text-sm font-semibold mb-1">{title}</Text>
      <Text className="text-textMuted text-xs">{reason}</Text>
    </View>
  );
}
