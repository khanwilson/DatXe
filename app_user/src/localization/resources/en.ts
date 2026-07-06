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
  // Home — map & search
  homeWhereTo: 'Where to?',
  homeSavedHome: 'Home',
  homeSavedWork: 'Work',
  homeLocationDenied: 'Location is off. Turn it on to find rides near you.',
  homeEnableLocation: 'Enable location',
  // Route summary
  routeFetchError: 'Could not fetch route',
  routeDistanceLabel: 'Distance',
  routeDurationLabel: 'Duration',
  // Search destination
  searchDestinationTitle: 'Find destination',
  searchDestinationPlaceholder: 'Enter address',
  searchNoResults: 'No results found',
  searchError: 'Search error',
  searchRetry: 'Retry',
  // Route booking modal
  bookingDiscountCode: 'Discount code',
  bookingPaymentCash: 'Cash',
  bookingBookButton: 'BOOK RIDE',
  // Home screen
  homeServicesTitle: 'Services',
  homeServiceRide: 'Book Ride',
  homeServiceDelivery: 'Delivery',
  homeServiceGrocery: 'Grocery',
  homeServiceFood: 'Food',
  homeServiceParcel: 'Parcel',
  homeServiceMore: 'More',
  homeBannersTitle: 'Order Now',
  homeNearbyTitle: 'Nearby',
  // Search destination — pickup mode
  searchPickupLocation: 'Your pickup location',
  searchChangePickup: 'Change',
}
export default en;
