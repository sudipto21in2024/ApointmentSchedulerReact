import axios from 'axios';

// Base API URL - in production, this should come from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.appointmentsystem.com/v1';

// Type definitions based on OpenAPI spec
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  slotId: string;
  tenantId?: string;
  status: BookingStatus;
  bookingDate: string; // ISO date-time string
  createdAt: string; // ISO date-time string
  updatedAt: string; // ISO date-time string
  notes?: string;
  cancelledAt?: string; // ISO date-time string
  cancelledBy?: string;
  paymentId?: string;
}

export interface CreateBookingRequest {
  customerId: string;
  serviceId: string;
  slotId: string;
  tenantId?: string;
  notes?: string;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  notes?: string;
}

export interface BookingResponse {
  data: Booking;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BookingListResponse {
  data: Booking[];
  meta: PaginationMeta;
  links?: {
    self: string;
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

export interface BookingFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: BookingStatus;
  customerId?: string;
  serviceId?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface BookingError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Retrieves a paginated list of bookings with optional filtering
 * @param filters - Optional filters for the booking query
 * @returns Promise resolving to booking list response
 * @throws BookingError on failure
 */
export const getBookings = async (filters: BookingFilters = {}): Promise<BookingListResponse> => {
  try {
    const params = new URLSearchParams();

    // Add filter parameters
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.pageSize !== undefined) params.append('pageSize', filters.pageSize.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/bookings${queryString ? `?${queryString}` : ''}`;

    const response = await axios.get<BookingListResponse>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const bookingError: BookingError = {
        message: error.response.data?.message || 'Failed to fetch bookings',
        code: error.response.status.toString(),
        details: error.response.data,
      };
      throw bookingError;
    }
    throw { message: 'Network error while fetching bookings' } as BookingError;
  }
};

/**
 * Retrieves a specific booking by its ID
 * @param id - The unique identifier of the booking
 * @returns Promise resolving to booking response
 * @throws BookingError on failure
 */
export const getBooking = async (id: string): Promise<BookingResponse> => {
  try {
    const response = await axios.get<BookingResponse>(`${API_BASE_URL}/bookings/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const bookingError: BookingError = {
        message: error.response.data?.message || 'Failed to fetch booking',
        code: error.response.status.toString(),
        details: error.response.data,
      };
      throw bookingError;
    }
    throw { message: 'Network error while fetching booking' } as BookingError;
  }
};

/**
 * Creates a new booking for a service
 * @param bookingData - The booking creation data
 * @returns Promise resolving to booking response
 * @throws BookingError on failure (e.g., slot conflict)
 */
export const createBooking = async (bookingData: CreateBookingRequest): Promise<BookingResponse> => {
  try {
    const response = await axios.post<BookingResponse>(`${API_BASE_URL}/bookings`, bookingData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const bookingError: BookingError = {
        message: error.response.data?.message || 'Failed to create booking',
        code: error.response.status.toString(),
        details: error.response.data,
      };
      throw bookingError;
    }
    throw { message: 'Network error while creating booking' } as BookingError;
  }
};

/**
 * Updates an existing booking's information
 * @param id - The unique identifier of the booking to update
 * @param updateData - The fields to update
 * @returns Promise resolving to booking response
 * @throws BookingError on failure
 */
export const updateBooking = async (id: string, updateData: UpdateBookingRequest): Promise<BookingResponse> => {
  try {
    const response = await axios.put<BookingResponse>(`${API_BASE_URL}/bookings/${id}`, updateData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const bookingError: BookingError = {
        message: error.response.data?.message || 'Failed to update booking',
        code: error.response.status.toString(),
        details: error.response.data,
      };
      throw bookingError;
    }
    throw { message: 'Network error while updating booking' } as BookingError;
  }
};

/**
 * Cancels a booking (soft delete)
 * @param id - The unique identifier of the booking to cancel
 * @returns Promise resolving when cancellation is complete
 * @throws BookingError on failure
 */
export const cancelBooking = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/bookings/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const bookingError: BookingError = {
        message: error.response.data?.message || 'Failed to cancel booking',
        code: error.response.status.toString(),
        details: error.response.data,
      };
      throw bookingError;
    }
    throw { message: 'Network error while cancelling booking' } as BookingError;
  }
};

/**
 * Retrieves booking history for a specific customer
 * @param customerId - The customer ID to filter bookings
 * @param filters - Additional filters for the query
 * @returns Promise resolving to booking list response
 * @throws BookingError on failure
 */
export const getCustomerBookings = async (
  customerId: string,
  filters: Omit<BookingFilters, 'customerId'> = {}
): Promise<BookingListResponse> => {
  return getBookings({ ...filters, customerId });
};

/**
 * Retrieves bookings for a specific service
 * @param serviceId - The service ID to filter bookings
 * @param filters - Additional filters for the query
 * @returns Promise resolving to booking list response
 * @throws BookingError on failure
 */
export const getServiceBookings = async (
  serviceId: string,
  filters: Omit<BookingFilters, 'serviceId'> = {}
): Promise<BookingListResponse> => {
  return getBookings({ ...filters, serviceId });
};