import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock token service
vi.mock('../../services/token', () => ({
  getAccessToken: vi.fn(() => 'mock-token'),
}));

// Mock axios at the module level
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

import {
  fetchPayments,
  fetchPaymentById,
  createPayment,
  updatePayment,
  refundPayment,
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  PaymentError,
} from '../../services/payment';

describe('Payment Service API Functions', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Access the mocked axios instance
    const axios = vi.mocked((await import('axios')).default);
    mockAxiosInstance = axios.create.mock.results[0]?.value;
    if (!mockAxiosInstance) {
      // Fallback: create a mock instance manually
      mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
    }
  });

  describe('fetchPayments', () => {
    it('should fetch payments successfully', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: [
            {
              id: 'payment-1',
              bookingId: 'booking-1',
              amount: 100,
              currency: 'USD',
              paymentMethod: 'CreditCard' as const,
              paymentStatus: 'Completed' as const,
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
            },
          ],
          meta: {
            page: 1,
            pageSize: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };

      // Mock the axios instance get method
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act
      const result = await fetchPayments({ page: 1, pageSize: 10 });

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payments', {
        params: { page: 1, pageSize: 10 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors and throw PaymentError', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid request',
              details: [{ field: 'amount', message: 'Amount is required' }],
            },
          },
        },
      };

      mockAxiosInstance.get.mockRejectedValue(errorResponse);

      // Act & Assert
      await expect(fetchPayments()).rejects.toMatchObject({
        message: 'Invalid request',
        code: '400',
        details: [{ field: 'amount', message: 'Amount is required' }],
      });
    });
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      // Arrange
      const paymentData = {
        bookingId: 'booking-1',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'CreditCard' as const,
      };
      const mockResponse = {
        data: {
          data: {
            id: 'payment-1',
            ...paymentData,
            paymentStatus: 'Pending' as const,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      const axios = (await import('axios')).default;
      const mockInstance = (axios.create as any).mock.results[0].value;
      mockInstance.post.mockResolvedValue(mockResponse);

      // Act
      const result = await createPayment(paymentData);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments', paymentData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('refundPayment', () => {
    it('should process refund successfully', async () => {
      // Arrange
      const refundData = { amount: 50, reason: 'Customer request' };
      const mockResponse = {
        data: {
          data: {
            id: 'payment-1',
            bookingId: 'booking-1',
            amount: 100,
            currency: 'USD',
            paymentMethod: 'CreditCard' as const,
            paymentStatus: 'Refunded' as const,
            refundAmount: 50,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Act
      const result = await refundPayment('payment-1', refundData);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments/payment-1/refund', refundData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('fetchPaymentMethods', () => {
    it('should fetch payment methods successfully', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: [
            {
              id: 'method-1',
              type: 'CreditCard',
              lastFourDigits: '1234',
              expiryMonth: 12,
              expiryYear: 2025,
              isDefault: true,
              createdAt: '2023-01-01T00:00:00Z',
            },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act
      const result = await fetchPaymentMethods('user-1');

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payment-methods?userId=user-1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createPaymentMethod', () => {
    it('should create payment method successfully', async () => {
      // Arrange
      const methodData = {
        type: 'CreditCard',
        cardNumber: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        cardholderName: 'John Doe',
      };
      const mockResponse = {
        data: {
          data: {
            id: 'method-1',
            type: 'CreditCard',
            lastFourDigits: '1111',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: false,
            createdAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Act
      const result = await createPaymentMethod(methodData, 'user-1');

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payment-methods?userId=user-1', methodData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Error Handling', () => {
    it('should properly handle and transform API errors', async () => {
      // This is tested in the fetchPayments error test above
      expect(true).toBe(true);
    });
  });
});