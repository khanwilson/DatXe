import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

// Request body expected by backend POST /payments/vnpay.
export interface CreateVnpayUrlParams {
  bookingId: string;
  amount: number; // VND, integer
  orderInfo: string; // ASCII/space-free description; backend re-encodes for VNPay
  clientIp: string; // dev-safe fallback allowed (mobile cannot know its public IP)
}

// Backend response data shape: { payment_id, transaction_id, payment_url }.
export interface CreateVnpayUrlResponse {
  payment_id: string;
  transaction_id: string;
  payment_url: string;
}

export interface PaymentStatusResponse {
  id: string;
  booking_id: string;
  amount: string;
  method: string;
  status: string; // PENDING | SUCCESSFUL | FAILED | REFUNDED
  transaction_id: string | null;
  paid_at: string | null;
}

export const paymentService = {
  // Always hits the backend — no mock/hardcoded URL. Backend signs the real
  // VNPay sandbox URL from these params.
  createVnpayUrl: (
    params: CreateVnpayUrlParams,
  ): Promise<{ success: boolean; data: CreateVnpayUrlResponse }> => {
    return apiClient.post(ENDPOINTS.PAYMENT.VNPAY_CREATE_URL, {
      booking_id: params.bookingId,
      amount: params.amount,
      order_info: params.orderInfo,
      client_ip: params.clientIp,
    });
  },

  getPaymentStatus: (bookingId: string): Promise<{ success: boolean; data: PaymentStatusResponse }> => {
    return apiClient.get(`${ENDPOINTS.PAYMENT.GET_STATUS}/${bookingId}`);
  },
};
