/**
 * ============================================================================
 * USE NOTIFICATIONS HOOK UNIT TESTS
 * ============================================================================
 * Unit tests for the `useNotifications` custom React hook. These tests verify
 * the hook's functionality for fetching, caching, and updating notification
 * data using `@tanstack/react-query` and mocking the `NotificationApiService`.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * ============================================================================
 */

import React from 'react'; // Import React for JSX
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mocked } from 'vitest';
import { useNotifications } from '../../hooks/useNotifications';
import { notificationApiService } from '../../services/notification-api.service';
import type { Notification, NotificationListResponse } from '../../types/notification';
import { NotificationType } from '../../types/enums';
import toast from 'react-hot-toast';

// Mock the notificationApiService
vi.mock('../../services/notification-api.service', () => ({
  notificationApiService: {
    getNotifications: vi.fn(),
    updateNotification: vi.fn(),
    deleteNotification: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

// Cast the mocked service to Mocked type for better type inference
const mockedNotificationApiService = notificationApiService as Mocked<typeof notificationApiService>;

describe('useNotifications', () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Notification 1',
      message: 'Message 1',
      type: NotificationType.EMAIL,
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Notification 2',
      message: 'Message 2',
      type: NotificationType.PUSH,
      isRead: true,
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
  ];

  const mockResponse: NotificationListResponse = {
    data: mockNotifications,
    meta: {
      currentPage: 1,
      perPage: 10,
      total: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset queryClient cache before each test to ensure isolation
    queryClient.clear();
  });

  /**
   * Test suite for initial fetch and loading state
   */
  it('should fetch notifications and set loading state', async () => {
    mockedNotificationApiService.getNotifications.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.pagination).toEqual(mockResponse.meta);
    expect(mockedNotificationApiService.getNotifications).toHaveBeenCalledTimes(1);
  });

  /**
   * Test suite for error handling during fetch
   */
  it('should handle errors when fetching notifications', async () => {
    const errorMessage = 'Failed to fetch notifications';
    mockedNotificationApiService.getNotifications.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  /**
   * Test suite for markAsRead mutation
   */
  it('should mark a notification as read and update cache', async () => {
    mockedNotificationApiService.getNotifications.mockResolvedValue(mockResponse);
    mockedNotificationApiService.updateNotification.mockResolvedValue({ ...mockNotifications[0], isRead: true });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.markAsRead('1', true);

    expect(mockedNotificationApiService.updateNotification).toHaveBeenCalledWith('1', { isRead: true });
    expect(toast.success).toHaveBeenCalledWith('Notification marked as read!');
    expect(result.current.notifications[0].isRead).toBe(true);
  });

  /**
   * Test suite for deleteNotification mutation
   */
  it('should delete a notification and update cache', async () => {
    mockedNotificationApiService.getNotifications.mockResolvedValue(mockResponse);
    mockedNotificationApiService.deleteNotification.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.deleteNotification('1');

    expect(mockedNotificationApiService.deleteNotification).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith('Notification deleted successfully!');
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('2');
  });

  /**
   * Test suite for markAllAsRead mutation
   */
  it('should mark all notifications as read and update cache', async () => {
    mockedNotificationApiService.getNotifications.mockResolvedValue(mockResponse);
    mockedNotificationApiService.markAllAsRead.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.markAllAsRead();

    expect(mockedNotificationApiService.markAllAsRead).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('All notifications marked as read!');
    expect(result.current.notifications.every(n => n.isRead)).toBe(true);
  });

  /**
   * Test suite for refresh functionality
   */
  it('should refresh notifications', async () => {
    mockedNotificationApiService.getNotifications.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedNotificationApiService.getNotifications).toHaveBeenCalledTimes(1);

    await result.current.refresh();

    expect(mockedNotificationApiService.getNotifications).toHaveBeenCalledTimes(2);
  });

  /**
   * Test suite for pagination updates
   */
  it('should update pagination meta correctly', async () => {
    mockedNotificationApiService.getNotifications.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pagination?.currentPage).toBe(1);
    expect(result.current.pagination?.totalPages).toBe(1);
    expect(result.current.pagination?.total).toBe(2);
  });
});