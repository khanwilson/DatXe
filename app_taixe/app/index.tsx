import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppText } from 'components/text/AppText';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { clearAllCache } from 'utils/clearCache';

const SPLASH_DELAY = 2500;

export default function SplashScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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

    const checkOnboardingStatus = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        setTimeout(() => {
          if (hasSeenOnboarding === 'true') {
            // User has seen onboarding, go to signin
            // router.replace('/SigninStack/SigninScreen');
            router.replace('/(tabs)/HomeScreen');
          } else {
            // User hasn't seen onboarding, start the onboarding flow
            router.replace('/onboarding/welcome');
          }
        }, SPLASH_DELAY);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Fallback: start the onboarding flow
        router.replace('/onboarding/welcome');
      }
    };

    checkOnboardingStatus();
  }, [fadeAnim, scaleAnim]);

  const handleClearCache = async () => {
    await clearAllCache();
    router.replace('/onboarding/welcome');
  };

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
      {__DEV__ && (
        <TouchableOpacity style={styles.devButton} onPress={handleClearCache}>
          <AppText style={styles.devButtonText}>[ DEV ] Clear Cache & Restart</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.primary.darkGreen,
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
  devButton: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p8,
    borderWidth: 1,
    borderColor: theme.color.text.inverse,
    borderRadius: theme.dimensions.p8,
  },
  devButtonText: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.inverse,
  },
});
