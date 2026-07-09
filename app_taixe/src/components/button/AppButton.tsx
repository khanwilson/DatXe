import { AppText } from 'components/text/AppText';
import React, { ReactNode, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

interface IAppButton extends TouchableOpacityProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  text: string;
  disabled?: boolean;
  loading?: boolean;
  textStyle?: any;
}

export const AppButton = React.memo((props: IAppButton) => {
  const { leftIcon, rightIcon, text, onPress, disabled = false, loading = false, style, textStyle, ...rest } = props;
  const theme = useAppTheme();
  const isDisabled = disabled || loading;
  const styles = useMemo(() => stylesSheet(theme, isDisabled), [theme, isDisabled]);

  return (
    <TouchableOpacity
      {...rest}
      style={[styles.button, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.container}>
        {!loading && (leftIcon || <View />)}
        {loading ?
          <View style={styles.viewLoading}>
            <ActivityIndicator color={theme.color.button.primaryText} />
          </View> :
          <View style={styles.textContainer}>
            <AppText style={[styles.text, textStyle]}>{text}</AppText>
          </View>
        }
        {!loading && (rightIcon || <View />)}
      </View>
    </TouchableOpacity>
  );
});

const stylesSheet = (theme: ITheme, disabled: boolean) => StyleSheet.create({
  button: {
    backgroundColor: disabled ? theme.color.button.disabledBg : theme.color.button.primaryBg,
    borderRadius: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p16,
    paddingHorizontal: theme.dimensions.p16,
    minHeight: 48,
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: disabled ? theme.color.button.disabledText : theme.color.button.primaryText,
    textAlign: 'center',
  },
  viewLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

