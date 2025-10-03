/**
 * Payment API Service
 *
 * Handles all payment-related API communications including payment processing,
 * payment method management, payment history, and refund operations.
 *
 * Features:
 * - Secure payment processing with multiple gateways
 * - Payment method management (CRUD operations)
 * - Payment history and analytics
 * - Refund processing
 * - Webhook handling for payment status updates
 * - Comprehensive error handling and retry logic
 * - TypeScript support with proper type definitions
 */

import { HttpClient } from './base-api.service';
import type {
  Payment,
  PaymentCreateData,
  PaymentUpdateData,
  PaymentFilters,
  PaymentListResponse,
  PaymentMethod,
  PaymentMethodCreateData,
  PaymentMethodUpdateData,
  PaymentIntent,
  PaymentProcessingResult,
  PaymentConfirmationData,
  PaymentAnalytics,
  PaymentWebhookData,
  PaymentRefund,
  RefundReason,
  PaymentStatus,
  PaymentMethodType,
  CurrencyCode,
  PaymentGateway
} from '../types/payment';

/**
 * Payment API Service Class
 */
export class PaymentApiService extends HttpClient {
  constructor() {
    super({ baseUrl: '/api/payments' });
  }

  // ========== PAYMENT INTENT OPERATIONS ==========

  /**
   * Create a payment intent for secure payment processing
   * This initializes the payment with the gateway for enhanced security
   *
   * @param intentData - Payment intent creation data
   * @returns Promise<PaymentIntent> - The created payment intent
   */
  async createPaymentIntent(intentData: {
    amount: number;
    currency: CurrencyCode;
    paymentMethodTypes: PaymentMethodType[];
    metadata?: Record<string, any>;
    description?: string;
  }): Promise<PaymentIntent> {
    try {
      return await this.post<PaymentIntent>('/payment-intents', intentData);
    } catch (error) {
      this.handleError(error, 'Failed to create payment intent');
      throw error;
    }
  }

  /**
   * Retrieve a payment intent by ID
   *
   * @param intentId - Payment intent ID
   * @returns Promise<PaymentIntent> - The payment intent
   */
  async getPaymentIntent(intentId: string): Promise<PaymentIntent> {
    try {
      return await this.get<PaymentIntent>(`/payment-intents/${intentId}`);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve payment intent');
      throw error;
    }
  }

  // ========== PAYMENT PROCESSING OPERATIONS ==========

  /**
   * Process a payment with comprehensive validation and error handling
   *
   * @param paymentData - Payment creation data
   * @returns Promise<PaymentProcessingResult> - Payment processing result
   */
  async processPayment(paymentData: PaymentCreateData): Promise<PaymentProcessingResult> {
    try {
      return await this.post<PaymentProcessingResult>('/process', paymentData);
    } catch (error) {
      this.handleError(error, 'Failed to process payment');
      throw error;
    }
  }

  /**
   * Confirm a payment with additional authentication data
   *
   * @param confirmationData - Payment confirmation data
   * @returns Promise<PaymentProcessingResult> - Payment processing result
   */
  async confirmPayment(confirmationData: PaymentConfirmationData): Promise<PaymentProcessingResult> {
    try {
      return await this.post<PaymentProcessingResult>('/confirm', confirmationData);
    } catch (error) {
      this.handleError(error, 'Failed to confirm payment');
      throw error;
    }
  }

  /**
   * Get payment by ID with full details
   *
   * @param paymentId - Payment ID
   * @returns Promise<Payment> - Payment details
   */
  async getPayment(paymentId: string): Promise<Payment> {
    try {
      return await this.get<Payment>(`/${paymentId}`);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve payment');
      throw error;
    }
  }

  /**
   * Update payment details
   *
   * @param paymentId - Payment ID
   * @param updateData - Payment update data
   * @returns Promise<Payment> - Updated payment
   */
  async updatePayment(paymentId: string, updateData: PaymentUpdateData): Promise<Payment> {
    try {
      return await this.put<Payment>(`/${paymentId}`, updateData);
    } catch (error) {
      this.handleError(error, 'Failed to update payment');
      throw error;
    }
  }

  /**
   * Get payments list with filtering and pagination
   *
   * @param filters - Payment filters
   * @param page - Page number (default: 1)
   * @param pageSize - Page size (default: 10)
   * @returns Promise<PaymentListResponse> - Paginated payment list
   */
  async getPayments(
    filters: PaymentFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaymentListResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...this.buildFilterParams(filters)
      });

      return await this.get<PaymentListResponse>(`/?${queryParams}`);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve payments');
      throw error;
    }
  }

  /**
   * Get payment analytics for a specific period
   *
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<PaymentAnalytics> - Payment analytics data
   */
  async getPaymentAnalytics(startDate: string, endDate: string): Promise<PaymentAnalytics> {
    try {
      return await this.get<PaymentAnalytics>(`/analytics?startDate=${startDate}&endDate=${endDate}`);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve payment analytics');
      throw error;
    }
  }

  // ========== REFUND OPERATIONS ==========

  /**
   * Process a refund for a payment
   *
   * @param paymentId - Payment ID to refund
   * @param refundData - Refund data including amount and reason
   * @returns Promise<PaymentRefund> - Refund details
   */
  async processRefund(
    paymentId: string,
    refundData: {
      amount?: number;
      reason: RefundReason;
      notes?: string;
    }
  ): Promise<PaymentRefund> {
    try {
      return await this.post<PaymentRefund>(`/${paymentId}/refund`, refundData);
    } catch (error) {
      this.handleError(error, 'Failed to process refund');
      throw error;
    }
  }

  /**
   * Get refund details by ID
   *
   * @param paymentId - Payment ID
   * @param refundId - Refund ID
   * @returns Promise<PaymentRefund> - Refund details
   */
  async getRefund(paymentId: string, refundId: string): Promise<PaymentRefund> {
    try {
      return await this.get<PaymentRefund>(`/${paymentId}/refunds/${refundId}`);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve refund');
      throw error;
    }
  }

  // ========== PAYMENT METHOD OPERATIONS ==========

  /**
   * Get user's payment methods
   *
   * @param customerId - Customer ID (optional, defaults to current user)
   * @returns Promise<PaymentMethod[]> - Array of payment methods
   */
  async getPaymentMethods(customerId?: string): Promise<PaymentMethod[]> {
    try {
      const endpoint = customerId ? `/payment-methods?customerId=${customerId}` : '/payment-methods';
      return await this.get<PaymentMethod[]>(endpoint);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve payment methods');
      throw error;
    }
  }

  /**
   * Create a new payment method
   *
   * @param paymentMethodData - Payment method creation data
   * @returns Promise<PaymentMethod> - Created payment method
   */
  async createPaymentMethod(paymentMethodData: PaymentMethodCreateData): Promise<PaymentMethod> {
    try {
      return await this.post<PaymentMethod>('/payment-methods', paymentMethodData);
    } catch (error) {
      this.handleError(error, 'Failed to create payment method');
      throw error;
    }
  }

  /**
   * Update an existing payment method
   *
   * @param paymentMethodId - Payment method ID
   * @param updateData - Payment method update data
   * @returns Promise<PaymentMethod> - Updated payment method
   */
  async updatePaymentMethod(
    paymentMethodId: string,
    updateData: PaymentMethodUpdateData
  ): Promise<PaymentMethod> {
    try {
      return await this.put<PaymentMethod>(`/payment-methods/${paymentMethodId}`, updateData);
    } catch (error) {
      this.handleError(error, 'Failed to update payment method');
      throw error;
    }
  }

  /**
   * Delete a payment method
   *
   * @param paymentMethodId - Payment method ID
   * @returns Promise<void>
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await this.delete(`/payment-methods/${paymentMethodId}`);
    } catch (error) {
      this.handleError(error, 'Failed to delete payment method');
      throw error;
    }
  }

  /**
   * Set a payment method as default
   *
   * @param paymentMethodId - Payment method ID
   * @returns Promise<PaymentMethod> - Updated payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      return await this.put<PaymentMethod>(`/payment-methods/${paymentMethodId}/default`, {});
    } catch (error) {
      this.handleError(error, 'Failed to set default payment method');
      throw error;
    }
  }

  // ========== WEBHOOK OPERATIONS ==========

  /**
   * Handle payment webhook from gateway
   * This should be called by the webhook endpoint handler
   *
   * @param webhookData - Webhook data from payment gateway
   * @returns Promise<void>
   */
  async handleWebhook(webhookData: PaymentWebhookData): Promise<void> {
    try {
      await this.post('/webhooks', webhookData);
    } catch (error) {
      this.handleError(error, 'Failed to handle webhook');
      throw error;
    }
  }

  /**
   * Verify webhook signature for security
   *
   * @param payload - Raw webhook payload
   * @param signature - Webhook signature from gateway
   * @param secret - Webhook secret for verification
   * @returns boolean - Whether signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      // Implementation depends on the payment gateway
      // This is a placeholder for signature verification logic
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

      return signature === `sha256=${expectedSignature}`;
    } catch (error) {
      console.error('Failed to verify webhook signature:', error);
      return false;
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Build query parameters from filters
   *
   * @private
   * @param filters - Payment filters
   * @returns Record<string, string> - Query parameters
   */
  private buildFilterParams(filters: PaymentFilters): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.status?.length) {
      params.status = filters.status.join(',');
    }

    if (filters.dateRange) {
      params.startDate = filters.dateRange.start;
      params.endDate = filters.dateRange.end;
    }

    if (filters.amountRange) {
      params.minAmount = filters.amountRange.min.toString();
      params.maxAmount = filters.amountRange.max.toString();
    }

    if (filters.paymentMethodType?.length) {
      params.paymentMethodType = filters.paymentMethodType.join(',');
    }

    if (filters.gateway?.length) {
      params.gateway = filters.gateway.join(',');
    }

    if (filters.customerId) {
      params.customerId = filters.customerId;
    }

    if (filters.providerId) {
      params.providerId = filters.providerId;
    }

    if (filters.bookingId) {
      params.bookingId = filters.bookingId;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    return params;
  }
}

// Export singleton instance
export const paymentApi = new PaymentApiService();