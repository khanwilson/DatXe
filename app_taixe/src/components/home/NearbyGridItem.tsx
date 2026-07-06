// 1. IMPORTS
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from 'components/text/AppText';
import { RenderImage } from 'components/image/RenderImage';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
export interface NearbyItem {
  id: string;
  name: string;
  category: string;
  stars: number;
  distance: string;
  imageUrl: string;
}

interface Props {
  item: NearbyItem;
}

// 3. COMPONENT FUNCTION
export const NearbyGridItem: React.FC<Props> = ({ item }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  return (
    <View style={styles.card}>
      <RenderImage source={item.imageUrl} style={styles.image} />
      <View style={styles.info}>
        <AppText style={styles.name} numberOfLines={1}>
          {item.name}
        </AppText>
        <AppText style={styles.category} numberOfLines={1}>
          {item.category}
        </AppText>
        <View style={styles.metaRow}>
          <AppText style={styles.stars}>Star {item.stars}</AppText>
          <AppText style={styles.distance}>{item.distance}</AppText>
        </View>
      </View>
    </View>
  );
};

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: theme.color.card.bg,
    borderRadius: theme.dimensions.p12,
    borderWidth: 1,
    borderColor: theme.color.border.light,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 80,
  },
  info: {
    padding: theme.dimensions.p10,
  },
  name: {
    fontSize: theme.fontSize.p14,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p2,
  },
  category: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
    marginBottom: theme.dimensions.p4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stars: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
  },
  distance: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
  },
});

// 5. EXPORT
export default NearbyGridItem;
