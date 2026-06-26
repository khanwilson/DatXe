import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppText } from 'components/text/AppText';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { clearAllCache } from 'utils/clearCache';

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
            router.replace('/onboarding/splash');
          }
        }, 2000); // 2 seconds
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Fallback: go to onboarding
        router.replace('/onboarding/splash');
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleClearCache = async () => {
    await clearAllCache();
    router.replace('/onboarding/splash');
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Template</AppText>
      <AppText style={styles.subtitle}>Focus with comfort</AppText>
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
  },
  title: {
    fontSize: theme.fontSize.p32,
    fontWeight: 'bold',
    color: theme.color.text.inverse,
    marginBottom: theme.dimensions.p8,
  },
  subtitle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.text.inverse,
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