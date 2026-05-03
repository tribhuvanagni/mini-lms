import { View, TextInput, Text, StyleSheet } from 'react-native';
import type { TextInputProps } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, ...rest }: Props) {
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <View style={[
        styles.inputContainer,
        error ? styles.borderError : styles.borderNormal
      ]}>
        <TextInput
          {...rest}
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
          accessibilityLabel={label}
          accessibilityHint={hint}
        />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
  },
  borderNormal: {
    borderColor: COLORS.border,
  },
  borderError: {
    borderColor: COLORS.danger,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
