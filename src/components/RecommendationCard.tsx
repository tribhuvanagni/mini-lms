import { View, Text, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  title: string;
  reason: string;
  onPress?: () => void;
}

export function RecommendationCard({ title, reason, onPress }: Props) {
  const colors = useThemeColors();
  const inner = (
    <>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{reason}</Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
      {inner}
    </View>
  );
}
