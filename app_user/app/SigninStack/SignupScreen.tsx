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

export default function SignUpScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock registration - in production this would call an API
      Alert.alert(
        'Thành công', 
        'Đăng ký thành công! Vui lòng đăng nhập.', 
        [
          { text: 'OK', onPress: () => router.replace('/SigninStack/SigninScreen') }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng ký');
      console.error('Error signing up:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>Đăng ký</AppText>
          <AppText style={styles.subtitle}>Tạo tài khoản Template mới</AppText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Họ và tên</AppText>
            <AppTextInput
              placeholder="Nhập họ và tên"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

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
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Xác nhận mật khẩu</AppText>
            <AppTextInput
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <AppButton
            text={isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            onPress={handleSignUp}
            disabled={isLoading}
            style={styles.button}
            textStyle={styles.buttonText}
          />

          <View style={styles.footer}>
            <AppText style={styles.footerText}>Đã có tài khoản? </AppText>
            <TouchableOpacity onPress={handleGoToSignIn}>
              <AppText style={styles.linkText}>Đăng nhập ngay</AppText>
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
    paddingVertical: theme.dimensions.p40,
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