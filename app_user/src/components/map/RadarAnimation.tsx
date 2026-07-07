// 1. IMPORTS
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
interface RadarAnimationProps {
  size?: number;
  visible?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

// 3. COMPONENT FUNCTION
export const RadarAnimation: React.FC<RadarAnimationProps> = ({ size = 260, visible = true }) => {
  const theme = useAppTheme();
  const center = size / 2;
  const primaryColor = theme.color.primary.actionGreen;

  // Sweep rotation
  const rotation = useSharedValue(0);

  // Pulse rings — 3 rings with staggered delays
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);
  const pulse3 = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    rotation.value = withRepeat(
      withTiming(360, { duration: 2500, easing: Easing.linear }),
      -1,
      false,
    );

    pulse1.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1, false);
    pulse2.value = withRepeat(withDelay(600, withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) })), -1, false);
    pulse3.value = withRepeat(withDelay(1200, withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) })), -1, false);
  }, [visible, rotation, pulse1, pulse2, pulse3]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse1.value, [0, 0.3, 1], [0, 0.6, 0]),
    transform: [{ scale: interpolate(pulse1.value, [0, 1], [0.3, 1]) }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse2.value, [0, 0.3, 1], [0, 0.6, 0]),
    transform: [{ scale: interpolate(pulse2.value, [0, 1], [0.3, 1]) }],
  }));

  const ring3Style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse3.value, [0, 0.3, 1], [0, 0.6, 0]),
    transform: [{ scale: interpolate(pulse3.value, [0, 1], [0.3, 1]) }],
  }));

  if (!visible) return null;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Static background rings */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={center} cy={center} r={center * 0.95} stroke={primaryColor} strokeWidth={1} fill="none" opacity={0.15} />
        <Circle cx={center} cy={center} r={center * 0.65} stroke={primaryColor} strokeWidth={1} fill="none" opacity={0.2} />
        <Circle cx={center} cy={center} r={center * 0.35} stroke={primaryColor} strokeWidth={1} fill="none" opacity={0.25} />
      </Svg>

      {/* Pulsating rings */}
      <AnimatedView style={[styles.pulseRing, { width: size * 0.95, height: size * 0.95, borderRadius: size * 0.475, borderColor: primaryColor }, ring1Style]} />
      <AnimatedView style={[styles.pulseRing, { width: size * 0.65, height: size * 0.65, borderRadius: size * 0.325, borderColor: primaryColor }, ring2Style]} />
      <AnimatedView style={[styles.pulseRing, { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175, borderColor: primaryColor }, ring3Style]} />

      {/* Sweep line */}
      <AnimatedView style={[styles.sweepContainer, { width: size, height: size }, sweepStyle]}>
        <View style={[styles.sweepLine, { width: center, height: 2, backgroundColor: primaryColor, left: center, top: center - 1 }]} />
      </AnimatedView>

      {/* Center dot */}
      <View style={[styles.centerDot, { backgroundColor: primaryColor }]} />
    </View>
  );
};

// 4. STYLESHEET
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  sweepContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sweepLine: {
    position: 'absolute',
    transformOrigin: 'left center',
  },
  centerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

// 5. EXPORT
export default RadarAnimation;
