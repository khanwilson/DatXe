// 1. IMPORTS
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from 'components/text/AppText';
import { getString } from 'localization/index';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
interface Props {
  onPress: () => void;
}

// 3. COMPONENT FUNCTION
export const HomeSearchBar: React.FC<Props> = ({ onPress }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.searchIcon}>
        <View style={styles.searchIconRing} />
        <View style={styles.searchIconHandle} />
      </View>
      <AppText style={styles.placeholder}>
        {getString('homeWhereTo')}
      </AppText>
    </TouchableOpacity>
  );
};

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.input.bg,
    borderRadius: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p14,
    minHeight: theme.dimensions.p48,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: theme.dimensions.p6,
    elevation: 3,
  },
  searchIcon: {
    width: theme.dimensions.p20,
    height: theme.dimensions.p20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.dimensions.p10,
  },
  searchIconRing: {
    width: theme.dimensions.p12,
    height: theme.dimensions.p12,
    borderRadius: theme.dimensions.p6,
    borderWidth: 2,
    borderColor: theme.color.text.secondary,
  },
  searchIconHandle: {
    position: 'absolute',
    right: theme.dimensions.p2,
    bottom: theme.dimensions.p2,
    width: theme.dimensions.p6,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.color.text.secondary,
    transform: [{ rotate: '45deg' }],
  },
  placeholder: {
    flex: 1,
    fontSize: theme.fontSize.p16,
    color: theme.color.text.secondary,
  },
});

// 5. EXPORT
export default HomeSearchBar;
