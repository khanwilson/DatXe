// 1. IMPORTS
import { AppButton } from 'components/button/AppButton';
import { AppTextInput } from 'components/input/TextInput';
import { AppText } from 'components/text/AppText';
import { router, useLocalSearchParams } from 'expo-router';
import { useRequestOtp, useVerifyOtp } from 'api/hooks/useAuth';
import { getString } from 'localization/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const normalizeCode = (raw: string) => raw.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);

// 3. COMPONENT FUNCTION
export default function OtpScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRef = useRef<any>(null);
  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();

  // Resend countdown ticker.
  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = useCallback(() => {
    if (code.length < OTP_LENGTH || !phone) {
      return;
    }
    setError('');
    verifyOtp.mutate(
      { phone, code },
      {
        onSuccess: () => {
          router.replace('/(tabs)/HomeScreen');
        },
        onError: () => {
          setError(getString('authOtpInvalid'));
        },
      }
    );
  }, [code, phone, verifyOtp]);

  const handleResend = () => {
    if (countdown > 0 || !phone) {
      return;
    }
    setCode('');
    setError('');
    requestOtp.mutate({ phone });
    setCountdown(RESEND_SECONDS);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <AppText style={styles.title}>{getString('authOtpTitle')}</AppText>
        <AppText style={styles.subtitle}>
          {getString('authOtpSubtitle', { phone: `+84 ${phone ?? ''}` })}
        </AppText>
        {__DEV__ && <AppText style={styles.devHint}>{getString('authOtpDevHint')}</AppText>}
      </View>

      <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
        <View style={styles.otpRow}>
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const filled = index < code.length;
            const active = index === code.length;
            return (
              <View
                key={index}
                style={[
                  styles.otpCell,
                  (filled || active) && styles.otpCellActive,
                ]}
              >
                <AppText style={styles.otpDigit}>{code[index] ?? ''}</AppText>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>

      {/* Hidden input drives the OTP cells above. */}
      <AppTextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={code}
        onChangeText={(text) => {
          setCode(normalizeCode(text));
          if (error) {
            setError('');
          }
        }}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        autoFocus
      />

      {!!error && <AppText style={styles.errorText}>{error}</AppText>}

      <AppButton
        text={getString('authOtpVerify')}
        onPress={handleVerify}
        disabled={code.length < OTP_LENGTH || verifyOtp.isPending}
        style={styles.button}
      />

      <TouchableOpacity
        onPress={handleResend}
        disabled={countdown > 0}
        style={styles.resendWrap}
      >
        <AppText style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
          {countdown > 0
            ? getString('authOtpResendCountdown', { seconds: countdown })
            : getString('authOtpResend')}
        </AppText>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// 4. STYLESHEET
const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
    paddingHorizontal: theme.dimensions.p20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.dimensions.p40,
  },
  title: {
    fontSize: theme.fontSize.p24,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p8,
  },
  subtitle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.text.secondary,
    textAlign: 'center',
  },
  devHint: {
    fontSize: theme.fontSize.p12,
    color: theme.color.primary.actionGreen,
    marginTop: theme.dimensions.p8,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.dimensions.p8,
  },
  otpCell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: theme.dimensions.p12,
    borderWidth: 1,
    borderColor: theme.color.input.border,
    backgroundColor: theme.color.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCellActive: {
    borderColor: theme.color.input.borderFocus,
  },
  otpDigit: {
    fontSize: theme.fontSize.p24,
    fontWeight: '700',
    color: theme.color.text.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  errorText: {
    color: theme.color.state.error,
    fontSize: theme.fontSize.p14,
    marginTop: theme.dimensions.p16,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.dimensions.p32,
  },
  resendWrap: {
    marginTop: theme.dimensions.p20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: theme.fontSize.p16,
    color: theme.color.primary.actionGreen,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: theme.color.text.secondary,
  },
});
