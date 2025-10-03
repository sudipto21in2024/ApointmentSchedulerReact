/**
 * ============================================================================
 * NOTIFICATION LIST COMPONENT UNIT TESTS
 * ============================================================================
 * Unit tests for the `NotificationList` component. These tests verify the
 * component's rendering, interaction with the `useNotifications` hook,
 * and proper display of notifications, loading states, error states, and
 * pagination.
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
import { NotificationList } from '../../../../components/notification/NotificationList/NotificationList';
import { useNotifications } from '../../../../hooks/useNotifications';
import type { Notification, NotificationListResponse } from '../../../../types/notification';
import { NotificationType } from '../../../../types/enums';

// Mock the useNotifications hook
const mockUseNotifications = vi.fn();
vi.mock('../../../../hooks/useNotifications', () => ({
  useNotifications: mockUseNotifications,
}));

// Mock react-hot-toast (already mocked globally, but good to ensure)
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

describe('NotificationList', () => {
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'user-1',
      title: 'Booking Confirmed',
      message: 'Your booking for Service X has been confirmed.',
      type: NotificationType.EMAIL,
      isRead: false,
      createdAt: '2023-10-26T10:00:00Z',
      updatedAt: '2023-10-26T10:00:00Z',
    },
    {
      id: 'notif-2',
      userId: 'user-1',
      title: 'New Message',
      message: 'You have a new message from John Doe.',
      type: NotificationType.PUSH,
      isRead: true,
      createdAt: '2023-10-25T09:00:00Z',
      updatedAt: '2023-10-25T09:00:00Z',
    },
  ];

  const mockPagination = {
    currentPage: 1,
    perPage: 10,
    total: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockUseNotifications.mockReturnValue({ // This is now correctly typed as a mock function
      notifications: [],
      loading: false,
      error: null,
      pagination: mockPagination,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      loadMore: vi.fn(),
    });
  });

  /**
   * Test suite for rendering states
   */
  it('should render loading state initially', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      loading: true,
      error: null,
      pagination: mockPagination,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      loadMore: vi.fn(),
    });

    render(<NotificationList />, { wrapper });
    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: 'Failed to fetch notifications',
      pagination: mockPagination,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      loadMore: vi.fn(),
    });

    render(<NotificationList />, { wrapper });
    expect(screen.getByText(/Error: Failed to fetch notifications/i)).toBeInTheDocument();
  });

  it('should render empty state when no notifications', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      error: null,
      pagination: mockPagination,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      loadMore: vi.fn(),
    });

    render(<NotificationList />, { wrapper });
    expect(screen.getByText('No notifications found')).toBeInTheDocument();
  });

  it('should render notifications correctly', () => {
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      pagination: mockPagination,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      loadMore: vi.fn(),
    });

    render(<NotificationList />, { wrapper });

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('1 unread')).toBeInTheDocument(); // notif-1 is unread
    expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
    expect(screen.getByText('New Message')).toBeInTheDocument();
  });

  /**
   * Test suite for user interactions
   */
  it('should call markAllAsRead when "Mark All Read" button is clicked', async () => {
    const mockMarkAllAsRead = vi.fn();
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      pagination: mockPagination,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      markAllAsRead: mockMarkAllAsRead,
      loadMore: vi.fn(),
    });

    render(<NotificationList />, { wrapper });

    const markAllReadButton = screen.getByRole('button', { name: /mark all read/i });
    fireEvent.click(markAllReadButton);

    await waitFor(() => expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1));
  });

  it('should call markAsRead when mark button is clicked', async () => {
    const mockMarkAsRead = vi.fn();
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      pagination: mockPagination,
      refresh: vi.fn(),
      markAsRead: mockMarkAsRead,
      deleteNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      loadMore: vi.fn(),
    });

    render(<NotificationList />, { wrapper });

    const markButton = screen.getAllByRole('button', { name: /mark as read/i })[0]; // First unread notification
    fireEvent.click(markButton);

    await waitFor(() => expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1', true));
  });

  it('should call deleteNotification when delete button is clicked', async () => {
    const mockDeleteNotification = vi.fn();
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      pagination: mockPagination,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: mockDeleteNotification,
      markAllAsRead: vi.fn(),
      loadMore: vi.fn(),
    });

    render(<NotificationList />, { wrapper });

    const deleteButton = screen.getAllByRole('button', { name: /delete notification/i })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => expect(mockDeleteNotification).toHaveBeenCalledWith('notif-1'));
  });

  /**
   * Test suite for pagination
   */
  it('should call handlePageChange when pagination buttons are clicked', async () => {
    const mockHandlePageChange = vi.fn();
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      pagination: { ...mockPagination, totalPages: 2, currentPage: 1, hasNextPage: true },
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      loadMore: mockHandlePageChange, // Assuming loadMore handles page changes
    });

    render(<NotificationList />, { wrapper });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => expect(mockHandlePageChange).toHaveBeenCalledTimes(1));
  });
});