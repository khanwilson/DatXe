import { CustomTabBar } from 'components/navigation/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="HomeScreen" />
      <Tabs.Screen name="ExploreScreen" />
      <Tabs.Screen name="ProfileScreen" />
    </Tabs>
  );
}
