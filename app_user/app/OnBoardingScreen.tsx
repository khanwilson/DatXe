import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import OnboardingStack from 'screens/onboarding/OnboardingStack';

export default function OnBoardingScreen() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <OnboardingStack />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
