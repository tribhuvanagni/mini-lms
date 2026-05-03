import { useEffect, useRef } from 'react';
import { Animated, Dimensions, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  onAnimationComplete: () => void;
}

export function AnimatedSplashScreen({ onAnimationComplete }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold for a moment, then fade out
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(onAnimationComplete);
      }, 1200);
    });
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        opacity: fadeAnim,
      }}
    >
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, backgroundColor: '#4F46E5', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 40 }}>📚</Text>
          </View>
          <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
            Mini LMS
          </Text>
          <Text style={{ color: '#8B5CF6', fontSize: 18, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>
            Mobile App
          </Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}
