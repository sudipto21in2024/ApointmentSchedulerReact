/**
 * ============================================================================
 * ENUMERATION DEFINITIONS
 * ============================================================================
 * Common enumeration types used across the application.
 *
 * This file contains all enum-like definitions that are shared across
 * different modules and components in the application. Using const assertions
 * for compatibility with erasableSyntaxOnly TypeScript configuration.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * ============================================================================
 */

/**
 * ============================================================================
 * NOTIFICATION ENUMS
 * ============================================================================
 */

/**
 * Types of notifications supported by the system
 */
export const NotificationType = {
  /** Email notifications */
  EMAIL: 'Email',

  /** SMS notifications */
  SMS: 'SMS',

  /** Push notifications */
  PUSH: 'Push'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

/**
 * Priority levels for notifications
 */
export const NotificationPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

/**
 * Categories for organizing notifications
 */
export const NotificationCategory = {
  BOOKING: 'booking',
  SERVICE: 'service',
  PAYMENT: 'payment',
  SYSTEM: 'system',
  PROMOTIONAL: 'promotional'
} as const;

export type NotificationCategory = typeof NotificationCategory[keyof typeof NotificationCategory];

/**
 * ============================================================================
 * USER ENUMS
 * ============================================================================
 */

/**
 * Types of users in the system
 */
export const UserType = {
  CUSTOMER: 'Customer',
  PROVIDER: 'Provider',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'SuperAdmin'
} as const;

export type UserType = typeof UserType[keyof typeof UserType];

/**
 * ============================================================================
 * BOOKING ENUMS
 * ============================================================================
 */

/**
 * Status of a booking
 */
export const BookingStatus = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

/**
 * ============================================================================
 * PAYMENT ENUMS
 * ============================================================================
 */

/**
 * Status of a payment
 */
export const PaymentStatus = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

/**
 * Method used for payment
 */
export const PaymentMethod = {
  CREDIT_CARD: 'CreditCard',
  DEBIT_CARD: 'DebitCard',
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'BankTransfer'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

/**
 * ============================================================================
 * SERVICE ENUMS
 * ============================================================================
 */

/**
 * Status of a service
 */
export const ServiceStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
} as const;

export type ServiceStatus = typeof ServiceStatus[keyof typeof ServiceStatus];

/**
 * ============================================================================
 * COMMON ENUMS
 * ============================================================================
 */

/**
 * Sort order directions
 */
export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

export type SortOrder = typeof SortOrder[keyof typeof SortOrder];

/**
 * Common status values
 */
export const Status = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type Status = typeof Status[keyof typeof Status];

export {};