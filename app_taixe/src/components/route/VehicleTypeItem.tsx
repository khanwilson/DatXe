// 1. IMPORTS
import { RenderImage } from 'components/image/RenderImage';
import { AppText } from 'components/text/AppText';
import React, { useMemo } from 'react';
import { ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
export interface VehicleType {
  id: string;
  name: string;
  icon: ImageSourcePropType | string;
  eta: string;
  realPrice: number;
  discountPrice: number;
}

interface Props {
  vehicle: VehicleType;
  selected: boolean;
  onPress: (id: string) => void;
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN') + 'đ';
};

// 3. COMPONENT FUNCTION
export const VehicleTypeItem: React.FC<Props> = ({ vehicle, selected, onPress }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme, selected), [theme, selected]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(vehicle.id)}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrap}>
        <RenderImage source={vehicle.icon} style={styles.iconPlaceholder} />
      </View>
      <View style={styles.info}>
        <AppText style={styles.name}>{vehicle.name}</AppText>
        <AppText style={styles.eta}>{vehicle.eta}</AppText>
      </View>
      <View style={styles.prices}>
        <AppText style={styles.discountPrice}>{formatPrice(vehicle.discountPrice)}</AppText>
        <AppText style={styles.realPrice}>{formatPrice(vehicle.realPrice)}</AppText>
      </View>
    </TouchableOpacity>
  );
};

// 4. STYLESHEET
const stylesSheet = (theme: ITheme, selected: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p16,
    backgroundColor: selected ? theme.color.background.surface : theme.color.card.bg,
    borderRadius: theme.dimensions.p12,
    borderWidth: 1.5,
    borderColor: selected ? theme.color.primary.actionGreen : theme.color.border.light,
    marginBottom: theme.dimensions.p8,
  },
  iconWrap: {
    width: theme.dimensions.p48,
    height: theme.dimensions.p48,
    borderRadius: theme.dimensions.p8,
    backgroundColor: theme.color.background.app,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.dimensions.p12,
  },
  iconPlaceholder: {
    width: theme.dimensions.p32,
    height: theme.dimensions.p32,
    borderRadius: theme.dimensions.p4,
    backgroundColor: theme.color.border.light,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.p14,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p4,
  },
  eta: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
  },
  prices: {
    alignItems: 'flex-end',
  },
  discountPrice: {
    fontSize: theme.fontSize.p14,
    fontWeight: '700',
    color: theme.color.primary.actionGreen,
    marginBottom: theme.dimensions.p4,
  },
  realPrice: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
    textDecorationLine: 'line-through',
  },
});

// 5. EXPORT
export default VehicleTypeItem;
