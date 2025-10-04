import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getCustomerBookings,
  getServiceBookings,
} from '../services/booking';
import type {
  BookingFilters,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingResponse,
  BookingError,
} from '../services/booking';

// Query keys for React Query
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: BookingFilters) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  customer: (customerId: string) => [...bookingKeys.all, 'customer', customerId] as const,
  service: (serviceId: string) => [...bookingKeys.all, 'service', serviceId] as const,
};

/**
 * Hook to fetch a paginated list of bookings with optional filtering
 * @param filters - Optional filters for the booking query
 * @param options - Additional React Query options
 * @returns Query object with booking list data
 */
export const useBookings = (
  filters: BookingFilters = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => getBookings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single booking by ID
 * @param id - Booking ID
 * @param options - Additional React Query options
 * @returns Query object with booking data
 */
export const useBooking = (
  id: string | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: bookingKeys.detail(id!),
    queryFn: () => getBooking(id!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch bookings for a specific customer
 * @param customerId - Customer ID
 * @param filters - Additional filters
 * @param options - Additional React Query options
 * @returns Query object with customer booking list
 */
export const useCustomerBookings = (
  customerId: string | undefined,
  filters: Omit<BookingFilters, 'customerId'> = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: bookingKeys.customer(customerId!),
    queryFn: () => getCustomerBookings(customerId!, filters),
    enabled: !!customerId && (options?.enabled ?? true),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch bookings for a specific service
 * @param serviceId - Service ID
 * @param filters - Additional filters
 * @param options - Additional React Query options
 * @returns Query object with service booking list
 */
export const useServiceBookings = (
  serviceId: string | undefined,
  filters: Omit<BookingFilters, 'serviceId'> = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: bookingKeys.service(serviceId!),
    queryFn: () => getServiceBookings(serviceId!, filters),
    enabled: !!serviceId && (options?.enabled ?? true),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to create a new booking
 * @param options - Mutation options
 * @returns Mutation object for creating bookings
 */
export const useCreateBooking = (options?: {
  onSuccess?: (data: BookingResponse) => void;
  onError?: (error: BookingError) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: CreateBookingRequest) => createBooking(bookingData),
    onSuccess: (data) => {
      // Invalidate and refetch booking lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate customer bookings if we have customerId
      if (data.data.customerId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.customer(data.data.customerId),
        });
      }
      // Invalidate service bookings if we have serviceId
      if (data.data.serviceId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.service(data.data.serviceId),
        });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing booking
 * @param options - Mutation options
 * @returns Mutation object for updating bookings
 */
export const useUpdateBooking = (options?: {
  onSuccess?: (data: BookingResponse) => void;
  onError?: (error: BookingError) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingRequest }) =>
      updateBooking(id, data),
    onSuccess: (data) => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingKeys.detail(data.data.id), data);
      // Invalidate booking lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate customer bookings
      if (data.data.customerId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.customer(data.data.customerId),
        });
      }
      // Invalidate service bookings
      if (data.data.serviceId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.service(data.data.serviceId),
        });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to cancel a booking
 * @param options - Mutation options
 * @returns Mutation object for cancelling bookings
 */
export const useCancelBooking = (options?: {
  onSuccess?: () => void;
  onError?: (error: BookingError) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (_, bookingId) => {
      // Remove the booking from cache
      queryClient.removeQueries({ queryKey: bookingKeys.detail(bookingId) });
      // Invalidate booking lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

/**
 * Hook to get booking statistics (could be extended for dashboard)
 * @param customerId - Optional customer ID to filter stats
 * @returns Query object with booking statistics
 */
export const useBookingStats = (customerId?: string) => {
  return useQuery({
    queryKey: [...bookingKeys.all, 'stats', customerId],
    queryFn: async () => {
      const filters: BookingFilters = customerId ? { customerId } : {};
      const bookings = await getBookings(filters);

      const stats = {
        total: bookings.meta.total,
        pending: bookings.data.filter(b => b.status === 'Pending').length,
        confirmed: bookings.data.filter(b => b.status === 'Confirmed').length,
        completed: bookings.data.filter(b => b.status === 'Completed').length,
        cancelled: bookings.data.filter(b => b.status === 'Cancelled').length,
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};