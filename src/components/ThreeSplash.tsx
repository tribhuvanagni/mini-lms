import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Props {
  onAnimationComplete: () => void;
}

// Floating particle dot
function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  const y = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, { toValue: -60, duration: 3000 + delay, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.8, duration: 400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 2600 + delay, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(y, { toValue: height, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#8B5CF6',
        opacity,
        transform: [{ translateY: y }],
      }}
    />
  );
}

// Ring component
function Ring({ scale, opacity }: { scale: Animated.Value; opacity: Animated.Value }) {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: '#6366F1',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

export function ThreeSplash({ onAnimationComplete }: Props) {
  const masterOpacity = useRef(new Animated.Value(1)).current;

  // Core orb
  const orbScale = useRef(new Animated.Value(0)).current;
  const orbGlow = useRef(new Animated.Value(0)).current;
  const orbFloat = useRef(new Animated.Value(0)).current;
  const orbRotate = useRef(new Animated.Value(0)).current;

  // Rings
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;

  // Text
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // Progress
  const progress = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      // Step 1: Orb scales in with glow
      Animated.parallel([
        Animated.spring(orbScale, { toValue: 1, friction: 4, tension: 20, useNativeDriver: true }),
        Animated.timing(orbGlow, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      // Step 2: Text fades in
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      // Step 3: Subtitle + progress bar appear
      Animated.parallel([
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(progressOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous floating animation on orb
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbFloat, { toValue: -12, duration: 1800, useNativeDriver: true }),
        Animated.timing(orbFloat, { toValue: 12, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Orb slow rotation (represented as scale oscillation since rotate is tricky without skew)
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbRotate, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(orbRotate, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Pulsing rings
    const pulseRing = (scale: Animated.Value, opacity: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 2.5, duration: 2000, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(opacity, { toValue: 0.6, duration: 200, useNativeDriver: true }),
              Animated.timing(opacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };

    pulseRing(ring1Scale, ring1Opacity, 0);
    pulseRing(ring2Scale, ring2Opacity, 1000);

    // Progress bar
    Animated.timing(progress, { toValue: 1, duration: 2800, useNativeDriver: false }).start();

    // Fade out the whole splash
    setTimeout(() => {
      Animated.timing(masterOpacity, { toValue: 0, duration: 700, useNativeDriver: true }).start(
        onAnimationComplete
      );
    }, 3400);
  }, []);

  const rotate = orbRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const particles = [
    { x: width * 0.1, size: 4, delay: 0 },
    { x: width * 0.25, size: 6, delay: 500 },
    { x: width * 0.45, size: 3, delay: 1200 },
    { x: width * 0.6, size: 5, delay: 300 },
    { x: width * 0.75, size: 4, delay: 900 },
    { x: width * 0.88, size: 7, delay: 150 },
    { x: width * 0.35, size: 3, delay: 700 },
    { x: width * 0.55, size: 5, delay: 1500 },
  ];

  return (
    <Animated.View style={[styles.root, { opacity: masterOpacity }]}>
      <LinearGradient
        colors={['#020617', '#0F0F2D', '#1E1B4B', '#0F172A']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <Particle key={i} x={p.x} size={p.size} delay={p.delay} />
      ))}

      {/* Pulsing rings */}
      <View style={styles.center}>
        <Ring scale={ring1Scale} opacity={ring1Opacity} />
        <Ring scale={ring2Scale} opacity={ring2Opacity} />

        {/* Outer decorative ring */}
        <View style={styles.outerRing} />

        {/* Core orb */}
        <Animated.View
          style={[
            styles.orb,
            {
              transform: [
                { scale: orbScale },
                { translateY: orbFloat },
                { rotate },
              ],
              opacity: orbGlow,
            },
          ]}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#4F46E5']}
            style={styles.orbInner}
          />
          {/* Orb glow highlight */}
          <View style={styles.orbHighlight} />
        </Animated.View>

        {/* Icon in center of orb */}
        <Animated.View
          style={[
            styles.orbIcon,
            { opacity: orbGlow, transform: [{ scale: orbScale }, { translateY: orbFloat }] },
          ]}
        >
          <Text style={{ fontSize: 32 }}>📚</Text>
        </Animated.View>
      </View>

      {/* Text block */}
      <Animated.View
        style={[
          styles.textBlock,
          { opacity: textOpacity, transform: [{ translateY: textY }] },
        ]}
      >
        <Text style={styles.appName}>MINI LMS</Text>
        <Animated.Text style={[styles.appSubtitle, { opacity: subtitleOpacity }]}>
          MOBILE APP
        </Animated.Text>
      </Animated.View>

      {/* Footer progress */}
      <Animated.View style={[styles.footer, { opacity: progressOpacity }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingText}>Initializing Experience…</Text>
      </Animated.View>

      {/* Ambient glow at top */}
      <View style={styles.topGlow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  orb: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  orbInner: {
    flex: 1,
    borderRadius: 65,
  },
  orbHighlight: {
    position: 'absolute',
    top: 12,
    left: 20,
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '-30deg' }],
  },
  orbIcon: {
    position: 'absolute',
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 40,
  },
  appName: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: 'rgba(99, 102, 241, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  appSubtitle: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 5,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    width: '100%',
  },
  progressTrack: {
    width: 200,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  loadingText: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  topGlow: {
    position: 'absolute',
    top: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(79, 70, 229, 0.12)',
    alignSelf: 'center',
  },
});
