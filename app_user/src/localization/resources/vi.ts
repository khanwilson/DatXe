import { iLocalization } from '../iLocalization';

const vi: iLocalization = {
  en: 'Tiếng Anh',
  vi: 'Tiếng Việt',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  signup: 'Đăng ký',
  // Auth — phone + OTP
  authPhoneTitle: 'Đăng nhập',
  authPhoneSubtitle: 'Nhập số điện thoại của bạn để tiếp tục',
  authPhoneLabel: 'Số điện thoại',
  authPhonePlaceholder: 'Nhập số điện thoại',
  authPhoneInvalid: 'Số điện thoại không hợp lệ',
  authContinue: 'Tiếp tục',
  authOtpTitle: 'Nhập mã xác thực',
  authOtpSubtitle: 'Chúng tôi đã gửi mã 6 số tới {{phone}}',
  authOtpVerify: 'Xác nhận',
  authOtpResend: 'Gửi lại mã',
  authOtpResendCountdown: 'Gửi lại sau {{seconds}}s',
  authOtpInvalid: 'Mã OTP không đúng',
  authOtpDevHint: '(DEV) dùng 000000',
  // Country picker
  countryPickerTitle: 'Chọn quốc gia',
  countryPickerSearch: 'Tìm theo tên hoặc mã',
  countryPickerEmpty: 'Không tìm thấy quốc gia',
  // Home — map & search
  homeWhereTo: 'Bạn muốn đi đâu?',
  homeSavedHome: 'Nhà',
  homeSavedWork: 'Cơ quan',
  homeLocationDenied: 'Vị trí đang tắt. Bật để tìm xe ở gần bạn.',
  homeEnableLocation: 'Bật vị trí',
  // Route summary
  routeFetchError: 'Không lấy được lộ trình',
  routeDistanceLabel: 'Khoảng cách',
  routeDurationLabel: 'Thời gian',
  // Search destination
  searchDestinationTitle: 'Tìm điểm đến',
  searchDestinationPlaceholder: 'Nhập địa chỉ',
  searchNoResults: 'Không tìm thấy kết quả',
  searchError: 'Lỗi khi tìm kiếm',
  searchRetry: 'Thử lại',
}
export default vi;
