/**
 * Payment-related type definitions for the application
 *
 * This file contains comprehensive type definitions for payment processing,
 * payment methods, payment history, and related financial operations.
 */

/**
 * Payment status enumeration
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';

/**
 * Payment method types enumeration
 */
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'cash' | 'check';

/**
 * Payment gateway enumeration
 */
export type PaymentGateway = 'stripe' | 'paypal' | 'square' | 'authorize_net' | 'braintree';

/**
 * Currency codes enumeration
 */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'INR';

/**
 * Refund reason enumeration
 */
export type RefundReason = 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'product_not_received' | 'product_unacceptable' | 'subscription_cancelled' | 'other';

/**
 * Payment base interface
 */
export interface Payment {
  /** Unique payment identifier */
  id: string;
  /** Associated booking ID */
  bookingId?: string;
  /** Customer who made the payment */
  customerId: string;
  /** Service provider receiving payment */
  providerId?: string;
  /** Payment amount in smallest currency unit (cents) */
  amount: number;
  /** Currency code */
  currency: CurrencyCode;
  /** Current payment status */
  status: PaymentStatus;
  /** Payment method used */
  paymentMethod: PaymentMethodInfo;
  /** Payment gateway used for processing */
  gateway: PaymentGateway;
  /** Gateway transaction ID */
  gatewayTransactionId?: string;
  /** Internal transaction reference */
  reference?: string;
  /** Payment description */
  description?: string;
  /** Payment metadata */
  metadata?: Record<string, any>;
  /** Refund information if applicable */
  refund?: PaymentRefund;
  /** Payment timestamp */
  paidAt?: string;
  /** Payment creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Payment method information
 */
export interface PaymentMethodInfo {
  /** Payment method type */
  type: PaymentMethodType;
  /** Last 4 digits for card payments */
  last4?: string;
  /** Card brand (Visa, Mastercard, etc.) */
  brand?: string;
  /** Expiry month for card payments */
  expiryMonth?: number;
  /** Expiry year for card payments */
  expiryYear?: number;
  /** Cardholder name */
  cardholderName?: string;
  /** Bank name for bank transfers */
  bankName?: string;
  /** Account number (masked) */
  accountNumber?: string;
  /** Digital wallet type (Apple Pay, Google Pay, etc.) */
  walletType?: string;
  /** Whether this is the default payment method */
  isDefault: boolean;
}

/**
 * Payment method for saving/retrieving
 */
export interface PaymentMethod {
  /** Unique payment method identifier */
  id: string;
  /** Customer ID */
  customerId: string;
  /** Payment method type */
  type: PaymentMethodType;
  /** Gateway payment method ID/token */
  gatewayPaymentMethodId: string;
  /** Last 4 digits for display */
  last4?: string;
  /** Card brand or payment method name */
  brand?: string;
  /** Expiry month (for cards) */
  expiryMonth?: number;
  /** Expiry year (for cards) */
  expiryYear?: number;
  /** Cardholder name */
  cardholderName?: string;
  /** Billing address */
  billingAddress?: Address;
  /** Whether this is the default payment method */
  isDefault: boolean;
  /** Payment method creation timestamp */
  createdAt: string;
  /** Last used timestamp */
  lastUsed?: string;
}

/**
 * Address information for billing
 */
export interface Address {
  /** Street address line 1 */
  line1: string;
  /** Street address line 2 */
  line2?: string;
  /** City */
  city: string;
  /** State/Province */
  state: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
}

/**
 * Payment creation data
 */
export interface PaymentCreateData {
  /** Payment amount in smallest currency unit */
  amount: number;
  /** Currency code */
  currency: CurrencyCode;
  /** Payment method ID to use */
  paymentMethodId: string;
  /** Booking ID if applicable */
  bookingId?: string;
  /** Payment description */
  description?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Save payment method for future use */
  savePaymentMethod?: boolean;
  /** Billing address */
  billingAddress?: Address;
}

/**
 * Payment update data
 */
export interface PaymentUpdateData {
  /** Updated payment status */
  status?: PaymentStatus;
  /** Updated payment method */
  paymentMethod?: PaymentMethodInfo;
  /** Updated metadata */
  metadata?: Record<string, any>;
  /** Updated description */
  description?: string;
}

/**
 * Payment refund information
 */
export interface PaymentRefund {
  /** Refund ID */
  id: string;
  /** Refund amount in smallest currency unit */
  amount: number;
  /** Currency code */
  currency: CurrencyCode;
  /** Reason for refund */
  reason: RefundReason;
  /** Refund status */
  status: 'pending' | 'completed' | 'failed';
  /** Refund timestamp */
  refundedAt?: string;
  /** Gateway refund ID */
  gatewayRefundId?: string;
  /** Notes about the refund */
  notes?: string;
}

/**
 * Payment filters for listing
 */
export interface PaymentFilters {
  /** Status filter */
  status?: PaymentStatus[];
  /** Date range filter */
  dateRange?: {
    start: string;
    end: string;
  };
  /** Amount range filter */
  amountRange?: {
    min: number;
    max: number;
  };
  /** Payment method filter */
  paymentMethodType?: PaymentMethodType[];
  /** Gateway filter */
  gateway?: PaymentGateway[];
  /** Customer filter */
  customerId?: string;
  /** Provider filter */
  providerId?: string;
  /** Booking filter */
  bookingId?: string;
  /** Search query */
  search?: string;
}

/**
 * Payment list response
 */
export interface PaymentListResponse {
  /** Array of payments */
  payments: Payment[];
  /** Total number of payments */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Whether there are more pages */
  hasNext: boolean;
  /** Whether there are previous pages */
  hasPrev: boolean;
}

/**
 * Payment analytics data
 */
export interface PaymentAnalytics {
  /** Time period */
  period: {
    start: string;
    end: string;
  };
  /** Payment statistics */
  stats: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    refundedPayments: number;
    totalRevenue: number;
    averagePaymentValue: number;
    refundRate: number;
  };
  /** Trend data */
  trends: Array<{
    date: string;
    payments: number;
    revenue: number;
    successRate: number;
  }>;
  /** Payment method breakdown */
  paymentMethodBreakdown: Array<{
    method: PaymentMethodType;
    count: number;
    amount: number;
    percentage: number;
  }>;
  /** Gateway performance */
  gatewayPerformance: Array<{
    gateway: PaymentGateway;
    successRate: number;
    averageProcessingTime: number;
    totalProcessed: number;
  }>;
}

/**
 * Payment intent for secure processing
 */
export interface PaymentIntent {
  /** Payment intent ID */
  id: string;
  /** Client secret for secure processing */
  clientSecret: string;
  /** Payment amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Payment status */
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';
  /** Allowed payment method types */
  paymentMethodTypes: PaymentMethodType[];
  /** Creation timestamp */
  createdAt: string;
  /** Expiration timestamp */
  expiresAt: string;
}

/**
 * Payment confirmation data
 */
export interface PaymentConfirmationData {
  /** Payment intent ID */
  paymentIntentId: string;
  /** Payment method ID */
  paymentMethodId: string;
  /** Return URL for redirect-based payments */
  returnUrl?: string;
  /** Additional confirmation data */
  confirmationData?: Record<string, any>;
}

/**
 * Payment method creation data
 */
export interface PaymentMethodCreateData {
  /** Payment method type */
  type: PaymentMethodType;
  /** Gateway token/ID */
  gatewayToken: string;
  /** Billing address */
  billingAddress?: Address;
  /** Cardholder name (for cards) */
  cardholderName?: string;
  /** Set as default payment method */
  setAsDefault?: boolean;
}

/**
 * Payment method update data
 */
export interface PaymentMethodUpdateData {
  /** Updated billing address */
  billingAddress?: Address;
  /** Set as default payment method */
  setAsDefault?: boolean;
}

/**
 * Payment validation error
 */
export interface PaymentValidationError {
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Error code */
  code: string;
}

/**
 * Payment processing result
 */
export interface PaymentProcessingResult {
  /** Whether payment was successful */
  success: boolean;
  /** Payment ID if successful */
  paymentId?: string;
  /** Gateway transaction ID */
  gatewayTransactionId?: string;
  /** Error message if failed */
  error?: string;
  /** Validation errors if applicable */
  validationErrors?: PaymentValidationError[];
  /** Additional data from gateway */
  gatewayResponse?: Record<string, any>;
}

/**
 * Payment webhook data
 */
export interface PaymentWebhookData {
  /** Webhook event type */
  eventType: 'payment.succeeded' | 'payment.failed' | 'payment.refunded' | 'payment.dispute.created';
  /** Payment ID */
  paymentId: string;
  /** Webhook data payload */
  data: Record<string, any>;
  /** Webhook signature for verification */
  signature?: string;
  /** Timestamp when webhook was sent */
  timestamp: string;
}

/**
 * Payment dispute information
 */
export interface PaymentDispute {
  /** Dispute ID */
  id: string;
  /** Payment ID */
  paymentId: string;
  /** Dispute reason */
  reason: string;
  /** Dispute status */
  status: 'needs_response' | 'under_review' | 'won' | 'lost' | 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'expired';
  /** Dispute amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Evidence submission deadline */
  evidenceDueBy?: string;
  /** Dispute creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Payment subscription information
 */
export interface PaymentSubscription {
  /** Subscription ID */
  id: string;
  /** Customer ID */
  customerId: string;
  /** Payment method ID */
  paymentMethodId: string;
  /** Subscription amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Billing interval */
  interval: 'day' | 'week' | 'month' | 'year';
  /** Billing interval count */
  intervalCount: number;
  /** Subscription status */
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  /** Current period start */
  currentPeriodStart: string;
  /** Current period end */
  currentPeriodEnd: string;
  /** Cancel at period end */
  cancelAtPeriodEnd: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Cancellation timestamp */
  canceledAt?: string;
}