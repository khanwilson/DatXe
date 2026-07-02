export interface iLocalization {
  en: string;
  vi: string;
  login: string;
  logout: string;
  signup: string;
  // Auth — phone + OTP
  authPhoneTitle: string;
  authPhoneSubtitle: string;
  authPhoneLabel: string;
  authPhonePlaceholder: string;
  authPhoneInvalid: string;
  authContinue: string;
  authOtpTitle: string;
  authOtpSubtitle: string;
  authOtpVerify: string;
  authOtpResend: string;
  authOtpResendCountdown: string;
  authOtpInvalid: string;
  authOtpDevHint: string;
  // Country picker
  countryPickerTitle: string;
  countryPickerSearch: string;
  countryPickerEmpty: string;
  // Home — map & search
  homeWhereTo: string;
  homeSavedHome: string;
  homeSavedWork: string;
  homeLocationDenied: string;
  homeEnableLocation: string;
  // Search destination
  searchDestinationTitle: string;
  searchDestinationPlaceholder: string;
  searchNoResults: string;
  searchError: string;
  searchRetry: string;
}
