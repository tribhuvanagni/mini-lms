import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, className = '' }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ width: width as number, height, borderRadius, opacity }}
      className={`bg-surface-muted ${className}`}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <View className="flex-row p-4 bg-surface rounded-2xl mb-3 items-center">
      <Skeleton width={80} height={80} borderRadius={12} />
      <View className="flex-1 ml-3 gap-2">
        <Skeleton height={16} width="80%" />
        <Skeleton height={12} width="50%" />
        <Skeleton height={12} width="30%" />
      </View>
    </View>
  );
}
