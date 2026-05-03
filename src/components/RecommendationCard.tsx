import { View, Text } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  title: string;
  reason: string;
}

export function RecommendationCard({ title, reason }: Props) {
  const colors = useThemeColors();
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{reason}</Text>
    </View>
  );
}
