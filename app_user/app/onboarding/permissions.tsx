import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { ITheme, useAppTheme } from 'theme/index';
import { AppText } from 'components/text/AppText';
import { AppButton } from 'components/button/AppButton';

const PermissionsScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const router = useRouter();
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleRequestAllPermissions = async () => {
    // Guard against double-tap opening multiple OS dialogs.
    if (isRequesting) {
      return;
    }
    setIsRequesting(true);

    try {
      // Request foreground location: needed to find nearby taxis and pickup.
      await Location.requestForegroundPermissionsAsync();
      // Request notifications: booking status updates.
      await Notifications.requestPermissionsAsync();
    } catch (error) {
      // Onboarding is non-blocking: log and continue even if a request fails.
      console.warn('Error requesting permissions:', error);
    } finally {
      setIsRequesting(false);
      router.push('/onboarding/get-started');
    }
  };

  const handleSkip = () => {
    if (isRequesting) {
      return;
    }
    router.push('/onboarding/get-started');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText style={styles.icon}>📍</AppText>
        <AppText style={styles.title}>Enable Permissions</AppText>
        <AppText style={styles.description}>
          We need a few permissions to provide you the best experience
        </AppText>

        <View style={styles.permissionList}>
          <View style={styles.permissionItem}>
            <AppText style={styles.permissionIcon}>📍</AppText>
            <AppText style={styles.permissionText}>Location - Find nearby taxis</AppText>
          </View>
          <View style={styles.permissionItem}>
            <AppText style={styles.permissionIcon}>🔔</AppText>
            <AppText style={styles.permissionText}>Notifications - Booking updates</AppText>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          text={isRequesting ? 'Requesting...' : 'Allow Permissions'}
          onPress={handleRequestAllPermissions}
          disabled={isRequesting}
          style={styles.allowButton}
        />
        <AppButton
          text="Skip for Now"
          onPress={handleSkip}
          disabled={isRequesting}
          style={styles.skipButton}
          textStyle={styles.skipButtonText}
        />
      </View>
    </View>
  );
};

const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: theme.dimensions.p20,
    paddingTop: theme.dimensions.p40,
    paddingBottom: theme.dimensions.p40,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 80,
    marginBottom: theme.dimensions.p32,
  },
  title: {
    fontSize: theme.fontSize.p24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: theme.dimensions.p16,
  },
  description: {
    fontSize: theme.fontSize.p16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.dimensions.p32,
  },
  permissionList: {
    width: '100%',
    gap: theme.dimensions.p16,
    marginBottom: theme.dimensions.p32,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E63946',
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: theme.dimensions.p12,
  },
  permissionText: {
    fontSize: theme.fontSize.p14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: theme.dimensions.p12,
    width: '100%',
  },
  allowButton: {
    backgroundColor: '#E63946',
    borderRadius: 12,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  skipButtonText: {
    color: '#E63946',
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
  },
});

export default PermissionsScreen;
