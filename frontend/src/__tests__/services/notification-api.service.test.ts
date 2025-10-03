/**
 * ============================================================================
 * NOTIFICATION API SERVICE UNIT TESTS
 * ============================================================================
 * Unit tests for the `NotificationApiService`. These tests mock the underlying
 * `HttpClient` to isolate the service logic and verify its correct behavior
 * for fetching, updating, and managing notifications and preferences.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * ============================================================================
 */

import { notificationApiService } from '../../services/notification-api.service';
import { HttpClient } from '../../services/base-api.service';
import type {
  Notification,
  NotificationListResponse,
  NotificationPreference,
  UpdateNotificationRequest,
  UpdateNotificationPreferencesRequest,
  NotificationFilters,
  NotificationSort
} from '../../types/notification';
import { NotificationType } from '../../types/enums';

import { vi, type Mocked } from 'vitest'; // Import vi and Mocked as type-only import

// Mock the HttpClient to control API responses
vi.mock('../../services/base-api.service', () => ({
  HttpClient: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}));

const mockHttpClient = new HttpClient() as Mocked<HttpClient>; // Use Mocked from vitest

describe('NotificationApiService', () => {
  let service: typeof notificationApiService;

  beforeEach(async () => { // beforeEach can be async
    // Reset mocks before each test
    vi.clearAllMocks(); // Use vi.clearAllMocks
    // Re-instantiate the service to ensure a clean state
    const actualModule = await vi.importActual<typeof import('../../services/notification-api.service')>('../../services/notification-api.service');
    service = new actualModule.NotificationApiService();
  });

  const mockNotification: Notification = {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Booking Confirmed',
    message: 'Your booking for Service X has been confirmed.',
    type: NotificationType.EMAIL,
    isRead: false,
    createdAt: '2023-10-26T10:00:00Z',
    updatedAt: '2023-10-26T10:00:00Z',
  };

  const mockNotificationListResponse: NotificationListResponse = {
    data: [mockNotification],
    meta: {
      currentPage: 1,
      perPage: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  const mockNotificationPreference: NotificationPreference = {
    id: 'pref-1',
    userId: 'user-1',
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
  };

  /**
   * Test suite for getNotifications
   */
  describe('getNotifications', () => {
    it('should fetch notifications with default parameters', async () => {
      mockHttpClient.get.mockResolvedValue(mockNotificationListResponse);
      const result = await service.getNotifications();
      expect(mockHttpClient.get).toHaveBeenCalledWith('/notifications?page=1&pageSize=10');
      expect(result).toEqual(mockNotificationListResponse);
    });

    it('should fetch notifications with filters, sort, and pagination', async () => {
      mockHttpClient.get.mockResolvedValue(mockNotificationListResponse);
      const filters: NotificationFilters = { userId: 'user-1', isRead: false, type: NotificationType.PUSH };
      const sort: NotificationSort = { field: 'createdAt', direction: 'asc' };
      const pagination = { page: 2, pageSize: 5 };
      const result = await service.getNotifications(filters, sort, pagination);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/notifications?page=2&pageSize=5&sort=createdAt&order=asc&userId=user-1&isRead=false&type=Push'
      );
      expect(result).toEqual(mockNotificationListResponse);
    });

    it('should handle API errors', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network Error'));
      await expect(service.getNotifications()).rejects.toThrow('Network Error');
    });
  });

  /**
   * Test suite for getNotificationById
   */
  describe('getNotificationById', () => {
    it('should fetch a notification by ID', async () => {
      mockHttpClient.get.mockResolvedValue(mockNotification);
      const result = await service.getNotificationById('notif-1');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/notifications/notif-1');
      expect(result).toEqual(mockNotification);
    });

    it('should throw error for invalid notification ID', async () => {
      await expect(service.getNotificationById('invalid-id')).rejects.toThrow('Notification ID must be a valid UUID');
    });
  });

  /**
   * Test suite for createNotification
   */
  describe('createNotification', () => {
    it('should create a new notification', async () => {
      mockHttpClient.post.mockResolvedValue(mockNotification);
      const newNotification = {
        userId: 'user-1',
        title: 'New Notification',
        message: 'This is a new notification.',
        type: NotificationType.SMS,
      };
      const result = await service.createNotification(newNotification);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/notifications', newNotification);
      expect(result).toEqual(mockNotification);
    });

    it('should throw error for missing required fields', async () => {
      const invalidNotification = {
        userId: 'user-1',
        title: 'New Notification',
        message: 'This is a new notification.',
        type: undefined as any, // Missing type
      };
      await expect(service.createNotification(invalidNotification)).rejects.toThrow('Type is required');
    });
  });

  /**
   * Test suite for updateNotification
   */
  describe('updateNotification', () => {
    it('should update an existing notification', async () => {
      mockHttpClient.put.mockResolvedValue({ ...mockNotification, isRead: true });
      const updates: UpdateNotificationRequest = { isRead: true };
      const result = await service.updateNotification('notif-1', updates);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/notifications/notif-1', updates);
      expect(result).toEqual({ ...mockNotification, isRead: true });
    });

    it('should throw error for invalid notification ID', async () => {
      await expect(service.updateNotification('invalid-id', { isRead: true })).rejects.toThrow('Notification ID must be a valid UUID');
    });
  });

  /**
   * Test suite for deleteNotification
   */
  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);
      await service.deleteNotification('notif-1');
      expect(mockHttpClient.delete).toHaveBeenCalledWith('/notifications/notif-1');
    });

    it('should throw error for invalid notification ID', async () => {
      await expect(service.deleteNotification('invalid-id')).rejects.toThrow('Notification ID must be a valid UUID');
    });
  });

  /**
   * Test suite for markAllAsRead
   */
  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockHttpClient.put.mockResolvedValue(undefined);
      await service.markAllAsRead();
      expect(mockHttpClient.put).toHaveBeenCalledWith('/notifications/read-all', {});
    });

    it('should handle API errors', async () => {
      mockHttpClient.put.mockRejectedValue(new Error('API Error'));
      await expect(service.markAllAsRead()).rejects.toThrow('API Error');
    });
  });

  /**
   * Test suite for getNotificationPreferences
   */
  describe('getNotificationPreferences', () => {
    it('should fetch notification preferences for a user', async () => {
      mockHttpClient.get.mockResolvedValue(mockNotificationPreference);
      const result = await service.getNotificationPreferences('user-1');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/users/user-1/notification-preferences');
      expect(result).toEqual(mockNotificationPreference);
    });

    it('should throw error for invalid user ID', async () => {
      await expect(service.getNotificationPreferences('invalid-id')).rejects.toThrow('User ID must be a valid UUID');
    });
  });

  /**
   * Test suite for updateNotificationPreferences
   */
  describe('updateNotificationPreferences', () => {
    it('should update notification preferences for a user', async () => {
      mockHttpClient.put.mockResolvedValue({ ...mockNotificationPreference, smsEnabled: true });
      const updates: UpdateNotificationPreferencesRequest = {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
      };
      const result = await service.updateNotificationPreferences('user-1', updates);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/users/user-1/notification-preferences', updates);
      expect(result).toEqual({ ...mockNotificationPreference, smsEnabled: true });
    });

    it('should throw error for invalid user ID', async () => {
      const updates: UpdateNotificationPreferencesRequest = {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
      };
      await expect(service.updateNotificationPreferences('invalid-id', updates)).rejects.toThrow('User ID must be a valid UUID');
    });

    it('should throw error for missing required preference fields', async () => {
      const updates = {
        emailEnabled: true,
        smsEnabled: undefined as any, // Missing smsEnabled
        pushEnabled: true,
      };
      await expect(service.updateNotificationPreferences('user-1', updates)).rejects.toThrow('SMS enabled status is required');
    });
  });

  /**
   * Test suite for getUnreadCount
   */
  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          perPage: 1,
          total: 5,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
      const result = await service.getUnreadCount('user-1');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/notifications?page=1&pageSize=1&sort=createdAt&order=desc&userId=user-1&isRead=false'
      );
      expect(result).toBe(5);
    });
  });

  /**
   * Test suite for searchNotifications
   */
  describe('searchNotifications', () => {
    it('should search notifications by term and user ID', async () => {
      mockHttpClient.get.mockResolvedValue(mockNotificationListResponse);
      const result = await service.searchNotifications('test', 'user-1');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/notifications?page=1&pageSize=10&sort=createdAt&order=desc&search=test&userId=user-1'
      );
      expect(result).toEqual(mockNotificationListResponse);
    });
  });

  /**
   * Test suite for getNotificationsByType
   */
  describe('getNotificationsByType', () => {
    it('should get notifications by type and user ID', async () => {
      mockHttpClient.get.mockResolvedValue(mockNotificationListResponse);
      const result = await service.getNotificationsByType(NotificationType.EMAIL, 'user-1');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/notifications?page=1&pageSize=10&sort=createdAt&order=desc&type=Email&userId=user-1'
      );
      expect(result).toEqual(mockNotificationListResponse);
    });
  });

  /**
   * Test suite for markMultipleAsRead
   */
  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read', async () => {
      mockHttpClient.put.mockResolvedValue(undefined);
      await service.markMultipleAsRead(['notif-1', 'notif-2']);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/notifications/notif-1', { isRead: true });
      expect(mockHttpClient.put).toHaveBeenCalledWith('/notifications/notif-2', { isRead: true });
    });

    it('should throw error for empty notification IDs array', async () => {
      await expect(service.markMultipleAsRead([])).rejects.toThrow('Notification IDs array cannot be empty');
    });
  });

  /**
   * Test suite for deleteMultiple
   */
  describe('deleteMultiple', () => {
    it('should delete multiple notifications', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);
      await service.deleteMultiple(['notif-1', 'notif-2']);
      expect(mockHttpClient.delete).toHaveBeenCalledWith('/notifications/notif-1');
      expect(mockHttpClient.delete).toHaveBeenCalledWith('/notifications/notif-2');
    });

    it('should throw error for empty notification IDs array', async () => {
      await expect(service.deleteMultiple([])).rejects.toThrow('Notification IDs array cannot be empty');
    });
  });
});