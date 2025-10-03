/**
 * ============================================================================
 * NOTIFICATION LIST INTEGRATION TESTS
 * ============================================================================
 * Integration tests for the `NotificationList` component, focusing on its
 * interaction with the `useNotifications` hook and the mocked
 * `notificationApiService`.
 *
 * These tests simulate real-world scenarios to ensure that the component
 * correctly fetches, displays, and updates notification data via the hook
 * and API.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * ============================================================================
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mocked } from 'vitest';
import { NotificationList } from '../../components/notification/NotificationList/NotificationList';
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
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockedNotificationApiService = notificationApiService as Mocked<typeof notificationApiService>;

describe('NotificationList Integration', () => {
  const mockNotifications: Notification[] = [
    {
      id: 'int-notif-1',
      userId: 'user-int-1',
      title: 'Integration Test Notification 1',
      message: 'This is an integration test message 1.',
      type: NotificationType.EMAIL,
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'int-notif-2',
      userId: 'user-int-1',
      title: 'Integration Test Notification 2',
      message: 'This is an integration test message 2.',
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
    queryClient.clear();
    mockedNotificationApiService.getNotifications.mockResolvedValue(mockResponse);
  });

  /**
   * Test: Initial render and data fetching
   */
  it('should fetch and display notifications on initial render', async () => {
    render(<NotificationList />, { wrapper });

    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedNotificationApiService.getNotifications).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Integration Test Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Integration Test Notification 2')).toBeInTheDocument();
      expect(screen.queryByText('Loading notifications...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('1 unread')).toBeInTheDocument();
  });

  /**
   * Test: Mark as Read functionality
   */
  it('should mark a notification as read and update the UI', async () => {
    mockedNotificationApiService.updateNotification.mockResolvedValue({ ...mockNotifications[0], isRead: true });

    render(<NotificationList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Integration Test Notification 1')).toBeInTheDocument();
    });

    const markAsReadButton = screen.getAllByRole('button', { name: /mark as read/i })[0];
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(mockedNotificationApiService.updateNotification).toHaveBeenCalledWith('int-notif-1', { isRead: true });
      expect(toast.success).toHaveBeenCalledWith('Notification marked as read!');
      expect(screen.queryByText('1 unread')).not.toBeInTheDocument(); // Both notifications are now read
      expect(screen.getByText('0 unread')).toBeInTheDocument(); // Adjusted for mock state
    });
  });

  /**
   * Test: Delete notification functionality
   */
  it('should delete a notification and remove it from the UI', async () => {
    mockedNotificationApiService.deleteNotification.mockResolvedValue(undefined);

    render(<NotificationList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Integration Test Notification 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button', { name: /delete notification/i })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockedNotificationApiService.deleteNotification).toHaveBeenCalledWith('int-notif-1');
      expect(toast.success).toHaveBeenCalledWith('Notification deleted successfully!');
      expect(screen.queryByText('Integration Test Notification 1')).not.toBeInTheDocument();
      expect(screen.getByText('Integration Test Notification 2')).toBeInTheDocument();
    });
  });

  /**
   * Test: Mark All as Read functionality
   */
  it('should mark all notifications as read and update the UI', async () => {
    mockedNotificationApiService.markAllAsRead.mockResolvedValue(undefined);

    render(<NotificationList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Integration Test Notification 1')).toBeInTheDocument();
      expect(screen.getByText('1 unread')).toBeInTheDocument();
    });

    const markAllReadButton = screen.getByRole('button', { name: /mark all read/i });
    fireEvent.click(markAllReadButton);

    await waitFor(() => {
      expect(mockedNotificationApiService.markAllAsRead).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith('All notifications marked as read!');
      expect(screen.queryByText('1 unread')).not.toBeInTheDocument();
      expect(screen.getByText('0 unread')).toBeInTheDocument();
    });
  });
});