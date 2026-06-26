import React from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAppTheme } from 'theme/index';
import { AppText } from 'components/text/AppText';
import { AppButton } from 'components/button/AppButton';

const GetStartedScreen: React.FC = () => {
  const theme = useAppTheme();
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)/HomeScreen');
    } catch (error) {
      console.warn('Error saving onboarding status:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E63946',
      justifyContent: 'space-between',
      paddingHorizontal: theme.dimensions.p20,
      paddingTop: theme.dimensions.p40,
      paddingBottom: theme.dimensions.p40,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      fontSize: 100,
      marginBottom: theme.dimensions.p40,
    },
    title: {
      fontSize: theme.fontSize.p24,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: theme.dimensions.p16,
    },
    subtitle: {
      fontSize: theme.fontSize.p16,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: theme.dimensions.p32,
    },
    bottomArea: {
      gap: theme.dimensions.p12,
    },
    getStartedButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
    },
    getStartedButtonText: {
      color: '#E63946',
      fontSize: theme.fontSize.p16,
      fontWeight: '600',
    },
    signInButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FFFFFF',
    },
    signInButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.p16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText style={styles.icon}>🎉</AppText>
        <AppText style={styles.title}>Ready to Go!</AppText>
        <AppText style={styles.subtitle}>
          You&apos;re all set to start booking rides with Mai Linh
        </AppText>
      </View>

      <View style={styles.bottomArea}>
        <AppButton
          text="Get Started"
          onPress={handleGetStarted}
          style={styles.getStartedButton}
          textStyle={styles.getStartedButtonText}
        />
        <AppButton
          text="Sign In"
          onPress={handleGetStarted}
          style={styles.signInButton}
          textStyle={styles.signInButtonText}
        />
      </View>
    </View>
  );
};

export default GetStartedScreen;
