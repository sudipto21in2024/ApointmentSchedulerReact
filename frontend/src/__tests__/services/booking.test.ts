import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getCustomerBookings,
  getServiceBookings,
} from '../../services/booking';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Booking Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBookings', () => {
    const mockFilters = {
      page: 1,
      pageSize: 10,
      status: 'Confirmed' as const,
      customerId: 'customer-1',
    };

    const mockResponse = {
      data: [
        {
          id: 'booking-1',
          customerId: 'customer-1',
          serviceId: 'service-1',
          slotId: 'slot-1',
          status: 'Confirmed' as const,
          bookingDate: '2023-01-01T10:00:00Z',
          createdAt: '2023-01-01T09:00:00Z',
          updatedAt: '2023-01-01T09:00:00Z',
        },
      ],
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
      links: {
        self: 'https://api.appointmentsystem.com/v1/bookings?page=1',
        first: 'https://api.appointmentsystem.com/v1/bookings?page=1',
        last: 'https://api.appointmentsystem.com/v1/bookings?page=1',
      },
    };

    it('should successfully fetch bookings with filters', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getBookings(mockFilters);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/bookings?page=1&pageSize=10&status=Confirmed&customerId=customer-1'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch bookings without filters', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getBookings();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/bookings'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      // Arrange
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Invalid filters' },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(getBookings(mockFilters)).rejects.toMatchObject({
        message: 'Network error while fetching bookings',
      });
    });

    it('should handle network errors', async () => {
      // Arrange
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(getBookings()).rejects.toEqual({
        message: 'Network error while fetching bookings',
      });
    });
  });

  describe('getBooking', () => {
    const mockBookingId = 'booking-1';
    const mockResponse = {
      data: {
        id: 'booking-1',
        customerId: 'customer-1',
        serviceId: 'service-1',
        slotId: 'slot-1',
        status: 'Confirmed' as const,
        bookingDate: '2023-01-01T10:00:00Z',
        createdAt: '2023-01-01T09:00:00Z',
        updatedAt: '2023-01-01T09:00:00Z',
      },
    };

    it('should successfully fetch a single booking', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getBooking(mockBookingId);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/bookings/booking-1'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle booking not found', async () => {
      // Arrange
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Booking not found' },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(getBooking(mockBookingId)).rejects.toMatchObject({
        message: 'Network error while fetching booking',
      });
    });
  });

  describe('createBooking', () => {
    const mockBookingData = {
      customerId: 'customer-1',
      serviceId: 'service-1',
      slotId: 'slot-1',
      notes: 'Test booking',
    };

    const mockResponse = {
      data: {
        id: 'booking-1',
        ...mockBookingData,
        status: 'Pending' as const,
        bookingDate: '2023-01-01T10:00:00Z',
        createdAt: '2023-01-01T09:00:00Z',
        updatedAt: '2023-01-01T09:00:00Z',
      },
    };

    it('should successfully create a booking', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await createBooking(mockBookingData);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/bookings',
        mockBookingData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle booking conflict', async () => {
      // Arrange
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 409,
          data: { message: 'Slot not available' },
        },
      };
      mockedAxios.post.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(createBooking(mockBookingData)).rejects.toMatchObject({
        message: 'Network error while creating booking',
      });
    });
  });

  describe('updateBooking', () => {
    const mockBookingId = 'booking-1';
    const mockUpdateData = {
      status: 'Confirmed' as const,
      notes: 'Updated notes',
    };

    const mockResponse = {
      data: {
        id: 'booking-1',
        customerId: 'customer-1',
        serviceId: 'service-1',
        slotId: 'slot-1',
        status: 'Confirmed' as const,
        bookingDate: '2023-01-01T10:00:00Z',
        createdAt: '2023-01-01T09:00:00Z',
        updatedAt: '2023-01-01T09:15:00Z',
        notes: 'Updated notes',
      },
    };

    it('should successfully update a booking', async () => {
      // Arrange
      mockedAxios.put.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await updateBooking(mockBookingId, mockUpdateData);

      // Assert
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/bookings/booking-1',
        mockUpdateData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle update failure', async () => {
      // Arrange
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: { message: 'Not authorized to update booking' },
        },
      };
      mockedAxios.put.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(updateBooking(mockBookingId, mockUpdateData)).rejects.toMatchObject({
        message: 'Network error while updating booking',
      });
    });
  });

  describe('cancelBooking', () => {
    const mockBookingId = 'booking-1';

    it('should successfully cancel a booking', async () => {
      // Arrange
      mockedAxios.delete.mockResolvedValue({});

      // Act
      await cancelBooking(mockBookingId);

      // Assert
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/bookings/booking-1'
      );
    });

    it('should handle cancellation failure', async () => {
      // Arrange
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Booking not found' },
        },
      };
      mockedAxios.delete.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(cancelBooking(mockBookingId)).rejects.toMatchObject({
        message: 'Network error while cancelling booking',
      });
    });
  });

  describe('getCustomerBookings', () => {
    const mockCustomerId = 'customer-1';
    const mockFilters = { status: 'Completed' as const };
    const mockResponse = {
      data: [
        {
          id: 'booking-1',
          customerId: 'customer-1',
          serviceId: 'service-1',
          slotId: 'slot-1',
          status: 'Completed' as const,
          bookingDate: '2023-01-01T10:00:00Z',
          createdAt: '2023-01-01T09:00:00Z',
          updatedAt: '2023-01-01T09:00:00Z',
        },
      ],
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('should fetch bookings for a customer', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getCustomerBookings(mockCustomerId, mockFilters);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/bookings?status=Completed&customerId=customer-1'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getServiceBookings', () => {
    const mockServiceId = 'service-1';
    const mockFilters = { startDate: '2023-01-01' };
    const mockResponse = {
      data: [
        {
          id: 'booking-1',
          customerId: 'customer-1',
          serviceId: 'service-1',
          slotId: 'slot-1',
          status: 'Confirmed' as const,
          bookingDate: '2023-01-01T10:00:00Z',
          createdAt: '2023-01-01T09:00:00Z',
          updatedAt: '2023-01-01T09:00:00Z',
        },
      ],
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('should fetch bookings for a service', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getServiceBookings(mockServiceId, mockFilters);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/bookings?serviceId=service-1&startDate=2023-01-01'
      );
      expect(result).toEqual(mockResponse);
    });
  });
});