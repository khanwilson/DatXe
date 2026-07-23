// 1. IMPORTS
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from 'components/text/AppText';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
interface NavigationBannerProps {
  instruction: string;
  stepDistance: string;
  destinationName: string;
}

// ponytail: keyword matching for maneuver icon — upgrade to proper enum if Goong adds structured type
function getManeuverIcon(instruction: string): string {
  const lower = instruction.toLowerCase();
  if (lower.includes('left')) return '↰';
  if (lower.includes('right')) return '↱';
  if (lower.includes('straight') || lower.includes('continue')) return '↑';
  if (lower.includes('merge')) return '⇢';
  if (lower.includes('roundabout') || lower.includes('vòng xuyến')) return '↻';
  if (lower.includes('u-turn') || lower.includes('quay đầu')) return '↩';
  return '↑'; // default: straight ahead
}

// Strip basic HTML tags from Goong instruction text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// 3. COMPONENT FUNCTION
export const NavigationBanner: React.FC<NavigationBannerProps> = ({
  instruction,
  stepDistance,
  destinationName,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  const cleanInstruction = stripHtml(instruction);
  const icon = getManeuverIcon(cleanInstruction);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <AppText style={styles.iconText}>{icon}</AppText>
        </View>
        <View style={styles.info}>
          <AppText style={styles.distance}>{stepDistance || '--'}</AppText>
          <AppText style={styles.streetName} numberOfLines={1}>
            {cleanInstruction || destinationName}
          </AppText>
        </View>
      </View>
    </View>
  );
};

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.color.primary.darkGreen,
      paddingTop: 50,
      paddingBottom: 12,
      paddingHorizontal: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    iconText: {
      fontSize: 24,
      color: '#fff',
    },
    info: {
      flex: 1,
    },
    distance: {
      fontSize: 22,
      fontWeight: '700',
      color: '#fff',
    },
    streetName: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
  });

// 5. EXPORT
export default NavigationBanner;
