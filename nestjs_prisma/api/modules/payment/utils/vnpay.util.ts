import * as crypto from 'crypto';
import * as querystring from 'querystring';

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

  const sorted = Object.keys(vnpParams)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {});

  const signData = querystring.stringify(sorted, undefined, undefined, {
    encodeURIComponent: (s) => s,
  });
  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  sorted['vnp_SecureHash'] = signed;
  return `${baseUrl}?${querystring.stringify(sorted)}`;
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

  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  const signData = querystring.stringify(sorted, undefined, undefined, {
    encodeURIComponent: (s) => s,
  });
  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

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
