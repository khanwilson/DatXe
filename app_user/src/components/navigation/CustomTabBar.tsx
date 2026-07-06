import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppText } from 'components/text/AppText';
import { iLocalization } from 'localization/iLocalization';
import { getString } from 'localization/index';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';

// Maps each tab route name to its localized label key. Looked up by route name
// (not array index) so tab order can change without breaking the labels.
const TAB_LABEL_KEYS: Record<string, keyof iLocalization> = {
  HomeScreen: 'tabHome',
  ExploreScreen: 'tabExplore',
  ProfileScreen: 'tabProfile',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const insetsBottom = useMemo(() => insets.bottom, [insets.bottom]);

  const renderTab = useCallback((routeName: string, isFocused: boolean) => {
    const labelKey = TAB_LABEL_KEYS[routeName];
    const label = labelKey ? getString(labelKey) : routeName;
    return <View
      style={[
        styles.tabContent,
        isFocused && {
          borderBottomWidth: 2,
          borderBottomColor: theme.color.navigation.tabActiveText,
        },
      ]}
    >
      {/* icon tab */}
      <AppText
        style={[
          styles.tabLabel,
          {
            color: isFocused ? theme.color.navigation.tabActiveText : theme.color.navigation.tabInactiveText,
          },
        ]}
      >
        {label}
      </AppText>
    </View>
  }, [theme, styles]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.color.navigation.tabBg,
          borderTopColor: theme.color.navigation.tabBorder,
          height: theme.dimensions.getHeightFooter,
          paddingBottom: insetsBottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };


        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            {renderTab(route.name, isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.color.navigation.tabBg,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.dimensions.p8,
    gap: theme.dimensions.p4,
  },
  tabLabel: {
    fontSize: theme.fontSize.p12,
    fontWeight: '500',
    marginTop: 2,
  },
});

