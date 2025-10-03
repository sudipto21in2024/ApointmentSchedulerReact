/**
 * ============================================================================
 * NOTIFICATION API SERVICE
 * ============================================================================
 * Service for handling all notification-related API operations.
 *
 * This service provides methods for fetching, updating, and managing
 * notifications and notification preferences through REST API calls.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * ============================================================================
 */

import { HttpClient } from './base-api.service';
import type {
  Notification,
  NotificationPreference,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  UpdateNotificationPreferencesRequest,
  NotificationListResponse,
  NotificationFilters,
  NotificationSort
} from '../types/notification';
import { NotificationType } from '../types/enums';

/**
 * ============================================================================
 * NOTIFICATION API SERVICE CLASS
 * ============================================================================
 */
export class NotificationApiService extends HttpClient {
  /**
   * Base path for notification API endpoints
   */
  private readonly basePath = '/notifications';

  /**
   * User preferences endpoint path
   */
  private readonly preferencesPath = '/users/{userId}/notification-preferences';

  /**
   * ============================================================================
   * VALIDATION METHODS
   * ============================================================================
   */

  /**
   * Validate that a string is not empty or null
   */
  private validateRequired(value: any, fieldName: string): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`${fieldName} is required`);
    }
  }

  /**
   * Validate UUID format
   */
  private validateUuid(uuid: string, fieldName: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      throw new Error(`${fieldName} must be a valid UUID`);
    }
  }

  /**
   * ============================================================================
   * NOTIFICATION CRUD OPERATIONS
   * ============================================================================
   */

  /**
   * Get paginated list of notifications with optional filtering and sorting
   */
  async getNotifications(
    filters?: NotificationFilters,
    sort?: NotificationSort,
    pagination?: { page: number; pageSize: number }
  ): Promise<NotificationListResponse> {
    try {
      const params = new URLSearchParams();

      // Add pagination parameters
      const pageConfig = pagination || { page: 1, pageSize: 10 };
      params.append('page', pageConfig.page.toString());
      params.append('pageSize', pageConfig.pageSize.toString());

      // Add sorting parameters
      if (sort) {
        params.append('sort', sort.field);
        params.append('order', sort.direction);
      }

      // Add filter parameters
      if (filters) {
        if (filters.userId) {
          params.append('userId', filters.userId);
        }
        if (filters.type) {
          params.append('type', filters.type);
        }
        if (filters.isRead !== undefined) {
          params.append('isRead', filters.isRead.toString());
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
      }

      const queryString = params.toString();
      const url = `${this.basePath}${queryString ? `?${queryString}` : ''}`;

      return await this.get<NotificationListResponse>(url);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Get a specific notification by ID
   */
  async getNotificationById(notificationId: string): Promise<Notification> {
    try {
      this.validateUuid(notificationId, 'Notification ID');

      const response = await this.get<Notification>(`${this.basePath}/${notificationId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch notification:', error);
      throw error;
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    try {
      this.validateRequired(notificationData.userId, 'User ID');
      this.validateRequired(notificationData.title, 'Title');
      this.validateRequired(notificationData.message, 'Message');
      this.validateRequired(notificationData.type, 'Type');

      return await this.post<Notification>(this.basePath, notificationData);
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Update an existing notification
   */
  async updateNotification(
    notificationId: string,
    updates: UpdateNotificationRequest
  ): Promise<Notification> {
    try {
      this.validateUuid(notificationId, 'Notification ID');

      return await this.put<Notification>(
        `${this.basePath}/${notificationId}`,
        updates
      );
    } catch (error) {
      console.error('Failed to update notification:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      this.validateUuid(notificationId, 'Notification ID');

      await this.delete(`${this.basePath}/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<void> {
    try {
      await this.put(`${this.basePath}/read-all`, {});
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * NOTIFICATION PREFERENCES OPERATIONS
   * ============================================================================
   */

  /**
   * Get notification preferences for a specific user
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreference> {
    try {
      this.validateUuid(userId, 'User ID');

      const path = this.preferencesPath.replace('{userId}', userId);
      return await this.get<NotificationPreference>(path);
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences for a specific user
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreference> {
    try {
      this.validateUuid(userId, 'User ID');
      this.validateRequired(preferences.emailEnabled, 'Email enabled status');
      this.validateRequired(preferences.smsEnabled, 'SMS enabled status');
      this.validateRequired(preferences.pushEnabled, 'Push enabled status');

      const path = this.preferencesPath.replace('{userId}', userId);
      return await this.put<NotificationPreference>(path, preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * UTILITY METHODS
   * ============================================================================
   */

  /**
   * Get unread notifications count for the current user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      this.validateUuid(userId, 'User ID');

      const response = await this.getNotifications(
        { userId, isRead: false },
        { field: 'createdAt', direction: 'desc' },
        { page: 1, pageSize: 1 }
      );

      return response.meta.total;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      throw error;
    }
  }

  /**
   * Search notifications by title or message content
   */
  async searchNotifications(
    searchTerm: string,
    userId?: string,
    pagination?: { page: number; pageSize: number }
  ): Promise<NotificationListResponse> {
    try {
      this.validateRequired(searchTerm, 'Search term');

      const filters: NotificationFilters = {
        search: searchTerm,
        ...(userId && { userId })
      };

      return await this.getNotifications(
        filters,
        { field: 'createdAt', direction: 'desc' },
        pagination
      );
    } catch (error) {
      console.error('Failed to search notifications:', error);
      throw error;
    }
  }

  /**
   * Get notifications by type for the current user
   */
  async getNotificationsByType(
    type: NotificationType, // Changed type to NotificationType
    userId: string,
    pagination?: { page: number; pageSize: number }
  ): Promise<NotificationListResponse> {
    try {
      this.validateRequired(type, 'Notification type');
      this.validateUuid(userId, 'User ID');

      // Ensure the type is a valid NotificationType before passing to filters
      // This is important as NotificationFilters expects a specific enum value
      const filters: NotificationFilters = {
        type: type,
        userId: userId
      };

      return await this.getNotifications(
        filters,
        { field: 'createdAt', direction: 'desc' },
        pagination
      );
    } catch (error) {
      console.error('Failed to get notifications by type:', error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * BATCH OPERATIONS
   * ============================================================================
   */

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      this.validateRequired(notificationIds, 'Notification IDs');
      if (notificationIds.length === 0) {
        throw new Error('Notification IDs array cannot be empty');
      }

      // Update notifications one by one (could be optimized with batch endpoint)
      const updatePromises = notificationIds.map(id =>
        this.updateNotification(id, { isRead: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Failed to mark multiple notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(notificationIds: string[]): Promise<void> {
    try {
      this.validateRequired(notificationIds, 'Notification IDs');
      if (notificationIds.length === 0) {
        throw new Error('Notification IDs array cannot be empty');
      }

      // Delete notifications one by one (could be optimized with batch endpoint)
      const deletePromises = notificationIds.map(id =>
        this.deleteNotification(id)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Failed to delete multiple notifications:', error);
      throw error;
    }
  }
}

/**
 * ============================================================================
 * SINGLETON INSTANCE
 * ============================================================================
 */

/**
 * Default instance of the notification API service
 * Use this instance for all notification API operations
 */
export const notificationApiService = new NotificationApiService();

/**
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 *
 * Basic usage:
 * ```typescript
 * import { notificationApiService } from './services/notification-api.service';
 *
 * // Get notifications
 * const notifications = await notificationApiService.getNotifications();
 *
 * // Mark as read
 * await notificationApiService.updateNotification('id', { isRead: true });
 *
 * // Update preferences
 * await notificationApiService.updateNotificationPreferences('userId', {
 *   emailEnabled: true,
 *   smsEnabled: false,
 *   pushEnabled: true
 * });
 * ```
 *
 * With error handling:
 * ```typescript
 * try {
 *   const notifications = await notificationApiService.getNotifications();
 *   console.log('Notifications:', notifications.data);
 * } catch (error) {
 *   console.error('Failed to fetch notifications:', error.message);
 * }
 * ```
 *
 * ============================================================================
 */