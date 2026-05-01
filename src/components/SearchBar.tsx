import { useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({ value, onChange, placeholder = 'Search courses...', debounceMs = 300 }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(text), debounceMs);
  }, [onChange, debounceMs]);

  return (
    <View className="flex-row items-center bg-surface rounded-xl px-4 py-2.5 mb-4">
      <Text className="text-textMuted mr-2">🔍</Text>
      <TextInput
        defaultValue={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        className="flex-1 text-textPrimary text-base"
        accessibilityLabel="Search courses"
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChange('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Clear search"
        >
          <Text className="text-textMuted text-lg">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
