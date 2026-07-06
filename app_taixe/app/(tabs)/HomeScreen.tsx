// 1. IMPORTS
import { BannerCarousel } from 'components/home/BannerCarousel';
import { HomeSearchBar } from 'components/home/HomeSearchBar';
import { NearbyGrid } from 'components/home/NearbyGrid';
import { ServiceSlider } from 'components/home/ServiceSlider';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
// (no constants needed; all data lives in its respective component)

// 3. COMPONENT FUNCTION
export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSearch = () => {
    router.push('/SearchDestinationScreen');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchWrap}>
          <HomeSearchBar onPress={handleSearch} />
        </View>

        <ServiceSlider />
        <BannerCarousel />
        <NearbyGrid />
      </ScrollView>
    </View>
  );
}

// 4. STYLESHEET
const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.dimensions.p12,
    paddingBottom: theme.dimensions.p24,
  },
  searchWrap: {
    paddingHorizontal: theme.dimensions.p16,
    marginBottom: theme.dimensions.p20,
  },
});
