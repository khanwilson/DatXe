import * as crypto from 'crypto';

/**
 * RFC3986-style component encoding. Spaces become %20 (not `+`). The exact same
 * encoding is applied to both the signed data and the final query string, so the
 * HMAC always covers the identical bytes that appear in the returned URL.
 *
 * ponytail: VNPay's official 2.1.0 sample uses `+` for spaces
 * (encodeURIComponent(v).replace(/%20/g,'+')). We deliberately keep %20 and require
 * callers to send a space-free vnp_OrderInfo, so the two conventions are equivalent.
 * If any signed value ever contains spaces, switch encodeVnp to the `+` convention
 * to stay VNPay-compatible.
 */
const encodeVnp = (value: string): string => encodeURIComponent(value);

/**
 * Build the canonical `key=value&...` query string from already-sorted params.
 * Keys are all `vnp_*` (ASCII, no encoding needed); values are RFC3986-encoded.
 * This single string is used for both signing and the returned URL.
 */
function buildSignData(sorted: Record<string, string>): string {
  return Object.keys(sorted)
    .map((key) => `${key}=${encodeVnp(sorted[key])}`)
    .join('&');
}

function sortParams(params: Record<string, string>): Record<string, string> {
  return Object.keys(params)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
}

export function buildVnpayUrl(
  baseUrl: string,
  tmnCode: string,
  hashSecret: string,
  returnUrl: string,
  params: {
    amount: number; // in VND
    txnRef: string; // unique transaction ref
    orderInfo: string;
    ipAddr: string;
    createDate: string; // YYYYMMDDHHmmss
  },
): string {
  const vnpParams: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.txnRef,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: String(params.amount * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: params.ipAddr,
    vnp_CreateDate: params.createDate,
  };

  const sorted = sortParams(vnpParams);

  // Sign the exact same encoded string that goes into the URL.
  const signData = buildSignData(sorted);
  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(signData, 'utf-8').digest('hex');

  return `${baseUrl}?${signData}&vnp_SecureHash=${signed}`;
}

export function verifyVnpayCallback(
  hashSecret: string,
  query: Record<string, string>,
): { valid: boolean; responseCode: string } {
  const secureHash = query['vnp_SecureHash'];
  const responseCode = query['vnp_ResponseCode'];

  const params = { ...query };
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];

  const sorted = sortParams(params);

  // Re-encode with the same scheme used when building the URL.
  const signData = buildSignData(sorted);
  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(signData, 'utf-8').digest('hex');

  return { valid: signed === secureHash, responseCode };
}

export function formatVnpayDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}
