import { BottomTabHeaderProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { AppText } from 'components/text/AppText';
import { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient';
import { StyleSheet, View } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { useAppTheme } from 'theme/index';
import { BackButton } from './BackButton';

const CustomHeaderComponent = ({ props }: { props: NativeStackHeaderProps | BottomTabHeaderProps }) => {
  const theme = useAppTheme();
  const nameScreen = props?.options?.title || '';
  const headerLeft = props?.options?.headerLeft;
  const headerRight = props?.options?.headerRight;

  return <View style={[styles.container, { backgroundColor: theme.color.bg.white, height: theme.dimensions.getHeightHeader, paddingTop: initialWindowMetrics?.insets?.top || 0 }]}>
    {headerLeft ? headerLeft({ canGoBack: true }) : <BackButton />}
    <View style={styles.viewTitle}>
      <AppText style={[styles.textTitle, { color: theme.color.primary[500] }]}>{nameScreen}</AppText>
    </View>
    {headerRight ? headerRight({ canGoBack: true }) : <View style={{ width: headerLeft ? 0 : 24 }} />}
  </View>
}

export const useCustomHeader = (): ExtendedStackNavigationOptions => {
  const headerOption: ExtendedStackNavigationOptions = {
    header: (props: NativeStackHeaderProps) => <CustomHeaderComponent props={props} />,
    presentation: 'card',
  };

  return headerOption
}

export const useCustomBottomTabHeader = (): BottomTabNavigationOptions => {
  const headerOption: BottomTabNavigationOptions = {
    header: (props: BottomTabHeaderProps) => {
      const propsCustom = { ...props, options: { ...props.options, headerLeft: () => <View /> } }
      return <CustomHeaderComponent props={propsCustom} />
    },
  };

  return headerOption
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  viewTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textTitle: {
    fontSize: 20,
  },
});