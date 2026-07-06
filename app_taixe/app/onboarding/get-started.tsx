import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppButton } from 'components/button/AppButton';
import { AppText } from 'components/text/AppText';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

const GetStartedScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/SigninStack/SigninScreen');
    } catch (error) {
      console.warn('Error saving onboarding status:', error);
    }
  };

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
          text="Sign In"
          onPress={handleSignIn}
          style={styles.signInButton}
          textStyle={styles.signInButtonText}
        />
      </View>
    </View>
  );
};

const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.primary.darkGreen,
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
    color: theme.color.text.inverse,
    textAlign: 'center',
    marginBottom: theme.dimensions.p16,
  },
  subtitle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.text.inverse,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.dimensions.p32,
    opacity: 0.9,
  },
  bottomArea: {
    gap: theme.dimensions.p12,
  },
  getStartedButton: {
    backgroundColor: theme.color.button.primaryBg,
    borderRadius: 12,
  },
  getStartedButtonText: {
    color: theme.color.button.primaryText,
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.color.white,
  },
  signInButtonText: {
    color: theme.color.text.inverse,
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
  },
});

export default GetStartedScreen;
