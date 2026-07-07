export class PaymentResponseDto {
  id: string;
  booking_id: string;
  amount: string;
  method: string;
  status: string;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
