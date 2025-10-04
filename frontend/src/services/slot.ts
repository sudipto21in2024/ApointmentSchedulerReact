import axios from 'axios';

// Base API URL - in production, this should come from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.appointmentsystem.com/v1';

// Type definitions based on OpenAPI spec
export interface Slot {
  id: string;
  serviceId: string;
  startDateTime: string; // ISO date-time string
  endDateTime: string; // ISO date-time string
  maxBookings: number;
  availableBookings: number;
  isAvailable: boolean;
  createdAt: string; // ISO date-time string
  updatedAt: string; // ISO date-time string
  isRecurring?: boolean;
}

export interface SlotListResponse {
  data: Slot[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  links?: {
    self: string;
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

export interface SlotFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  serviceId: string; // Required for slot queries
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  isAvailable?: boolean;
}

export interface SlotAvailabilityCheck {
  serviceId: string;
  startDate?: string;
  endDate?: string;
  isAvailable?: boolean;
}

export interface SlotError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Retrieves available time slots for a service with optional filtering
 * @param filters - Filters for the slot query (serviceId is required)
 * @returns Promise resolving to slot list response
 * @throws SlotError on failure
 */
export const getSlots = async (filters: SlotFilters): Promise<SlotListResponse> => {
  try {
    const params = new URLSearchParams();

    // Add filter parameters
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.pageSize !== undefined) params.append('pageSize', filters.pageSize.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString());

    const queryString = params.toString();
    const url = `${API_BASE_URL}/slots${queryString ? `?${queryString}` : ''}`;

    const response = await axios.get<SlotListResponse>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const slotError: SlotError = {
        message: error.response.data?.message || 'Failed to fetch slots',
        code: error.response.status.toString(),
        details: error.response.data,
      };
      throw slotError;
    }
    throw { message: 'Network error while fetching slots' } as SlotError;
  }
};

/**
 * Retrieves available slots for a specific service within a date range
 * @param serviceId - The service ID to get slots for
 * @param startDate - Start date for the range (ISO date string)
 * @param endDate - End date for the range (ISO date string)
 * @param page - Page number for pagination
 * @param pageSize - Number of items per page
 * @returns Promise resolving to slot list response
 * @throws SlotError on failure
 */
export const getAvailableSlots = async (
  serviceId: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<SlotListResponse> => {
  return getSlots({
    serviceId,
    startDate,
    endDate,
    isAvailable: true,
    page,
    pageSize,
    sort: 'startDateTime',
    order: 'asc',
  });
};

/**
 * Checks if a specific time slot is available for booking
 * @param slotId - The slot ID to check
 * @returns Promise resolving to boolean indicating availability
 * @throws SlotError on failure
 */
export const checkSlotAvailability = async (slotId: string): Promise<boolean> => {
  try {
    // This would typically be a dedicated endpoint, but for now we'll fetch the slot
    // In a real implementation, you might have a dedicated availability check endpoint
    const response = await axios.get<Slot>(`${API_BASE_URL}/slots/${slotId}`);
    return response.data.isAvailable && response.data.availableBookings > 0;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const slotError: SlotError = {
        message: error.response.data?.message || 'Failed to check slot availability',
        code: error.response.status.toString(),
        details: error.response.data,
      };
      throw slotError;
    }
    throw { message: 'Network error while checking slot availability' } as SlotError;
  }
};

/**
 * Retrieves slots for a service that are currently available
 * @param serviceId - The service ID
 * @param limit - Maximum number of slots to return
 * @returns Promise resolving to array of available slots
 * @throws SlotError on failure
 */
export const getNextAvailableSlots = async (serviceId: string, limit: number = 5): Promise<Slot[]> => {
  try {
    const response = await getAvailableSlots(serviceId, undefined, undefined, 1, limit);
    return response.data;
  } catch (error) {
    throw error as SlotError;
  }
};

/**
 * Validates if a booking can be made for a specific slot
 * This performs client-side validation before making the booking request
 * @param slotId - The slot ID to validate
 * @param serviceId - The service ID for additional context
 * @returns Promise resolving to validation result
 * @throws SlotError on failure
 */
export const validateSlotForBooking = async (slotId: string, _serviceId: string): Promise<{
  isValid: boolean;
  reason?: string;
}> => {
  try {
    const isAvailable = await checkSlotAvailability(slotId);
    if (!isAvailable) {
      return { isValid: false, reason: 'Slot is not available' };
    }
    return { isValid: true };
  } catch (error) {
    const slotError = error as SlotError;
    return { isValid: false, reason: slotError.message };
  }
};