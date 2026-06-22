import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppText } from 'components/text/AppText';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

export default function SplashScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        // Simulate loading time
        setTimeout(() => {
          if (hasSeenOnboarding === 'true') {
            // User has seen onboarding, go to signin
            router.replace('/SigninStack/SigninScreen');
          } else {
            // User hasn't seen onboarding
            router.replace('/OnBoardingScreen');
          }
        }, 2000); // 2 seconds
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Fallback: go to onboarding
        router.replace('/OnBoardingScreen');
      }
    };

    checkOnboardingStatus();
  }, []);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Template</AppText>
      <AppText style={styles.subtitle}>Focus with comfort</AppText>
    </View>
  );
}

const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.neutral[900],
  },
  title: {
    fontSize: theme.fontSize.p32,
    fontWeight: 'bold',
    color: theme.color.textColor.white,
    marginBottom: theme.dimensions.p8,
  },
  subtitle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.textColor.subText,
  },
});