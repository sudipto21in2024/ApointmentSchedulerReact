import { HttpClient } from './base-api.service';
import type {
  Booking,
  BookingCreateData,
  BookingListResponse,
  BookingFilters,
  BookingStatus
} from '../types/booking';

/**
 * Booking API Service - Handles all booking-related API operations
 * Provides booking management, scheduling, and booking lifecycle operations
 */
export class BookingApiService {
  private client: HttpClient;

  constructor(client?: HttpClient) {
    this.client = client || new HttpClient();
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingCreateData): Promise<Booking> {
    return this.client.post<Booking>('/bookings', bookingData);
  }

  /**
   * Get booking by ID
   */
  async getBooking(id: string): Promise<Booking> {
    return this.client.get<Booking>(`/bookings/${id}`);
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(
    userId: string,
    filters?: BookingFilters
  ): Promise<BookingListResponse> {
    return this.client.get<BookingListResponse>(`/users/${userId}/bookings`, filters);
  }

  /**
   * Get service provider's bookings
   */
  async getProviderBookings(
    providerId: string,
    filters?: BookingFilters
  ): Promise<BookingListResponse> {
    return this.client.get<BookingListResponse>(`/providers/${providerId}/bookings`, filters);
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    reason?: string
  ): Promise<Booking> {
    return this.client.put<Booking>(`/bookings/${id}/status`, { status, reason });
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id: string, reason: string): Promise<Booking> {
    return this.client.put<Booking>(`/bookings/${id}/cancel`, { reason });
  }

  /**
   * Reschedule booking
   */
  async rescheduleBooking(
    id: string,
    newDateTime: string,
    reason?: string
  ): Promise<Booking> {
    return this.client.put<Booking>(`/bookings/${id}/reschedule`, {
      newDateTime,
      reason,
    });
  }

  /**
   * Confirm booking
   */
  async confirmBooking(id: string): Promise<Booking> {
    return this.client.put<Booking>(`/bookings/${id}/confirm`);
  }

  /**
   * Get available time slots for a service
   */
  async getAvailableSlots(
    serviceId: string,
    date: string,
    duration?: number
  ): Promise<Array<{ startTime: string; endTime: string; available: boolean }>> {
    return this.client.get(`/services/${serviceId}/slots`, { date, duration });
  }

  /**
   * Check service availability
   */
  async checkAvailability(
    serviceId: string,
    dateTime: string,
    duration: number
  ): Promise<{ available: boolean; conflictingBookings?: Booking[] }> {
    return this.client.get(`/services/${serviceId}/availability/check`, {
      dateTime,
      duration,
    });
  }

  /**
   * Get booking history for analytics
   */
  async getBookingHistory(
    filters?: {
      startDate?: string;
      endDate?: string;
      serviceId?: string;
      userId?: string;
      status?: BookingStatus;
    }
  ): Promise<Array<{
    date: string;
    bookings: number;
    revenue: number;
    serviceBreakdown: Record<string, number>;
  }>> {
    return this.client.get('/analytics/bookings', filters);
  }

  /**
   * Send booking reminder
   */
  async sendBookingReminder(bookingId: string): Promise<void> {
    return this.client.post(`/bookings/${bookingId}/remind`);
  }

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(
    userId?: string,
    limit: number = 10
  ): Promise<Booking[]> {
    return this.client.get('/bookings/upcoming', { userId, limit });
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(
    userId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<{
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageRating: number;
  }> {
    return this.client.get('/bookings/stats', { userId, ...dateRange });
  }

  /**
   * Bulk operations for bookings
   */
  async bulkUpdateBookingStatus(
    bookingIds: string[],
    status: BookingStatus,
    reason?: string
  ): Promise<Booking[]> {
    return this.client.put<Booking[]>('/bookings/bulk/status', {
      bookingIds,
      status,
      reason,
    });
  }

  /**
   * Export bookings data
   */
  async exportBookings(
    format: 'csv' | 'excel' | 'pdf',
    filters?: BookingFilters
  ): Promise<Blob> {
    const params = { format, ...filters };
    // For blob responses, we would need to extend HttpClient to support different response types
    // For now, return a placeholder
    return this.client.get<Blob>(`/bookings/export`, params) as unknown as Promise<Blob>;
  }

  /**
   * Get booking conflicts
   */
  async getBookingConflicts(
    serviceId: string,
    startTime: string,
    endTime: string
  ): Promise<Booking[]> {
    return this.client.get(`/services/${serviceId}/conflicts`, {
      startTime,
      endTime,
    });
  }

  /**
   * Add booking note
   */
  async addBookingNote(bookingId: string, note: string): Promise<Booking> {
    return this.client.post<Booking>(`/bookings/${bookingId}/notes`, { note });
  }

  /**
   * Update booking notes
   */
  async updateBookingNotes(bookingId: string, notes: string): Promise<Booking> {
    return this.client.put<Booking>(`/bookings/${bookingId}/notes`, { notes });
  }
}

/**
 * Booking API service instance
 */
export const bookingApi = new BookingApiService();