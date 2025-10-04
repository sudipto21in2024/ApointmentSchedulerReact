import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { bookingKeys } from './useBooking';

/**
 * Hook to enable real-time booking status updates
 * Uses polling to keep booking data fresh for critical operations
 * @param enabled - Whether to enable real-time updates
 * @param interval - Polling interval in milliseconds (default: 30000ms = 30s)
 */
export const useRealtimeBookingUpdates = (
  enabled: boolean = false,
  interval: number = 30000
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      // Invalidate all booking queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: bookingKeys.all,
        refetchType: 'active', // Only refetch active queries
      });
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, queryClient]);

  return {
    isEnabled: enabled,
    interval,
  };
};

/**
 * Hook for monitoring specific booking status changes
 * Useful for booking confirmation pages or status tracking
 * @param bookingId - ID of the booking to monitor
 * @param enabled - Whether to enable monitoring
 * @param onStatusChange - Callback when status changes
 */
export const useBookingStatusMonitor = (
  bookingId: string | undefined,
  enabled: boolean = false,
  onStatusChange?: (newStatus: string, oldStatus?: string) => void
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !bookingId) return;

    let previousStatus: string | undefined;

    const checkStatus = async () => {
      try {
        await queryClient.invalidateQueries({
          queryKey: bookingKeys.detail(bookingId),
        });

        // Get current status from cache
        const bookingData = queryClient.getQueryData(bookingKeys.detail(bookingId));
        if (bookingData && typeof bookingData === 'object' && 'data' in bookingData) {
          const currentStatus = (bookingData as any).data.status;
          if (previousStatus && previousStatus !== currentStatus) {
            onStatusChange?.(currentStatus, previousStatus);
          }
          previousStatus = currentStatus;
        }
      } catch (error) {
        console.error('Error monitoring booking status:', error);
      }
    };

    // Initial check
    checkStatus();

    // Set up polling
    const intervalId = setInterval(checkStatus, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [enabled, bookingId, queryClient, onStatusChange]);

  return {
    isMonitoring: enabled && !!bookingId,
  };
};

/**
 * Hook for real-time slot availability monitoring
 * Critical for booking flows where slots can be taken quickly
 * @param serviceId - Service ID to monitor slots for
 * @param enabled - Whether to enable monitoring
 */
export const useRealtimeSlotUpdates = (
  serviceId: string | undefined,
  enabled: boolean = false
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !serviceId) return;

    const intervalId = setInterval(() => {
      // Invalidate slot queries for this service
      queryClient.invalidateQueries({
        queryKey: ['slots'],
        refetchType: 'active',
      });
    }, 15000); // Check every 15 seconds for slots

    return () => clearInterval(intervalId);
  }, [enabled, serviceId, queryClient]);

  return {
    isEnabled: enabled && !!serviceId,
  };
};

/**
 * Utility hook to enable real-time updates for booking operations
 * Combines booking and slot real-time updates
 * @param options - Configuration options
 */
export const useRealtimeBookingOperations = (options: {
  enableBookingUpdates?: boolean;
  enableSlotUpdates?: boolean;
  serviceId?: string;
  bookingId?: string;
  onBookingStatusChange?: (newStatus: string, oldStatus?: string) => void;
  bookingUpdateInterval?: number;
}) => {
  const {
    enableBookingUpdates = false,
    enableSlotUpdates = false,
    serviceId,
    bookingId,
    onBookingStatusChange,
    bookingUpdateInterval = 30000,
  } = options;

  // Real-time booking updates
  const bookingUpdates = useRealtimeBookingUpdates(
    enableBookingUpdates,
    bookingUpdateInterval
  );

  // Booking status monitoring
  const statusMonitor = useBookingStatusMonitor(
    bookingId,
    enableBookingUpdates,
    onBookingStatusChange
  );

  // Real-time slot updates
  const slotUpdates = useRealtimeSlotUpdates(
    serviceId,
    enableSlotUpdates
  );

  return {
    bookingUpdates,
    statusMonitor,
    slotUpdates,
    isAnyRealtimeEnabled: enableBookingUpdates || enableSlotUpdates,
  };
};