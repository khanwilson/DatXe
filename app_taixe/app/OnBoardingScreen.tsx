import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppButton } from 'components/button/AppButton';
import { AppText } from 'components/text/AppText';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to Template',
    description: 'Create your perfect focus environment with immersive 3D spaces',
  },
  {
    id: 2,
    title: 'Customize Your Space',
    description: 'Interact with beautiful 3D environments designed for productivity',
  },
  {
    id: 3,
    title: 'Stay Focused',
    description: 'Let our ambient animations help you maintain concentration',
  },
];

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [currentStep, setCurrentStep] = useState(0);
  const handleNext = async () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save onboarding viewed status
      try {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/SigninStack/SigninScreen');
      } catch (error) {
        console.error('Error saving onboarding status:', error);
        router.replace('/SigninStack/SigninScreen');
      }
    }
  };

  const handleSkip = async () => {
    // Save onboarding viewed status when skipping
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/SigninStack/SigninScreen');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/SigninStack/SigninScreen');
    }
  };

  const currentData = onboardingData[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText style={styles.title}>{currentData.title}</AppText>
        <AppText style={styles.description}>{currentData.description}</AppText>
      </View>

      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          text="Skip"
          onPress={handleSkip}
          style={styles.skipButton}
          textStyle={styles.skipText}
        />

        <AppButton
          text={currentStep === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={styles.nextButton}
          textStyle={styles.nextText}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.neutral[900],
    paddingHorizontal: theme.dimensions.p20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.dimensions.p20,
  },
  title: {
    fontSize: theme.fontSize.p24,
    fontWeight: 'bold',
    color: theme.color.textColor.white,
    textAlign: 'center',
    marginBottom: theme.dimensions.p20,
  },
  description: {
    fontSize: theme.fontSize.p16,
    color: theme.color.textColor.subText,
    textAlign: 'center',
    lineHeight: theme.dimensions.p24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.dimensions.p40,
  },
  dot: {
    width: theme.dimensions.p8,
    height: theme.dimensions.p8,
    borderRadius: theme.dimensions.p4,
    backgroundColor: theme.color.neutral[600],
    marginHorizontal: theme.dimensions.p4,
  },
  activeDot: {
    backgroundColor: theme.color.white,
    width: theme.dimensions.p20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.dimensions.p40,
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p24,
  },
  skipText: {
    color: theme.color.neutral[400],
  },
  nextButton: {
    backgroundColor: theme.color.white,
    paddingVertical: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p24,
  },
  nextText: {
    color: theme.color.neutral[900],
  },
});