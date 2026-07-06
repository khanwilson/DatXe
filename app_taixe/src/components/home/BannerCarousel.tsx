// 1. IMPORTS
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { AppText } from 'components/text/AppText';
import { RenderImage } from 'components/image/RenderImage';
import { getString } from 'localization/index';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
const SCREEN_WIDTH = Dimensions.get('window').width;

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

const MOCK_BANNERS: BannerItem[] = [
  {
    id: '1',
    title: 'Ride Saigon',
    subtitle: '50% off first ride',
    imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2025/08/dat-xe-taxi-mai-linh-1-585x350.jpg',
  },
  {
    id: '2',
    title: 'Fast Delivery',
    subtitle: 'Free delivery today',
    imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2025/08/xe-hop-dong-mai-linh-585x350.jpg',
  },
  {
    id: '3',
    title: 'Safe Ride',
    subtitle: 'Trusted & professional drivers',
    imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2025/08/Taxi-Mai-Linh-Ha-Noi-%E2%80%93-Lua-chon-an-toan-uy-tin-cho-moi-hanh-trinh-585x350.jpg',
  },
  {
    id: '4',
    title: 'Family Car',
    subtitle: 'Spacious 7-seat rides available',
    imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2025/08/mai-linh-7-cho-gia-dinh--585x350.jpg',
  },
];

interface Props {}

// 3. COMPONENT FUNCTION
export const BannerCarousel: React.FC<Props> = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const horizontalPadding = theme.dimensions.p16;
  const bannerWidth = SCREEN_WIDTH - horizontalPadding * 2;
  const bannerHeight = bannerWidth / 2;

  const renderItem = ({ item }: { item: BannerItem }) => (
    <View
      style={[
        styles.bannerCard,
        { width: bannerWidth, height: bannerHeight },
      ]}
    >
      <RenderImage source={item.imageUrl} style={styles.bannerImage} />
      <View style={styles.bannerOverlay}>
        <AppText style={styles.bannerTitle}>{item.title}</AppText>
        <AppText style={styles.bannerSubtitle}>{item.subtitle}</AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>
        {getString('homeBannersTitle')}
      </AppText>
      <Carousel
        width={bannerWidth}
        height={bannerHeight}
        data={MOCK_BANNERS}
        renderItem={renderItem}
        autoPlay={false}
        loop={true}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
      />
    </View>
  );
};

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  section: {
    marginBottom: theme.dimensions.p20,
  },
  sectionTitle: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.text.primary,
    paddingHorizontal: theme.dimensions.p16,
    marginBottom: theme.dimensions.p12,
  },
  bannerCard: {
    borderRadius: theme.dimensions.p12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: theme.dimensions.p20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bannerTitle: {
    fontSize: theme.fontSize.p20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: theme.dimensions.p4,
  },
  bannerSubtitle: {
    fontSize: theme.fontSize.p14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

// 5. EXPORT
export default BannerCarousel;
