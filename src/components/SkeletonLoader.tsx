import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: Props) {
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
      style={[
        { width: width as number, height, borderRadius, opacity, backgroundColor: '#334155' },
        style
      ]}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <View style={{ backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 20, overflow: 'hidden' }}>
      <Skeleton width="100%" height={180} borderRadius={0} />
      <View style={{ padding: 16, gap: 12 }}>
        <Skeleton height={20} width="85%" />
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="60%" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Skeleton width={28} height={28} borderRadius={14} />
            <Skeleton width={100} height={14} />
          </View>
          <Skeleton width={50} height={24} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}
