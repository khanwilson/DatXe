import { AppButton } from 'components/button/AppButton';
import { AppTextInput } from 'components/input/TextInput';
import { AppText } from 'components/text/AppText';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

export default function SignInScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication - in production this would call an API
      if (email === 'test@test.com' && password === 'password') {
        router.replace('/(tabs)/HomeScreen')
      } else {
        Alert.alert('Lỗi', 'Email hoặc mật khẩu không đúng');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng nhập');
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignUp = () => {
    router.push('/SigninStack/SignupScreen');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>Đăng nhập</AppText>
          <AppText style={styles.subtitle}>Chào mừng trở lại với Template</AppText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Email</AppText>
            <AppTextInput
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Mật khẩu</AppText>
            <AppTextInput
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <AppButton
            text={isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            onPress={handleSignIn}
            disabled={isLoading}
            style={styles.button}
            textStyle={styles.buttonText}
          />

          <View style={styles.footer}>
            <AppText style={styles.footerText}>Chưa có tài khoản? </AppText>
            <TouchableOpacity onPress={handleGoToSignUp}>
              <AppText style={styles.linkText}>Đăng ký ngay</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.neutral[900],
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
    color: theme.color.textColor.white,
    marginBottom: theme.dimensions.p8,
  },
  subtitle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.textColor.subText,
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
    color: theme.color.textColor.white,
    marginBottom: theme.dimensions.p8,
  },
  button: {
    backgroundColor: theme.color.white,
    marginTop: theme.dimensions.p20,
    marginBottom: theme.dimensions.p30,
  },
  buttonText: {
    color: theme.color.neutral[900],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: theme.color.textColor.subText,
    fontSize: theme.fontSize.p16,
  },
  linkText: {
    color: theme.color.textColor.white,
    fontSize: theme.fontSize.p16,
    fontWeight: 'bold',
  },
});