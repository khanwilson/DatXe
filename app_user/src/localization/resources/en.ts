import { iLocalization } from '../iLocalization';

const en: iLocalization = {
  en: 'English',
  vi: 'Vietnamese',
  login: 'Login',
  logout: 'Logout',
  signup: 'Sign Up',
  // Auth — phone + OTP
  authPhoneTitle: 'Sign in',
  authPhoneSubtitle: 'Enter your phone number to continue',
  authPhoneLabel: 'Phone number',
  authPhonePlaceholder: 'Enter your phone number',
  authPhoneInvalid: 'Invalid phone number',
  authContinue: 'Continue',
  authOtpTitle: 'Enter verification code',
  authOtpSubtitle: 'We sent a 6-digit code to {{phone}}',
  authOtpVerify: 'Verify',
  authOtpResend: 'Resend code',
  authOtpResendCountdown: 'Resend in {{seconds}}s',
  authOtpInvalid: 'Incorrect OTP code',
  authOtpDevHint: '(DEV) use 000000',
  // Country picker
  countryPickerTitle: 'Select country',
  countryPickerSearch: 'Search by name or code',
  countryPickerEmpty: 'No country found',
}
export default en;
