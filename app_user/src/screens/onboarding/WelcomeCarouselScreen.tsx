import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText } from 'components/text/AppText';
import React, { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ITheme, useAppTheme } from 'theme/index';
import { OnboardingStackParamList } from './OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'WelcomeCarousel'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelcomeSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  backgroundColor: string;
}

const WELCOME_DATA: WelcomeSlide[] = [
  {
    id: 1,
    title: 'Đặt xe dễ dàng',
    subtitle: 'Easy Booking',
    description: 'Chỉ vài tap, bạn sẽ có một chiếc taxi đang đến chờ bạn',
    icon: '🚗',
    backgroundColor: '#E63946',
  },
  {
    id: 2,
    title: 'Giá cả minh bạch',
    subtitle: 'Transparent Pricing',
    description: 'Không phí ẩn, giá cước rõ ràng từ lúc đặt xe',
    icon: '💰',
    backgroundColor: '#1A1A1A',
  },
  {
    id: 3,
    title: 'An toàn tuyệt đối',
    subtitle: 'Safety First',
    description: 'Tài xế xác minh, mã hóa kết nối, theo dõi thời gian thực',
    icon: '🛡️',
    backgroundColor: '#E63946',
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const buttonSkipWidth = 80;

const WelcomeCarouselScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const skipButtonOpacity = useSharedValue(1);
  const skipButtonTranslateX = useSharedValue(0);
  const nextButtonTranslateX = useSharedValue(0);
  const nextButtonWidth = useSharedValue(buttonSkipWidth);

  const handleNext = () => {
    if (currentIndex < WELCOME_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      navigation.replace('Permissions' as never);
    }
  };

  const handleSkip = () => {
    navigation.replace('Permissions' as never);
  };

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  React.useEffect(() => {
    const maxWidth = SCREEN_WIDTH - theme.dimensions.p40;
    if (currentIndex === 2) {
      skipButtonOpacity.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.ease) });
      skipButtonTranslateX.value = withTiming(-100, { duration: 350, easing: Easing.out(Easing.ease) });
      nextButtonTranslateX.value = withTiming(-buttonSkipWidth, { duration: 350, easing: Easing.out(Easing.ease) });
      nextButtonWidth.value = withTiming(maxWidth, { duration: 350, easing: Easing.out(Easing.ease) });
    } else {
      skipButtonOpacity.value = withTiming(1, { duration: 350 });
      skipButtonTranslateX.value = withTiming(0, { duration: 350 });
      nextButtonTranslateX.value = withTiming(0, { duration: 350 });
      nextButtonWidth.value = withTiming(buttonSkipWidth, { duration: 350 });
    }
  }, [currentIndex, skipButtonOpacity, skipButtonTranslateX, nextButtonWidth, theme.dimensions]);

  const skipAnimStyle = useAnimatedStyle(() => ({
    opacity: skipButtonOpacity.value,
    transform: [{ translateX: skipButtonTranslateX.value }],
  }));

  const nextAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nextButtonTranslateX.value }],
    width: nextButtonWidth.value,
  }));

  const isLastSlide = currentIndex === WELCOME_DATA.length - 1;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScroll}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {WELCOME_DATA.map((slide) => (
          <View key={slide.id} style={styles.slideContainer}>
            <View style={styles.contentArea}>
              <View style={styles.slide}>
                <AppText style={styles.icon}>{slide.icon}</AppText>
                <AppText style={styles.title}>{slide.title}</AppText>
                <AppText style={styles.subtitle}>{slide.subtitle}</AppText>
                <AppText style={styles.description}>{slide.description}</AppText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ justifyContent: 'flex-end' }}>
        <View style={styles.dotContainer}>
          {WELCOME_DATA.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomArea}>
        <AnimatedTouchableOpacity
          onPress={handleSkip}
          activeOpacity={0.8}
          style={[styles.skipButton, skipAnimStyle]}
        >
          <AppText style={styles.skipText}>Skip</AppText>
        </AnimatedTouchableOpacity>
        <AnimatedTouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[styles.nextButton, nextAnimStyle]}
        >
          <AppText style={styles.nextText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </AppText>
        </AnimatedTouchableOpacity>
      </View>
    </View>
  );
};

const stylesSheet = (theme: ITheme) => StyleSheet.create({
  scrollView: { flex: 1 },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'space-between',
    paddingTop: theme.dimensions.p40,
    paddingBottom: theme.dimensions.p40,
    paddingHorizontal: theme.dimensions.p20,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 80, marginBottom: theme.dimensions.p32 },
  title: {
    fontSize: theme.fontSize.p24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: theme.dimensions.p12,
  },
  subtitle: {
    fontSize: theme.fontSize.p14,
    color: '#E63946',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.dimensions.p16,
  },
  description: {
    fontSize: theme.fontSize.p16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  bottomArea: {
    flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: theme.dimensions.p20, paddingBottom: theme.dimensions.p40,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.dimensions.p32,
    gap: theme.dimensions.p8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
  },
  dotActive: {
    backgroundColor: '#E63946',
    width: 24,
  },
  skipButton: {
    width: buttonSkipWidth,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E63946',
    paddingHorizontal: theme.dimensions.p20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: theme.fontSize.p16,
    color: '#666666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingHorizontal: theme.dimensions.p20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontSize: theme.fontSize.p16,
    color: 'white',
    fontWeight: '500',
  },
  headerArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.dimensions.p24,
    paddingHorizontal: theme.dimensions.p20,
  },
  progressText: {
    fontSize: theme.fontSize.p14,
    color: '#999999',
    fontWeight: '500',
  },
});

export default WelcomeCarouselScreen;
