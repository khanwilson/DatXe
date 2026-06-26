import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from 'theme/index';
import { AppText } from 'components/text/AppText';

const SplashScreen: React.FC = () => {
  const theme = useAppTheme();
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E63946',
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
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.dimensions.p24,
    },
    logoText: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#E63946',
    },
    brandName: {
      fontSize: theme.fontSize.p24,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 1,
      marginBottom: theme.dimensions.p8,
    },
    tagline: {
      fontSize: theme.fontSize.p16,
      color: '#FFFFFF',
      opacity: 0.9,
      letterSpacing: 0.5,
    },
  });

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

export default SplashScreen;
