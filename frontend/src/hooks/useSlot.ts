import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSlots,
  getAvailableSlots,
  checkSlotAvailability,
  getNextAvailableSlots,
  validateSlotForBooking,
} from '../services/slot';
import type {
  SlotFilters,
} from '../services/slot';

// Query keys for React Query
export const slotKeys = {
  all: ['slots'] as const,
  lists: () => [...slotKeys.all, 'list'] as const,
  list: (filters: SlotFilters) => [...slotKeys.lists(), filters] as const,
  available: (serviceId: string) => [...slotKeys.all, 'available', serviceId] as const,
  nextAvailable: (serviceId: string) => [...slotKeys.all, 'next-available', serviceId] as const,
  availability: (slotId: string) => [...slotKeys.all, 'availability', slotId] as const,
  validation: (slotId: string, serviceId: string) => [...slotKeys.all, 'validation', slotId, serviceId] as const,
};

/**
 * Hook to fetch slots for a service with optional filtering
 * @param filters - Filters for the slot query
 * @param options - Additional React Query options
 * @returns Query object with slot list data
 */
export const useSlots = (
  filters: SlotFilters,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: slotKeys.list(filters),
    queryFn: () => getSlots(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (slots can change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch available slots for a service
 * @param serviceId - Service ID
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @param page - Page number
 * @param pageSize - Items per page
 * @param options - Additional React Query options
 * @returns Query object with available slots
 */
export const useAvailableSlots = (
  serviceId: string | undefined,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  pageSize: number = 10,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: slotKeys.available(serviceId!),
    queryFn: () => getAvailableSlots(serviceId!, startDate, endDate, page, pageSize),
    enabled: !!serviceId && (options?.enabled ?? true),
    staleTime: 1 * 60 * 1000, // 1 minute (availability changes quickly)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch the next few available slots for a service
 * @param serviceId - Service ID
 * @param limit - Maximum number of slots to return
 * @param options - Additional React Query options
 * @returns Query object with next available slots
 */
export const useNextAvailableSlots = (
  serviceId: string | undefined,
  limit: number = 5,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: slotKeys.nextAvailable(serviceId!),
    queryFn: () => getNextAvailableSlots(serviceId!, limit),
    enabled: !!serviceId && (options?.enabled ?? true),
    staleTime: 30 * 1000, // 30 seconds (very fresh data needed)
    gcTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to check availability of a specific slot
 * @param slotId - Slot ID to check
 * @param options - Additional React Query options
 * @returns Query object with boolean availability status
 */
export const useSlotAvailability = (
  slotId: string | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: slotKeys.availability(slotId!),
    queryFn: () => checkSlotAvailability(slotId!),
    enabled: !!slotId && (options?.enabled ?? true),
    staleTime: 10 * 1000, // 10 seconds (critical real-time data)
    gcTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook to validate if a slot can be booked
 * @param slotId - Slot ID to validate
 * @param serviceId - Service ID for context
 * @param options - Additional React Query options
 * @returns Query object with validation result
 */
export const useSlotValidation = (
  slotId: string | undefined,
  serviceId: string | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: slotKeys.validation(slotId!, serviceId!),
    queryFn: () => validateSlotForBooking(slotId!, serviceId!),
    enabled: !!slotId && !!serviceId && (options?.enabled ?? true),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook to get slot statistics for a service
 * @param serviceId - Service ID
 * @param options - Additional React Query options
 * @returns Query object with slot statistics
 */
export const useSlotStats = (
  serviceId: string | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) => {
  return useQuery({
    queryKey: [...slotKeys.all, 'stats', serviceId],
    queryFn: async () => {
      const slots = await getSlots({ serviceId: serviceId! });

      const stats = {
        total: slots.meta.total,
        available: slots.data.filter(s => s.isAvailable).length,
        booked: slots.data.filter(s => !s.isAvailable).length,
        utilizationRate: slots.data.length > 0
          ? (slots.data.filter(s => !s.isAvailable).length / slots.data.length) * 100
          : 0,
      };

      return stats;
    },
    enabled: !!serviceId && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to invalidate slot queries (useful after booking creation)
 * @returns Function to invalidate slot-related queries
 */
export const useInvalidateSlots = () => {
  const queryClient = useQueryClient();

  const invalidateSlots = (serviceId?: string) => {
    if (serviceId) {
      // Invalidate specific service slots
      queryClient.invalidateQueries({ queryKey: slotKeys.available(serviceId) });
      queryClient.invalidateQueries({ queryKey: slotKeys.nextAvailable(serviceId) });
      queryClient.invalidateQueries({ queryKey: [...slotKeys.all, 'stats', serviceId] });
    } else {
      // Invalidate all slot queries
      queryClient.invalidateQueries({ queryKey: slotKeys.all });
    }
  };

  return invalidateSlots;
};