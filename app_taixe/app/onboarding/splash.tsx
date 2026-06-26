import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { ITheme, useAppTheme } from 'theme/index';
import { AppText } from 'components/text/AppText';

const SplashScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/onboarding/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logo}>
          <AppText style={styles.logoText}>M</AppText>
        </View>
        <AppText style={styles.brandName}>MAI LINH</AppText>
        <AppText style={styles.tagline}>Taxi Service</AppText>
      </Animated.View>
    </View>
  );
};

const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.primary.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.dimensions.p16,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.color.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.dimensions.p24,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.color.primary.darkGreen,
  },
  brandName: {
    fontSize: theme.fontSize.p24,
    fontWeight: '700',
    color: theme.color.text.inverse,
    letterSpacing: 1,
    marginBottom: theme.dimensions.p8,
  },
  tagline: {
    fontSize: theme.fontSize.p16,
    color: theme.color.text.inverse,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
