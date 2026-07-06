// 1. IMPORTS
import { useRequestOtp } from 'api/hooks/useAuth';
import { AppButton } from 'components/button/AppButton';
import { PhoneInput, PhoneInputChange } from 'components/input/PhoneInput';
import { AppText } from 'components/text/AppText';
import { router } from 'expo-router';
import { getString } from 'localization/index';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// 2. COMPONENT FUNCTION
export default function SignInScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [national, setNational] = useState('');
  const [phone, setPhone] = useState<PhoneInputChange | null>(null);
  const [error, setError] = useState('');
  const requestOtp = useRequestOtp();

  const handleContinue = () => {
    if (!phone?.valid) {
      setError(getString('authPhoneInvalid'));
      return;
    }
    setError('');
    requestOtp.mutate(
      { phone: phone.e164 },
      {
        onSuccess: () => {
          router.push({
            pathname: '/SigninStack/OtpScreen',
            params: { phone: phone.e164 },
          });
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>{getString('authPhoneTitle')}</AppText>
          <AppText style={styles.subtitle}>{getString('authPhoneSubtitle')}</AppText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <AppText style={styles.label}>{getString('authPhoneLabel')}</AppText>
            <PhoneInput
              value={national}
              defaultCountry="VN"
              placeholder={getString('authPhonePlaceholder')}
              autoFocus
              validStatus={phone?.valid ?? null}
              onChange={(change) => {
                setNational(change.national);
                setPhone(change);
                if (error) {
                  setError('');
                }
              }}
            />
            {!!error && <AppText style={styles.errorText}>{error}</AppText>}
          </View>

          <AppButton
            text={getString('authContinue')}
            onPress={handleContinue}
            disabled={requestOtp.isPending}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 3. STYLESHEET
const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.dimensions.p20,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.dimensions.p40,
  },
  title: {
    fontSize: theme.fontSize.p32,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p8,
  },
  subtitle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: theme.dimensions.p20,
  },
  label: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p8,
  },
  errorText: {
    color: theme.color.state.error,
    fontSize: theme.fontSize.p14,
    marginTop: theme.dimensions.p8,
  },
  button: {
    marginTop: theme.dimensions.p20,
  },
});
