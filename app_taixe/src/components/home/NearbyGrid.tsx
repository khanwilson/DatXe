// 1. IMPORTS
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from 'components/text/AppText';
import { getString } from 'localization/index';
import { ITheme, useAppTheme } from 'theme/index';
import { NearbyGridItem } from './NearbyGridItem';

// 2. VARIABLES & TYPES
interface NearbyItem {
  id: string;
  name: string;
  category: string;
  stars: number;
  distance: string;
  imageUrl: string;
}

const MOCK_NEARBY: NearbyItem[] = [
  { id: '1', name: 'Phở Hùng', category: 'Food', stars: 4.5, distance: '0.3 km', imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2024/10/thumb-1-525x285.jpg' },
  { id: '2', name: 'Cà Phê Trung Nguyên', category: 'Cafe', stars: 4.2, distance: '0.5 km', imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2024/10/thumb-2-525x285.jpg' },
  { id: '3', name: 'Circle K', category: 'Convenience', stars: 4.0, distance: '0.2 km', imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2024/10/thumb-3-525x285.jpg' },
  { id: '4', name: 'Highlands Coffee', category: 'Cafe', stars: 4.3, distance: '0.7 km', imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2024/10/thumb-4-525x285.jpg' },
  { id: '5', name: 'Bánh Mì Huỳnh Hoa', category: 'Food', stars: 4.7, distance: '1.0 km', imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2024/10/Xe-ghep-525x285.jpg' },
  { id: '6', name: 'FamilyMart', category: 'Convenience', stars: 4.1, distance: '0.4 km', imageUrl: 'https://mailinhhanoi.vn/wp-content/uploads/2025/08/dich-vu-taxi-mai-linh--585x350.jpg' },
];

interface Props {}

// 3. COMPONENT FUNCTION
export const NearbyGrid: React.FC<Props> = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>
        {getString('homeNearbyTitle')}
      </AppText>
      <View style={styles.grid}>
        {MOCK_NEARBY.map((item) => (
          <NearbyGridItem key={item.id} item={item} />
        ))}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.dimensions.p16,
    gap: theme.dimensions.p12,
  },
});

// 5. EXPORT
export default NearbyGrid;
