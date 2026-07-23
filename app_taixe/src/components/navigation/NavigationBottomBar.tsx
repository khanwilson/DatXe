// 1. IMPORTS
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from 'components/text/AppText';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
interface NavigationBottomBarProps {
  eta: string;
  distance: string;
  onRecenter: () => void;
  onOverview: () => void;
}

// 3. COMPONENT FUNCTION
export const NavigationBottomBar: React.FC<NavigationBottomBarProps> = ({
  eta,
  distance,
  onRecenter,
  onOverview,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <View style={styles.infoBlock}>
          <AppText style={styles.label}>ETA</AppText>
          <AppText style={styles.value}>{eta || '--'}</AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoBlock}>
          <AppText style={styles.label}>Distance</AppText>
          <AppText style={styles.value}>{distance || '--'}</AppText>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onRecenter}>
          <AppText style={styles.actionText}>Re-center</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.overviewButton]}
          onPress={onOverview}
        >
          <AppText style={styles.actionText}>Overview</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.color.background.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
      shadowColor: theme.color.card.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    infoBlock: {
      flex: 1,
      alignItems: 'center',
    },
    divider: {
      width: 1,
      height: 30,
      backgroundColor: theme.color.border.light,
    },
    label: {
      fontSize: 11,
      color: theme.color.text.secondary,
      marginBottom: 2,
    },
    value: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.color.text.primary,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: theme.color.primary.actionGreen,
      alignItems: 'center',
    },
    overviewButton: {
      backgroundColor: theme.color.background.surfaceAlt,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.color.white,
    },
  });

// 5. EXPORT
export default NavigationBottomBar;
