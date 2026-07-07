import { useMutation } from '@tanstack/react-query';
import { bookingService, CreateBookingDto } from 'api/services/bookingService';
import { paymentService } from 'api/services/paymentService';

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingService.createBooking(data),
    onError: (error) => {
      console.error('[useCreateBooking] failed:', error);
    },
  });
};

export const useCreateVnpayUrl = () => {
  return useMutation({
    mutationFn: (bookingId: string) => paymentService.createVnpayUrl(bookingId),
    onError: (error) => {
      console.error('[useCreateVnpayUrl] failed:', error);
    },
  });
};
