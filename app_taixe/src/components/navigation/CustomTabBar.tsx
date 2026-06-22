import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppText } from 'components/text/AppText';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const insetsBottom = useMemo(() => insets.bottom, [insets.bottom]);

  const tabs = useMemo(() => {
    return [
      {
        name: 'Home',
        icon: 'home',
      },
      {
        name: 'Explore',
        icon: 'explore',
      },
    ]
  }, [])

  const renderTab = useCallback((index: number, isFocused: boolean) => {
    return <View
      style={[
        styles.tabContent,
        isFocused && {
          borderBottomWidth: 2,
          borderBottomColor: theme.color.primary[500],
        },
      ]}
    >
      {/* icon tab */}
      <AppText
        style={[
          styles.tabLabel,
          {
            color: isFocused ? theme.color.primary[500] : theme.color.neutral[400],
          },
        ]}
      >
        {tabs[index].name}
      </AppText>
    </View>
  }, [tabs, theme, styles]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.color.bg.white,
          borderTopColor: theme.color.stroke,
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
            {renderTab(index, isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.color.bg.white,
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

