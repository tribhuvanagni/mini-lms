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

const variants = {
  primary: 'bg-primary active:bg-primary-dark',
  outline: 'border border-primary bg-transparent',
  ghost:   'bg-transparent',
  danger:  'bg-danger active:opacity-80',
};

const labelVariants = {
  primary: 'text-white',
  outline: 'text-primary',
  ghost:   'text-primary',
  danger:  'text-white',
};

const sizes = {
  sm: 'px-3 py-2',
  md: 'px-5 py-3',
  lg: 'px-6 py-4',
};

const labelSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
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

  return (
    <Pressable
      {...rest}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || loading }}
      className={[
        'rounded-xl flex-row items-center justify-center',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : 'self-start',
        (disabled || loading) ? 'opacity-50' : '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? '#6366f1' : '#fff'} />
      ) : (
        <Text
          className={`font-semibold ${labelSizes[size]} ${labelVariants[variant]}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
