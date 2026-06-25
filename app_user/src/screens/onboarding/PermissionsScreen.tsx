import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from 'theme/index';
import { OnboardingStackParamList } from './OnboardingStack';
import { AppText } from 'components/text/AppText';
import { AppButton } from 'components/button/AppButton';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Permissions'>;

const PermissionsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useAppTheme();

  const handleRequestAllPermissions = () => {
    setTimeout(() => {
      navigation.replace('GetStarted' as never);
    }, 300);
  };

  const handleSkip = () => {
    navigation.replace('GetStarted' as never);
  };

  const styles = StyleSheet.create({
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
      fontSize: theme.fontSize.p28,
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
          text="Allow Permissions"
          onPress={handleRequestAllPermissions}
          style={styles.allowButton}
        />
        <AppButton
          text="Skip for Now"
          onPress={handleSkip}
          style={styles.skipButton}
          textStyle={styles.skipButtonText}
        />
      </View>
    </View>
  );
};

export default PermissionsScreen;
