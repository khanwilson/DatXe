import { Stack } from 'expo-router';

export default function SigninLayout() {
  return (
    <Stack initialRouteName='SigninScreen'>
      <Stack.Screen name='SigninScreen' options={{ headerShown: false }} />
      <Stack.Screen name='OtpScreen' options={{ headerShown: false }} />
    </Stack>
  );
}
