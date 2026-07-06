// 1. IMPORTS
import { AppText } from 'components/text/AppText';
import { iLocalization } from 'localization/iLocalization';
import { getString } from 'localization/index';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
interface ServiceItem {
  id: string;
  labelKey: keyof iLocalization;
  backgroundColor: string;
  emoji: string;
}

const MOCK_SERVICES: ServiceItem[] = [
  { id: 'ride', labelKey: 'homeServiceRide', backgroundColor: '#E8F5E9', emoji: '🚗' },
  { id: 'delivery', labelKey: 'homeServiceDelivery', backgroundColor: '#E3F2FD', emoji: '🚚' },
  { id: 'grocery', labelKey: 'homeServiceGrocery', backgroundColor: '#FFF3E0', emoji: '🛒' },
  { id: 'food', labelKey: 'homeServiceFood', backgroundColor: '#FCE4EC', emoji: '🍔' },
  { id: 'parcel', labelKey: 'homeServiceParcel', backgroundColor: '#F3E5F5', emoji: '📦' },
  { id: 'more', labelKey: 'homeServiceMore', backgroundColor: '#ECEFF1', emoji: '⋯' },
];

interface Props {}

// 3. COMPONENT FUNCTION
export const ServiceSlider: React.FC<Props> = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>
        {getString('homeServicesTitle')}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={92}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {MOCK_SERVICES.map((service) => (
          <View key={service.id} style={styles.serviceItem}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: service.backgroundColor },
              ]}
            >
              <AppText style={styles.iconEmoji}>{service.emoji}</AppText>
            </View>
            <AppText style={styles.label}>
              {getString(service.labelKey)}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  section: {
    marginBottom: theme.dimensions.p20,
  },
  sectionTitle: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.text.primary,
    paddingHorizontal: theme.dimensions.p16,
    marginBottom: theme.dimensions.p12,
  },
  scrollContent: {
    paddingHorizontal: theme.dimensions.p16,
    gap: theme.dimensions.p20,
  },
  serviceItem: {
    alignItems: 'center',
    width: 72,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.dimensions.p8,
  },
  iconEmoji: {
    fontSize: 28,
  },
  label: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.primary,
    textAlign: 'center',
  },
});

// 5. EXPORT
export default ServiceSlider;
