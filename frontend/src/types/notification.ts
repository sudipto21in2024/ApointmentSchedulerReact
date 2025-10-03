/**
 * ============================================================================
 * NOTIFICATION TYPE DEFINITIONS
 * ============================================================================
 * TypeScript interfaces and types for notification management system.
 *
 * This file contains all type definitions for notifications, preferences,
 * and related data structures used across the notification components.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * ============================================================================
 */

import { NotificationType } from '../types/enums';
import type { QueryObserverResult } from '@tanstack/react-query';

/**
 * ============================================================================
 * CORE NOTIFICATION INTERFACES
 * ============================================================================
 */

/**
 * Notification entity representing a single notification
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;

  /** Reference to recipient user */
  userId: string;

  /** Notification title */
  title: string;

  /** Notification content */
  message: string;

  /** Type of notification (Email, SMS, Push) */
  type: NotificationType;

  /** Read status */
  isRead: boolean;

  /** Timestamp when notification was sent */
  sentAt?: string;

  /** Notification creation timestamp */
  createdAt: string;

  /** Last notification update timestamp */
  updatedAt: string;

  /** Expiration timestamp */
  expiresAt?: string;

  /** Reference to related entity (booking, service, etc.) */
  relatedEntityId?: string;

  /** Type of related entity */
  relatedEntityType?: string;
}

/**
 * Notification preference settings for a user
 */
export interface NotificationPreference {
  /** Unique identifier for the notification preference */
  id: string;

  /** Reference to the user */
  userId: string;

  /** Whether email notifications are enabled */
  emailEnabled: boolean;

  /** Whether SMS notifications are enabled */
  smsEnabled: boolean;

  /** Whether push notifications are enabled */
  pushEnabled: boolean;

  /** User's preferred timezone */
  preferredTimezone?: string;

  /** Reference to tenant (for multi-tenancy) */
  tenantId?: string;
}

/**
 * ============================================================================
 * API REQUEST/RESPONSE INTERFACES
 * ============================================================================
 */

/**
 * Request payload for creating a new notification
 */
export interface CreateNotificationRequest {
  /** Reference to recipient user */
  userId: string;

  /** Notification title */
  title: string;

  /** Notification content */
  message: string;

  /** Type of notification */
  type: NotificationType;

  /** Timestamp when notification should be sent */
  sentAt?: string;

  /** Expiration timestamp */
  expiresAt?: string;

  /** Reference to related entity */
  relatedEntityId?: string;

  /** Type of related entity */
  relatedEntityType?: string;
}

/**
 * Request payload for updating a notification
 */
export interface UpdateNotificationRequest {
  /** Read status */
  isRead?: boolean;

  /** Timestamp when notification was sent */
  sentAt?: string;

  /** Expiration timestamp */
  expiresAt?: string;
}

/**
 * Request payload for updating notification preferences
 */
export interface UpdateNotificationPreferencesRequest {
  /** Whether email notifications are enabled */
  emailEnabled: boolean;

  /** Whether SMS notifications are enabled */
  smsEnabled: boolean;

  /** Whether push notifications are enabled */
  pushEnabled: boolean;

  /** User's preferred timezone */
  preferredTimezone?: string;
}

/**
 * API response wrapper for a single notification
 */
export interface NotificationResponse {
  /** Notification data */
  data: Notification;
}

/**
 * API response wrapper for notification preferences
 */
export interface NotificationPreferencesResponse {
  /** Notification preference data */
  data: NotificationPreference;
}

/**
 * API response wrapper for notification list with pagination
 */
export interface NotificationListResponse {
  /** Array of notifications */
  data: Notification[];

  /** Pagination metadata */
  meta: PaginationMeta;

  /** Navigation links */
  links?: PaginationLinks;
}

/**
 * ============================================================================
 * PAGINATION INTERFACES
 * ============================================================================
 */

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number */
  currentPage: number;

  /** Number of items per page */
  perPage: number;

  /** Total number of items */
  total: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there are more items after current page */
  hasNextPage: boolean;

  /** Whether there are items before current page */
  hasPreviousPage: boolean;
}

/**
 * Pagination navigation links
 */
export interface PaginationLinks {
  /** Link to current page */
  self: string;

  /** Link to first page */
  first: string;

  /** Link to last page */
  last: string;

  /** Link to previous page (null if no previous) */
  prev: string | null;

  /** Link to next page (null if no next) */
  next: string | null;
}

/**
 * ============================================================================
 * COMPONENT PROPS INTERFACES
 * ============================================================================
 */

/**
 * Props for NotificationList component
 */
export interface NotificationListProps {
  /** Array of notifications to display */
  notifications?: Notification[];

  /** Loading state */
  loading?: boolean;

  /** Error message if loading failed */
  error?: string | null;

  /** Current page number */
  currentPage?: number;

  /** Total number of pages */
  totalPages?: number;

  /** Callback when page changes */
  onPageChange?: (page: number) => void;

  /** Callback when notification is marked as read/unread */
  onNotificationUpdate?: (notificationId: string, isRead: boolean) => void;

  /** Callback when notification is deleted */
  onNotificationDelete?: (notificationId: string) => void;

  /** Callback when mark all as read is clicked */
  onMarkAllAsRead?: () => void;

  /** Whether to show filters */
  showFilters?: boolean;

  /** Whether to show pagination */
  showPagination?: boolean;

  /** Custom CSS class name */
  className?: string;
}

/**
 * Props for NotificationDetail component
 */
export interface NotificationDetailProps {
  /** Notification to display */
  notification: Notification | null;

  /** Whether detail view is open */
  isOpen: boolean;

  /** Loading state */
  loading?: boolean;

  /** Callback when close is clicked */
  onClose: () => void;

  /** Callback when notification is updated */
  onNotificationUpdate?: (notificationId: string, updates: UpdateNotificationRequest) => void;

  /** Callback when notification is deleted */
  onNotificationDelete?: (notificationId: string) => void;

  /** Custom CSS class name */
  className?: string;
}

/**
 * Props for NotificationPreferences component
 */
export interface NotificationPreferencesProps {
  /** Current notification preferences */
  preferences?: NotificationPreference | null;

  /** Loading state */
  loading?: boolean;

  /** Error message if loading failed */
  error?: string | null;

  /** Callback when preferences are updated */
  onPreferencesUpdate: (preferences: UpdateNotificationPreferencesRequest) => void;

  /** Callback when form is cancelled */
  onCancel?: () => void;

  /** Whether form is in edit mode */
  editMode?: boolean;

  /** Callback when edit mode is toggled */
  onEditModeToggle?: () => void;

  /** Custom CSS class name */
  className?: string;
}

/**
 * ============================================================================
 * FILTER AND SORT INTERFACES
 * ============================================================================
 */

/**
 * Filter options for notification list
 */
export interface NotificationFilters {
  /** Filter by notification type */
  type?: NotificationType;

  /** Filter by read status */
  isRead?: boolean;

  /** Filter by user ID */
  userId?: string;

  /** Search term for title/message */
  search?: string;
}

/**
 * Sort options for notification list
 */
export interface NotificationSort {
  /** Field to sort by */
  field: 'createdAt' | 'updatedAt' | 'title' | 'type';

  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * ============================================================================
 * HOOK RETURN TYPES
 * ============================================================================
 */

/**
 * Return type for useNotifications hook
 */
export interface UseNotificationsReturn {
  /** Array of notifications */
  notifications: Notification[];

  /** Loading state */
  loading: boolean;

  /** Error message */
  error: string | null;

  /** Pagination metadata */
  pagination: PaginationMeta | null;

  /** Refresh notifications */
  refresh: () => Promise<QueryObserverResult<NotificationListResponse, Error>>;

  /** Mark notification as read/unread */
  markAsRead: (notificationId: string, isRead: boolean) => Promise<void>;

  /** Delete notification */
  deleteNotification: (notificationId: string) => Promise<void>;

  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;

  /** Load more notifications */
  loadMore: () => void;
}

/**
 * Return type for useNotificationPreferences hook
 */
export interface UseNotificationPreferencesReturn {
  /** Current preferences */
  preferences: NotificationPreference | null;

  /** Loading state */
  loading: boolean;

  /** Error message */
  error: string | null;

  /** Update preferences */
  updatePreferences: (preferences: UpdateNotificationPreferencesRequest) => Promise<void>;

  /** Refresh preferences */
  refresh: () => Promise<void>;
}

/**
 * ============================================================================
 * UTILITY TYPES
 * ============================================================================
 */

/**
 * Notification type display configuration
 */
export interface NotificationTypeConfig {
  /** Display label */
  label: string;

  /** Icon name or component */
  icon: string;

  /** Color scheme */
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

  /** Description */
  description: string;
}

/**
 * Notification status indicator configuration
 */
export interface NotificationStatusConfig {
  /** Display label */
  label: string;

  /** Color for status indicator */
  color: string;

  /** Icon for status */
  icon: string;
}

/**
 * ============================================================================
 * ENUM EXTENSIONS
 * ============================================================================
 */

/**
 * Additional notification-related enum-like constants
 */
export const NotificationPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

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
 * TYPE GUARDS
 * ============================================================================
 */

/**
 * Type guard to check if a value is a valid NotificationType
 */
export function isValidNotificationType(value: any): value is NotificationType {
  return Object.values(NotificationType).includes(value);
}

/**
 * Type guard to check if a value is a valid notification
 */
export function isNotification(value: any): value is Notification {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.message === 'string' &&
    isValidNotificationType(value.type) &&
    typeof value.isRead === 'boolean' &&
    typeof value.createdAt === 'string'
  );
}

/**
 * ============================================================================
 * CONSTANTS
 * ============================================================================
 */

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  sort: 'createdAt',
  order: 'desc' as const
} as const;

/**
 * Notification type configurations
 */
export const NOTIFICATION_TYPE_CONFIGS: Record<NotificationType, NotificationTypeConfig> = {
  [NotificationType.EMAIL]: {
    label: 'Email',
    icon: 'email',
    color: 'primary',
    description: 'Email notifications'
  },
  [NotificationType.SMS]: {
    label: 'SMS',
    icon: 'sms',
    color: 'success',
    description: 'SMS notifications'
  },
  [NotificationType.PUSH]: {
    label: 'Push',
    icon: 'push',
    color: 'info',
    description: 'Push notifications'
  }
};

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreference, 'id' | 'userId'> = {
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  preferredTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

export {};