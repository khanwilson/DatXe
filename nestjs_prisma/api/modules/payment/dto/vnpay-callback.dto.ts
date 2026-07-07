export class VnpayCallbackDto {
  vnp_TxnRef: string;
  vnp_ResponseCode: string;
  vnp_TransactionNo: string;
  vnp_SecureHash: string;
  vnp_SecureHashType?: string;
  [key: string]: string | undefined;
}
