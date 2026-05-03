import { Pressable, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { PressableProps } from 'react-native';

interface Props extends PressableProps {
  label: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const getStyles = (variant: string, size: string, disabled: boolean, fullWidth: boolean) => {
  const baseStyle: any = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    alignSelf: fullWidth ? 'auto' : 'flex-start',
  };

  switch (size) {
    case 'sm':
      baseStyle.paddingHorizontal = 12;
      baseStyle.paddingVertical = 8;
      break;
    case 'md':
      baseStyle.paddingHorizontal = 20;
      baseStyle.paddingVertical = 14;
      break;
    case 'lg':
      baseStyle.paddingHorizontal = 24;
      baseStyle.paddingVertical = 18;
      break;
  }

  const textStyle: any = {
    fontWeight: '700',
    fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 18,
  };

  switch (variant) {
    case 'primary':
      baseStyle.backgroundColor = '#4F46E5';
      textStyle.color = '#FFFFFF';
      break;
    case 'outline':
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 1.5;
      baseStyle.borderColor = '#4F46E5';
      textStyle.color = '#818CF8';
      break;
    case 'ghost':
      baseStyle.backgroundColor = 'transparent';
      textStyle.color = '#818CF8';
      break;
    case 'danger':
      baseStyle.backgroundColor = 'rgba(239, 68, 68, 0.15)';
      textStyle.color = '#EF4444';
      break;
  }

  return { containerStyle: baseStyle, textStyle };
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  onPress,
  disabled,
  ...rest
}: Props) {
  const handlePress: typeof onPress = (e) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    onPress?.(e);
  };

  const { containerStyle, textStyle } = getStyles(variant, size, !!disabled || loading, fullWidth);

  return (
    <Pressable
      {...rest}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || loading }}
      style={({ pressed }) => [
        containerStyle,
        pressed && !disabled && !loading ? { opacity: 0.8, transform: [{ scale: 0.98 }] } : null
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#818CF8' : variant === 'danger' ? '#EF4444' : '#fff'} />
      ) : (
        <Text style={textStyle}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
