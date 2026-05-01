import { View, TextInput, Text } from 'react-native';
import type { TextInputProps } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, ...rest }: Props) {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-textSecondary text-sm mb-1 font-medium">{label}</Text>
      ) : null}
      <TextInput
        {...rest}
        className={[
          'bg-surface rounded-xl px-4 py-3 text-textPrimary text-base',
          'border',
          error ? 'border-danger' : 'border-border',
        ].join(' ')}
        placeholderTextColor={COLORS.textMuted}
        accessibilityLabel={label}
        accessibilityHint={hint}
      />
      {error ? (
        <Text className="text-danger text-xs mt-1">{error}</Text>
      ) : hint ? (
        <Text className="text-textMuted text-xs mt-1">{hint}</Text>
      ) : null}
    </View>
  );
}
