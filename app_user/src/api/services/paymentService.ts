import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

export interface CreateVnpayUrlResponse {
  paymentUrl: string;
  txnRef: string;
}

export interface PaymentStatusResponse {
  id: string;
  booking_id: string;
  amount: string;
  method: string;
  status: string;
  transaction_id: string | null;
  paid_at: string | null;
}

const mockCreateVnpayUrl = async (bookingId: string): Promise<{ success: boolean; data: CreateVnpayUrlResponse }> => {
  await new Promise((r) => setTimeout(r, 400));
  return {
    success: true,
    data: {
      paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=4500000&vnp_TmnCode=DEMO',
      txnRef: `dev-txn-${bookingId}-${Date.now()}`,
    },
  };
};

export const paymentService = {
  createVnpayUrl: (bookingId: string): Promise<{ success: boolean; data: CreateVnpayUrlResponse }> => {
    if (__DEV__) return mockCreateVnpayUrl(bookingId);
    return apiClient.post(ENDPOINTS.PAYMENT.VNPAY_CREATE_URL, { bookingId });
  },

  getPaymentStatus: (bookingId: string): Promise<{ success: boolean; data: PaymentStatusResponse }> => {
    return apiClient.get(`${ENDPOINTS.PAYMENT.GET_STATUS}/${bookingId}`);
  },
};
