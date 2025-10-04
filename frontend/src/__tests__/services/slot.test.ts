import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  getSlots,
  getAvailableSlots,
  checkSlotAvailability,
  getNextAvailableSlots,
  validateSlotForBooking,
} from '../../services/slot';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Slot Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSlots', () => {
    const mockFilters = {
      serviceId: 'service-1',
      page: 1,
      pageSize: 10,
      isAvailable: true,
      startDate: '2023-01-01',
    };

    const mockResponse = {
      data: [
        {
          id: 'slot-1',
          serviceId: 'service-1',
          startDateTime: '2023-01-01T10:00:00Z',
          endDateTime: '2023-01-01T11:00:00Z',
          maxBookings: 5,
          availableBookings: 3,
          isAvailable: true,
          createdAt: '2023-01-01T08:00:00Z',
          updatedAt: '2023-01-01T08:00:00Z',
        },
      ],
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
      links: {
        self: 'https://api.appointmentsystem.com/v1/slots?page=1',
        first: 'https://api.appointmentsystem.com/v1/slots?page=1',
        last: 'https://api.appointmentsystem.com/v1/slots?page=1',
      },
    };

    it('should successfully fetch slots with filters', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getSlots(mockFilters);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/slots?page=1&pageSize=10&serviceId=service-1&startDate=2023-01-01&isAvailable=true'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      // Arrange
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Invalid service ID' },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(getSlots(mockFilters)).rejects.toMatchObject({
        message: 'Network error while fetching slots',
      });
    });
  });

  describe('getAvailableSlots', () => {
    const mockServiceId = 'service-1';
    const mockStartDate = '2023-01-01';
    const mockEndDate = '2023-01-07';

    const mockResponse = {
      data: [
        {
          id: 'slot-1',
          serviceId: 'service-1',
          startDateTime: '2023-01-01T10:00:00Z',
          endDateTime: '2023-01-01T11:00:00Z',
          maxBookings: 5,
          availableBookings: 3,
          isAvailable: true,
          createdAt: '2023-01-01T08:00:00Z',
          updatedAt: '2023-01-01T08:00:00Z',
        },
      ],
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('should fetch available slots for a service', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getAvailableSlots(mockServiceId, mockStartDate, mockEndDate);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/slots?page=1&pageSize=10&sort=startDateTime&order=asc&serviceId=service-1&startDate=2023-01-01&endDate=2023-01-07&isAvailable=true'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch available slots without date filters', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getAvailableSlots(mockServiceId);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/slots?page=1&pageSize=10&sort=startDateTime&order=asc&serviceId=service-1&isAvailable=true'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkSlotAvailability', () => {
    const mockSlotId = 'slot-1';

    it('should return true for available slot', async () => {
      // Arrange
      const mockSlotResponse = {
        data: {
          id: 'slot-1',
          serviceId: 'service-1',
          startDateTime: '2023-01-01T10:00:00Z',
          endDateTime: '2023-01-01T11:00:00Z',
          maxBookings: 5,
          availableBookings: 3,
          isAvailable: true,
          createdAt: '2023-01-01T08:00:00Z',
          updatedAt: '2023-01-01T08:00:00Z',
        },
      };
      mockedAxios.get.mockResolvedValue(mockSlotResponse);

      // Act
      const result = await checkSlotAvailability(mockSlotId);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/slots/slot-1'
      );
      expect(result).toBe(true);
    });

    it('should return false for unavailable slot', async () => {
      // Arrange
      const mockSlotResponse = {
        data: {
          id: 'slot-1',
          serviceId: 'service-1',
          startDateTime: '2023-01-01T10:00:00Z',
          endDateTime: '2023-01-01T11:00:00Z',
          maxBookings: 5,
          availableBookings: 0,
          isAvailable: false,
          createdAt: '2023-01-01T08:00:00Z',
          updatedAt: '2023-01-01T08:00:00Z',
        },
      };
      mockedAxios.get.mockResolvedValue(mockSlotResponse);

      // Act
      const result = await checkSlotAvailability(mockSlotId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle slot not found', async () => {
      // Arrange
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Slot not found' },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(checkSlotAvailability(mockSlotId)).rejects.toMatchObject({
        message: 'Network error while checking slot availability',
      });
    });
  });

  describe('getNextAvailableSlots', () => {
    const mockServiceId = 'service-1';
    const mockLimit = 3;

    const mockResponse = {
      data: [
        {
          id: 'slot-1',
          serviceId: 'service-1',
          startDateTime: '2023-01-01T10:00:00Z',
          endDateTime: '2023-01-01T11:00:00Z',
          maxBookings: 5,
          availableBookings: 3,
          isAvailable: true,
          createdAt: '2023-01-01T08:00:00Z',
          updatedAt: '2023-01-01T08:00:00Z',
        },
        {
          id: 'slot-2',
          serviceId: 'service-1',
          startDateTime: '2023-01-01T11:00:00Z',
          endDateTime: '2023-01-01T12:00:00Z',
          maxBookings: 5,
          availableBookings: 2,
          isAvailable: true,
          createdAt: '2023-01-01T08:00:00Z',
          updatedAt: '2023-01-01T08:00:00Z',
        },
      ],
      meta: {
        page: 1,
        pageSize: 3,
        total: 2,
        totalPages: 1,
      },
    };

    it('should fetch next available slots', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await getNextAvailableSlots(mockServiceId, mockLimit);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/slots?page=1&pageSize=3&sort=startDateTime&order=asc&serviceId=service-1&isAvailable=true'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should use default limit of 5', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      // Act
      await getNextAvailableSlots(mockServiceId);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/slots?page=1&pageSize=5&sort=startDateTime&order=asc&serviceId=service-1&isAvailable=true'
      );
    });
  });

  describe('validateSlotForBooking', () => {
    const mockSlotId = 'slot-1';
    const mockServiceId = 'service-1';

    it('should validate available slot successfully', async () => {
      // Arrange
      const mockSlotResponse = {
        data: {
          id: 'slot-1',
          serviceId: 'service-1',
          startDateTime: '2023-01-01T10:00:00Z',
          endDateTime: '2023-01-01T11:00:00Z',
          maxBookings: 5,
          availableBookings: 3,
          isAvailable: true,
          createdAt: '2023-01-01T08:00:00Z',
          updatedAt: '2023-01-01T08:00:00Z',
        },
      };
      mockedAxios.get.mockResolvedValue(mockSlotResponse);

      // Act
      const result = await validateSlotForBooking(mockSlotId, mockServiceId);

      // Assert
      expect(result).toEqual({
        isValid: true,
      });
    });

    it('should invalidate unavailable slot', async () => {
      // Arrange
      const mockSlotResponse = {
        data: {
          id: 'slot-1',
          serviceId: 'service-1',
          startDateTime: '2023-01-01T10:00:00Z',
          endDateTime: '2023-01-01T11:00:00Z',
          maxBookings: 5,
          availableBookings: 0,
          isAvailable: false,
          createdAt: '2023-01-01T08:00:00Z',
          updatedAt: '2023-01-01T08:00:00Z',
        },
      };
      mockedAxios.get.mockResolvedValue(mockSlotResponse);

      // Act
      const result = await validateSlotForBooking(mockSlotId, mockServiceId);

      // Assert
      expect(result).toEqual({
        isValid: false,
        reason: 'Slot is not available',
      });
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Slot not found' },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      // Act
      const result = await validateSlotForBooking(mockSlotId, mockServiceId);

      // Assert
      expect(result).toEqual({
        isValid: false,
        reason: 'Network error while checking slot availability',
      });
    });
  });
});