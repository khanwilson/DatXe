import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './SplashScreen';
import WelcomeCarouselScreen from './WelcomeCarouselScreen';
import PermissionsScreen from './PermissionsScreen';
import GetStartedScreen from './GetStartedScreen';

export type OnboardingStackParamList = {
  Splash: undefined;
  WelcomeCarousel: undefined;
  Permissions: undefined;
  GetStarted: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="WelcomeCarousel"
        component={WelcomeCarouselScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Permissions"
        component={PermissionsScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="GetStarted"
        component={GetStartedScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
