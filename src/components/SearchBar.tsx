import { useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search courses, instructors...' }: Props) {
  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <Text style={{ color: '#64748B', marginRight: 10, fontSize: 16 }}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        style={{
          flex: 1,
          color: '#F8FAFC',
          fontSize: 15,
        }}
        accessibilityLabel="Search courses"
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Clear search"
        >
          <Text style={{ color: '#64748B', fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
