/**
 * Booking-related type definitions for the application
 */

/**
 * Booking status enumeration
 */
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'refunded';

/**
 * Payment status enumeration
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

/**
 * Booking priority enumeration
 */
export type BookingPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Booking base interface
 */
export interface Booking {
  /** Unique booking identifier */
  id: string;
  /** Service being booked */
  serviceId: string;
  /** Customer who made the booking */
  customerId: string;
  /** Service provider */
  providerId: string;
  /** Scheduled date and time */
  scheduledAt: string;
  /** Booking duration in minutes */
  duration: number;
  /** Number of participants */
  participantCount: number;
  /** Total price including taxes */
  totalPrice: number;
  /** Currency code */
  currency: string;
  /** Current booking status */
  status: BookingStatus;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Booking priority */
  priority: BookingPriority;
  /** Special requests or notes */
  notes?: string;
  /** Internal notes (provider only) */
  internalNotes?: string;
  /** Cancellation reason if applicable */
  cancellationReason?: string;
  /** Cancellation timestamp */
  cancelledAt?: string;
  /** Completion timestamp */
  completedAt?: string;
  /** Rating given by customer (1-5) */
  rating?: number;
  /** Review text */
  review?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Booking creation data
 */
export interface BookingCreateData {
  /** Service ID to book */
  serviceId: string;
  /** Preferred date and time */
  scheduledAt: string;
  /** Number of participants */
  participantCount: number;
  /** Special requests */
  notes?: string;
  /** Promo code if applicable */
  promoCode?: string;
  /** Payment method ID */
  paymentMethodId?: string;
}

/**
 * Booking update data
 */
export interface BookingUpdateData {
  /** Updated scheduled time */
  scheduledAt?: string;
  /** Updated participant count */
  participantCount?: number;
  /** Updated notes */
  notes?: string;
  /** Updated internal notes */
  internalNotes?: string;
  /** Updated priority */
  priority?: BookingPriority;
}

/**
 * Booking filters for listing
 */
export interface BookingFilters {
  /** Status filter */
  status?: BookingStatus[];
  /** Date range filter */
  dateRange?: {
    start: string;
    end: string;
  };
  /** Service filter */
  serviceId?: string;
  /** Customer filter */
  customerId?: string;
  /** Provider filter */
  providerId?: string;
  /** Payment status filter */
  paymentStatus?: PaymentStatus[];
  /** Search query */
  search?: string;
}

/**
 * Booking list response
 */
export interface BookingListResponse {
  /** Array of bookings */
  bookings: Booking[];
  /** Total number of bookings */
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
 * Time slot information
 */
export interface TimeSlot {
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
  /** Whether slot is available */
  available: boolean;
  /** Price for this slot (if different from base price) */
  price?: number;
  /** Maximum participants for this slot */
  maxParticipants?: number;
}

/**
 * Service availability information
 */
export interface ServiceAvailability {
  /** Service ID */
  serviceId: string;
  /** Date for availability check */
  date: string;
  /** Available time slots */
  slots: TimeSlot[];
  /** Service duration */
  duration: number;
  /** Buffer time between bookings */
  bufferTime: number;
}

/**
 * Booking conflict information
 */
export interface BookingConflict {
  /** Conflicting booking ID */
  bookingId: string;
  /** Conflict type */
  type: 'time_overlap' | 'resource_unavailable' | 'provider_unavailable';
  /** Conflict description */
  description: string;
  /** Suggested alternatives */
  alternatives?: Array<{
    startTime: string;
    endTime: string;
    reason: string;
  }>;
}

/**
 * Booking reminder settings
 */
export interface BookingReminderSettings {
  /** Reminder enabled */
  enabled: boolean;
  /** Reminder timing (hours before booking) */
  timing: number[];
  /** Reminder methods */
  methods: Array<'email' | 'sms' | 'push'>;
  /** Custom reminder message */
  message?: string;
}

/**
 * Booking analytics data
 */
export interface BookingAnalytics {
  /** Time period */
  period: {
    start: string;
    end: string;
  };
  /** Booking statistics */
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
  };
  /** Trend data */
  trends: Array<{
    date: string;
    bookings: number;
    revenue: number;
    cancellationRate: number;
  }>;
  /** Popular services */
  popularServices: Array<{
    serviceId: string;
    serviceName: string;
    bookings: number;
    revenue: number;
  }>;
  /** Peak hours */
  peakHours: Array<{
    hour: number;
    bookings: number;
    dayOfWeek: number;
  }>;
}

/**
 * Booking notification data
 */
export interface BookingNotification {
  /** Notification ID */
  id: string;
  /** Booking ID */
  bookingId: string;
  /** Notification type */
  type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule' | 'review_request';
  /** Recipient user ID */
  recipientId: string;
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Delivery method */
  method: 'email' | 'sms' | 'push' | 'in_app';
  /** Delivery status */
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  /** Scheduled send time */
  scheduledFor: string;
  /** Actual send time */
  sentAt?: string;
}

/**
 * Recurring booking pattern
 */
export interface RecurringBookingPattern {
  /** Pattern type */
  type: 'daily' | 'weekly' | 'monthly';
  /** Interval (every N days/weeks/months) */
  interval: number;
  /** Days of week (for weekly patterns) */
  daysOfWeek?: number[];
  /** Day of month (for monthly patterns) */
  dayOfMonth?: number;
  /** End date for recurring pattern */
  endDate?: string;
  /** Maximum occurrences */
  maxOccurrences?: number;
}

/**
 * Recurring booking data
 */
export interface RecurringBookingCreateData extends BookingCreateData {
  /** Recurring pattern */
  pattern: RecurringBookingPattern;
  /** Exceptions to the pattern */
  exceptions?: string[];
}

/**
 * Booking template for quick booking
 */
export interface BookingTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Service ID */
  serviceId: string;
  /** Default participant count */
  defaultParticipantCount: number;
  /** Default notes */
  defaultNotes?: string;
  /** Preferred time slots */
  preferredTimeSlots: string[];
  /** Auto-confirmation enabled */
  autoConfirm: boolean;
  /** Template creation timestamp */
  createdAt: string;
  /** Last used timestamp */
  lastUsed?: string;
}

/**
 * Booking review data
 */
export interface BookingReview {
  /** Review ID */
  id: string;
  /** Booking ID */
  bookingId: string;
  /** Customer ID */
  customerId: string;
  /** Service provider ID */
  providerId: string;
  /** Rating (1-5) */
  rating: number;
  /** Review title */
  title?: string;
  /** Review content */
  content: string;
  /** Review images */
  images?: string[];
  /** Whether review is verified */
  verified: boolean;
  /** Whether customer recommends the service */
  recommended: boolean;
  /** Response from service provider */
  providerResponse?: string;
  /** Review creation timestamp */
  createdAt: string;
  /** Review update timestamp */
  updatedAt?: string;
}

/**
 * Booking payment information
 */
export interface BookingPayment {
  /** Payment ID */
  id: string;
  /** Booking ID */
  bookingId: string;
  /** Payment amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Payment method */
  paymentMethod: {
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';
    last4?: string;
    brand?: string;
  };
  /** Payment status */
  status: PaymentStatus;
  /** Transaction ID */
  transactionId?: string;
  /** Payment gateway response */
  gatewayResponse?: Record<string, any>;
  /** Refund information if applicable */
  refund?: {
    amount: number;
    reason: string;
    processedAt: string;
  };
  /** Payment timestamp */
  paidAt?: string;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Booking calendar event
 */
export interface BookingCalendarEvent {
  /** Event ID */
  id: string;
  /** Booking ID */
  bookingId: string;
  /** Event title */
  title: string;
  /** Event start time */
  start: string;
  /** Event end time */
  end: string;
  /** Event description */
  description?: string;
  /** Event location */
  location?: string;
  /** Event attendees */
  attendees: Array<{
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'provider';
  }>;
  /** Event status */
  status: BookingStatus;
  /** Calendar provider */
  calendarProvider?: 'google' | 'outlook' | 'apple';
  /** External event ID */
  externalEventId?: string;
}