import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock axios at the module level
const mockAxiosInstance = {
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

// Mock token service
vi.mock('../../services/token', () => ({
  getAccessToken: vi.fn(() => 'integration-test-token'),
}));

import {
  fetchPayments,
  createPayment,
  updatePayment,
  refundPayment,
  fetchPaymentMethods,
  createPaymentMethod,
  PaymentError,
} from '../../services/payment';

describe('Payment Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Payment CRUD Operations', () => {
    it('should integrate with API for fetching payments', async () => {
      // Arrange
      const mockApiResponse = {
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

      mockAxiosInstance.get.mockResolvedValue(mockApiResponse);

      // Act
      const result = await fetchPayments({ page: 1, status: 'Completed' });

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payments', {
        params: { page: 1, status: 'Completed' },
      });
      expect(result).toEqual(mockApiResponse.data);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].paymentStatus).toBe('Completed');
    });

    it('should integrate with API for creating payments', async () => {
      // Arrange
      const paymentData = {
        bookingId: 'booking-123',
        amount: 150,
        currency: 'USD',
        paymentMethod: 'CreditCard' as const,
      };

      const mockApiResponse = {
        data: {
          data: {
            id: 'payment-new',
            ...paymentData,
            paymentStatus: 'Pending' as const,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockApiResponse);

      // Act
      const result = await createPayment(paymentData);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments', paymentData);
      expect(result.data.id).toBe('payment-new');
      expect(result.data.bookingId).toBe('booking-123');
      expect(result.data.amount).toBe(150);
    });

    it('should integrate with API for updating payments', async () => {
      // Arrange
      const updateData = { paymentStatus: 'Completed' as const };
      const mockApiResponse = {
        data: {
          data: {
            id: 'payment-1',
            bookingId: 'booking-1',
            amount: 100,
            currency: 'USD',
            paymentMethod: 'CreditCard' as const,
            paymentStatus: 'Completed' as const,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      mockAxiosInstance.put.mockResolvedValue(mockApiResponse);

      // Act
      const result = await updatePayment('payment-1', updateData);

      // Assert
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/payments/payment-1', updateData);
      expect(result.data.paymentStatus).toBe('Completed');
    });

    it('should integrate with API for processing refunds', async () => {
      // Arrange
      const refundData = { amount: 50, reason: 'Customer request' };
      const mockApiResponse = {
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

      mockAxiosInstance.post.mockResolvedValue(mockApiResponse);

      // Act
      const result = await refundPayment('payment-1', refundData);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments/payment-1/refund', refundData);
      expect(result.data.paymentStatus).toBe('Refunded');
      expect(result.data.refundAmount).toBe(50);
    });
  });

  describe('Payment Method Operations', () => {
    it('should integrate with API for fetching payment methods', async () => {
      // Arrange
      const mockApiResponse = {
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

      mockAxiosInstance.get.mockResolvedValue(mockApiResponse);

      // Act
      const result = await fetchPaymentMethods('user-123');

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payment-methods?userId=user-123');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].isDefault).toBe(true);
    });

    it('should integrate with API for creating payment methods', async () => {
      // Arrange
      const methodData = {
        type: 'CreditCard',
        cardNumber: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        cardholderName: 'John Doe',
      };

      const mockApiResponse = {
        data: {
          data: {
            id: 'method-new',
            type: 'CreditCard',
            lastFourDigits: '1111',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: false,
            createdAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockApiResponse);

      // Act
      const result = await createPaymentMethod(methodData, 'user-123');

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payment-methods?userId=user-123', methodData);
      expect(result.data.id).toBe('method-new');
      expect(result.data.lastFourDigits).toBe('1111');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors and transform them to PaymentError', async () => {
      // Arrange
      const apiError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid payment data',
              details: [
                { field: 'amount', message: 'Amount must be positive' },
                { field: 'currency', message: 'Currency is required' },
              ],
            },
          },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(apiError);

      // Act & Assert
      await expect(createPayment({
        bookingId: 'booking-1',
        amount: -100,
        currency: '',
        paymentMethod: 'CreditCard' as const,
      })).rejects.toMatchObject({
        message: 'Invalid payment data',
        code: '400',
        details: [
          { field: 'amount', message: 'Amount must be positive' },
          { field: 'currency', message: 'Currency is required' },
        ],
      });
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network connection failed');
      mockAxiosInstance.get.mockRejectedValue(networkError);

      // Act & Assert
      await expect(fetchPayments()).rejects.toMatchObject({
        message: 'Network error while fetching payments',
      });
    });

    it('should handle unauthorized access', async () => {
      // Arrange
      const unauthorizedError = {
        response: {
          status: 401,
          data: { error: { message: 'Unauthorized' } },
        },
      };

      mockAxiosInstance.get.mockRejectedValue(unauthorizedError);

      // Act & Assert
      await expect(fetchPayments()).rejects.toMatchObject({
        message: 'Unauthorized',
        code: '401',
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should include authorization header in all API requests', async () => {
      // Arrange
      const mockResponse = { data: { data: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act
      await fetchPayments();

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payments', expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer integration-test-token',
        }),
      }));
    });

    it('should handle requests with user and tenant parameters', async () => {
      // Arrange
      const mockResponse = { data: { data: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act
      await fetchPaymentMethods('user-123', 'tenant-456');

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payment-methods?userId=user-123&tenantId=tenant-456');
    });
  });

  describe('Data Transformation', () => {
    it('should properly transform payment data from API', async () => {
      // Arrange
      const apiPaymentData = {
        id: 'payment-1',
        bookingId: 'booking-1',
        amount: 200.50,
        currency: 'EUR',
        paymentMethod: 'PayPal' as const,
        paymentStatus: 'Pending' as const,
        transactionId: 'txn_123456',
        paymentGateway: 'Stripe',
        paidAt: '2023-01-02T10:30:00Z',
        createdAt: '2023-01-01T09:00:00Z',
        updatedAt: '2023-01-02T10:30:00Z',
        refundAmount: 0,
      };

      const mockApiResponse = { data: { data: apiPaymentData } };
      mockAxiosInstance.get.mockResolvedValue(mockApiResponse);

      // Act
      const result = await fetchPayments();

      // Assert
      expect(result.data[0]).toEqual(apiPaymentData);
      expect(result.data[0].amount).toBe(200.50);
      expect(result.data[0].currency).toBe('EUR');
      expect(result.data[0].paymentMethod).toBe('PayPal');
    });

    it('should handle paginated responses correctly', async () => {
      // Arrange
      const mockApiResponse = {
        data: {
          data: [], // Empty data for this test
          meta: {
            page: 2,
            pageSize: 20,
            total: 150,
            totalPages: 8,
          },
          links: {
            self: '/payments?page=2',
            first: '/payments?page=1',
            last: '/payments?page=8',
            prev: '/payments?page=1',
            next: '/payments?page=3',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockApiResponse);

      // Act
      const result = await fetchPayments({ page: 2, pageSize: 20 });

      // Assert
      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(20);
      expect(result.meta.total).toBe(150);
      expect(result.meta.totalPages).toBe(8);
      expect(result.links?.next).toBe('/payments?page=3');
    });
  });
});