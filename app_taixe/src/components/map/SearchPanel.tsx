// 1. IMPORTS
import { AppText } from 'components/text/AppText';
import { getString } from 'localization/index';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
interface ISavedShortcut {
  key: string;
  label: string;
}

interface ISearchPanelProps {
  // Opens the destination search / booking entry. Wiring lands in T-0035.
  onPressSearch: () => void;
  onPressShortcut?: (key: string) => void;
}

// 3. COMPONENT FUNCTION
export const SearchPanel = React.memo((props: ISearchPanelProps) => {
  const { onPressSearch, onPressShortcut } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  const shortcuts: ISavedShortcut[] = useMemo(
    () => [
      { key: 'home', label: getString('homeSavedHome') },
      { key: 'work', label: getString('homeSavedWork') },
    ],
    []
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={onPressSearch}
        activeOpacity={0.85}
      >
        <View style={styles.searchDot} />
        <AppText style={styles.searchText}>{getString('homeWhereTo')}</AppText>
      </TouchableOpacity>

      <View style={styles.shortcutRow}>
        {shortcuts.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.shortcut}
            onPress={() => onPressShortcut?.(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.shortcutIcon} />
            <AppText style={styles.shortcutLabel} numberOfLines={1}>
              {item.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

SearchPanel.displayName = 'SearchPanel';

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    backgroundColor: theme.color.card.bg,
    borderTopLeftRadius: theme.dimensions.p20,
    borderTopRightRadius: theme.dimensions.p20,
    paddingHorizontal: theme.dimensions.p16,
    paddingTop: theme.dimensions.p20,
    paddingBottom: theme.dimensions.p16,
    gap: theme.dimensions.p16,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.dimensions.p12,
    backgroundColor: theme.color.background.surfaceAlt,
    borderRadius: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p16,
  },
  searchDot: {
    width: theme.dimensions.p12,
    height: theme.dimensions.p12,
    borderRadius: theme.dimensions.p2,
    backgroundColor: theme.color.map.pinEnd,
  },
  searchText: {
    fontSize: theme.fontSize.p16,
    color: theme.color.text.secondary,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: theme.dimensions.p12,
  },
  shortcut: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.dimensions.p8,
    backgroundColor: theme.color.background.surface,
    borderWidth: 1,
    borderColor: theme.color.border.light,
    borderRadius: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p12,
  },
  shortcutIcon: {
    width: theme.dimensions.p20,
    height: theme.dimensions.p20,
    borderRadius: theme.dimensions.p4,
    backgroundColor: theme.color.primary.brandGreen,
    opacity: 0.15,
  },
  shortcutLabel: {
    fontSize: theme.fontSize.p14,
    fontWeight: '600',
    color: theme.color.text.primary,
  },
});

// 5. EXPORT
export default SearchPanel;
