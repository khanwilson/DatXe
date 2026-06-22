import { Dimensions, PixelRatio } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

const scale = 1

const responsiveSize = (size: number) => {
  const newSize = size * scale
  return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

const heightHeader = 60 + (initialWindowMetrics?.insets?.top || 0)
const heightFooter = 40 + (initialWindowMetrics?.insets?.bottom || 0)

const dimensions = {
  deviceHeight: height,
  deviceWidth: width,
  makeResponsiveSize: responsiveSize,
  getHeightHeader: heightHeader,
  getHeightFooter: heightFooter,
  spacingBottom: (initialWindowMetrics?.insets?.bottom || responsiveSize(16)) + responsiveSize(16),
  p2: responsiveSize(2),
  p4: responsiveSize(4),
  p6: responsiveSize(6),
  p8: responsiveSize(8),
  p10: responsiveSize(10),
  p12: responsiveSize(12),
  p14: responsiveSize(14),
  p16: responsiveSize(16),
  p18: responsiveSize(18),
  p20: responsiveSize(20),
  p24: responsiveSize(24),
  p28: responsiveSize(28),
  p30: responsiveSize(30),
  p32: responsiveSize(32),
  p34: responsiveSize(34),
  p40: responsiveSize(40),
  p44: responsiveSize(44),
  p48: responsiveSize(48),
  p50: responsiveSize(50),
  p52: responsiveSize(52),
  p56: responsiveSize(56),
  p60: responsiveSize(60),
  p62: responsiveSize(62),
  p64: responsiveSize(64),
  p80: responsiveSize(80),
  p96: responsiveSize(96),
}

const fontSize = {
  makeResponsiveSize: responsiveSize,
  p6: responsiveSize(6),
  p8: responsiveSize(8),
  p12: responsiveSize(12),
  p14: responsiveSize(14),
  p16: responsiveSize(16),
  p20: responsiveSize(20),
  p24: responsiveSize(24),
  p32: responsiveSize(32),
  p40: responsiveSize(40),
  p42: responsiveSize(42),
  p52: responsiveSize(52),
  p72: responsiveSize(72),
  p120: responsiveSize(120),
}

export default { dimensions, fontSize }
