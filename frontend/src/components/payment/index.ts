/**
 * Payment Components Library
 *
 * Centralized exports for all payment-related components including
 * payment forms, history, status tracking, and method management.
 *
 * @example
 * ```tsx
 * // Import individual components
 * import { PaymentForm, PaymentHistory } from '@/components/payment';
 *
 * // Import component groups
 * import { PaymentForm, PaymentStatusTracker } from '@/components/payment';
 *
 * // Import all components
 * import * as Payment from '@/components/payment';
 * ```
 */

// Core Payment Components - Named exports
export { PaymentForm } from './payment-form.component';
export { PaymentHistory } from './payment-history.component';
export { PaymentStatusTracker } from './payment-status.component';
export { PaymentMethodManagement } from './payment-method-management/payment-method-management.component';

// Type exports
export type { PaymentFormProps } from './payment-form.component';
export type { PaymentHistoryProps } from './payment-history.component';
export type { PaymentStatusTrackerProps } from './payment-status.component';
export type { PaymentMethodManagementProps } from './payment-method-management/payment-method-management.component';

// Default exports for convenience
export { default as DefaultPaymentForm } from './payment-form.component';
export { default as DefaultPaymentHistory } from './payment-history.component';
export { default as DefaultPaymentStatusTracker } from './payment-status.component';
export { default as DefaultPaymentMethodManagement } from './payment-method-management/payment-method-management.component';