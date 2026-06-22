import { AppText } from 'components/text/AppText';
import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

interface IAppButton extends TouchableOpacityProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  text: string;
  disabled?: boolean;
  textStyle?: any;
}

export const AppButton = React.memo((props: IAppButton) => {
  const { leftIcon, rightIcon, text, onPress, disabled = false, style, textStyle, ...rest } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme, disabled), [theme, disabled]);

  return (
    <TouchableOpacity
      {...rest}
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.container}>
        {leftIcon || <View />}
        <View style={styles.textContainer}>
          <AppText style={[styles.text, textStyle]}>{text}</AppText>
        </View>
        {rightIcon || <View />}
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (theme: ITheme, disabled: boolean) => StyleSheet.create({
  button: {
    backgroundColor: disabled ? theme.color.neutral[300] : theme.color.primary[500],
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: disabled ? theme.color.neutral[500] : theme.color.white,
    textAlign: 'center',
  },
});

