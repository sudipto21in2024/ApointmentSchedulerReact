/**
 * ============================================================================
 * NOTIFICATION DETAIL COMPONENT UNIT TESTS
 * ============================================================================
 * Unit tests for the `NotificationDetail` component. These tests verify the
 * component's rendering of notification details, its interaction with the
 * `notificationApiService`, and the correct handling of user actions like
 * marking as read/unread and deletion.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * ============================================================================
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mocked } from 'vitest';
import { NotificationDetail } from '../../../../components/notification/NotificationDetail/NotificationDetail';
import { notificationApiService } from '../../../../services/notification-api.service';
import type { Notification } from '../../../../types/notification';
import { NotificationType } from '../../../../types/enums';
import toast from 'react-hot-toast';

// Mock the notificationApiService
vi.mock('../../../../services/notification-api.service', () => ({
  notificationApiService: {
    getNotificationById: vi.fn(),
    updateNotification: vi.fn(),
    deleteNotification: vi.fn(),
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

describe('NotificationDetail', () => {
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

  const mockOnClose = vi.fn();
  const mockOnNotificationUpdate = vi.fn();
  const mockOnNotificationDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockedNotificationApiService.getNotificationById.mockResolvedValue(mockNotification);
  });

  /**
   * Test suite for rendering states
   */
  it('should not render when isOpen is false', () => {
    render(
      <NotificationDetail
        notification={mockNotification}
        isOpen={false}
        onClose={mockOnClose}
      />,
      { wrapper }
    );
    expect(screen.queryByText('Booking Confirmed')).not.toBeInTheDocument();
  });

  it('should render notification details when isOpen is true', async () => {
    render(
      <NotificationDetail
        notification={mockNotification}
        isOpen={true}
        onClose={mockOnClose}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
      expect(screen.getByText(/Your booking for Service X has been confirmed./i)).toBeInTheDocument();
      expect(screen.getByText('📧 Email')).toBeInTheDocument();
      expect(screen.getByText('Unread')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockedNotificationApiService.getNotificationById.mockReturnValue(new Promise(() => {})); // Never resolve
    render(
      <NotificationDetail
        notification={mockNotification}
        isOpen={true}
        onClose={mockOnClose}
        loading={true}
      />,
      { wrapper }
    );
    expect(screen.getByText('Loading notification details...')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    mockedNotificationApiService.getNotificationById.mockRejectedValue(new Error('Failed to load'));
    render(
      <NotificationDetail
        notification={mockNotification}
        isOpen={true}
        onClose={mockOnClose}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to load/i)).toBeInTheDocument();
    });
  });

  /**
   * Test suite for user interactions
   */
  it('should call onClose when close button is clicked', async () => {
    render(
      <NotificationDetail
        notification={mockNotification}
        isOpen={true}
        onClose={mockOnClose}
      />,
      { wrapper }
    );

    await waitFor(() => expect(screen.getByText('Booking Confirmed')).toBeInTheDocument());

    const closeButton = screen.getByRole('button', { name: /close/i }); // Using accessible name
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onNotificationUpdate and update status when "Mark as Read" is clicked', async () => {
    mockedNotificationApiService.updateNotification.mockResolvedValue({ ...mockNotification, isRead: true });

    render(
      <NotificationDetail
        notification={mockNotification}
        isOpen={true}
        onClose={mockOnClose}
        onNotificationUpdate={mockOnNotificationUpdate}
      />,
      { wrapper }
    );

    await waitFor(() => expect(screen.getByText('Booking Confirmed')).toBeInTheDocument());

    const markAsReadButton = screen.getByRole('button', { name: /mark as read/i });
    fireEvent.click(markAsReadButton);

    await waitFor(() => expect(mockedNotificationApiService.updateNotification).toHaveBeenCalledWith('notif-1', { isRead: true }));
    expect(mockOnNotificationUpdate).toHaveBeenCalledWith('notif-1', { isRead: true });
    expect(toast.success).toHaveBeenCalledWith('Notification marked as read!');
    expect(screen.getByText('Read')).toBeInTheDocument();
  });

  it('should call onNotificationDelete when "Delete" button is clicked', async () => {
    mockedNotificationApiService.deleteNotification.mockResolvedValue(undefined);

    render(
      <NotificationDetail
        notification={mockNotification}
        isOpen={true}
        onClose={mockOnClose}
        onNotificationDelete={mockOnNotificationDelete}
      />,
      { wrapper }
    );

    await waitFor(() => expect(screen.getByText('Booking Confirmed')).toBeInTheDocument());

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(mockedNotificationApiService.deleteNotification).toHaveBeenCalledWith('notif-1'));
    expect(mockOnNotificationDelete).toHaveBeenCalledWith('notif-1');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Notification deleted successfully!');
  });
});