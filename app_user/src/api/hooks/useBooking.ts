import { useMutation } from '@tanstack/react-query';
import { bookingService, CreateBookingDto } from 'api/services/bookingService';
import { paymentService, CreateVnpayUrlParams } from 'api/services/paymentService';

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
    mutationFn: (params: CreateVnpayUrlParams) => paymentService.createVnpayUrl(params),
    onError: (error) => {
      console.error('[useCreateVnpayUrl] failed:', error);
    },
  });
};
