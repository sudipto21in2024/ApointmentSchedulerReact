/**
 * ============================================================================
 * NOTIFICATION PREFERENCES INTEGRATION TESTS
 * ============================================================================
 * Integration tests for the `NotificationPreferences` component, focusing on
 * its interaction with the `useNotificationPreferences` hook and the mocked
 * `notificationApiService`.
 *
 * These tests simulate real-world scenarios to ensure that the component
 * correctly fetches, displays, and updates notification preferences via the
 * hook and API.
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
import { NotificationPreferences } from '../../components/notification/NotificationPreferences/NotificationPreferences';
import { notificationApiService } from '../../services/notification-api.service';
import type { NotificationPreference, UpdateNotificationPreferencesRequest } from '../../types/notification';
import toast from 'react-hot-toast';

// Mock the notificationApiService
vi.mock('../../services/notification-api.service', () => ({
  notificationApiService: {
    getNotificationPreferences: vi.fn(),
    updateNotificationPreferences: vi.fn(),
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

describe('NotificationPreferences Integration', () => {
  const mockNotificationPreference: NotificationPreference = {
    id: 'pref-1',
    userId: 'user-int-1',
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    preferredTimezone: 'Asia/Kolkata',
  };

  const mockOnPreferencesUpdate = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnEditModeToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockedNotificationApiService.getNotificationPreferences.mockResolvedValue(mockNotificationPreference);
    mockedNotificationApiService.updateNotificationPreferences.mockResolvedValue(mockNotificationPreference);
  });

  /**
   * Test: Initial render and data fetching
   */
  it('should fetch and display notification preferences on initial render', async () => {
    render(
      <NotificationPreferences
        onPreferencesUpdate={mockOnPreferencesUpdate}
        onCancel={mockOnCancel}
        onEditModeToggle={mockOnEditModeToggle}
      />,
      { wrapper }
    );

    expect(screen.getByText('Loading preferences...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedNotificationApiService.getNotificationPreferences).toHaveBeenCalledWith('some-hardcoded-user-id');
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Notifications')).toBeChecked();
      expect(screen.getByLabelText('SMS Notifications')).not.toBeChecked();
      expect(screen.getByLabelText('Push Notifications')).toBeChecked();
      expect(screen.queryByText('Loading preferences...')).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Edit mode and saving preferences
   */
  it('should allow editing and saving preferences', async () => {
    render(
      <NotificationPreferences
        onPreferencesUpdate={mockOnPreferencesUpdate}
        onCancel={mockOnCancel}
        onEditModeToggle={mockOnEditModeToggle}
        editMode={false}
      />,
      { wrapper }
    );

    await waitFor(() => expect(screen.getByText('Edit Preferences')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Edit Preferences'));

    expect(mockOnEditModeToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    const smsCheckbox = screen.getByLabelText('SMS Notifications');
    fireEvent.click(smsCheckbox); // Enable SMS

    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    const updatedPreferences: UpdateNotificationPreferencesRequest = {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      preferredTimezone: 'Asia/Kolkata',
    };

    await waitFor(() => {
      expect(mockedNotificationApiService.updateNotificationPreferences).toHaveBeenCalledWith(
        'some-hardcoded-user-id',
        updatedPreferences
      );
      expect(mockOnPreferencesUpdate).toHaveBeenCalledWith(updatedPreferences);
      expect(toast.success).toHaveBeenCalledWith('Notification preferences updated successfully!');
      expect(screen.queryByText('Save Preferences')).not.toBeInTheDocument();
      expect(screen.getByText('Edit Preferences')).toBeInTheDocument();
    });
  });

  /**
   * Test: Cancel editing preferences
   */
  it('should cancel editing and revert changes', async () => {
    render(
      <NotificationPreferences
        onPreferencesUpdate={mockOnPreferencesUpdate}
        onCancel={mockOnCancel}
        onEditModeToggle={mockOnEditModeToggle}
        editMode={true}
      />,
      { wrapper }
    );

    await waitFor(() => expect(screen.getByText('Save Preferences')).toBeInTheDocument());

    const smsCheckbox = screen.getByLabelText('SMS Notifications');
    fireEvent.click(smsCheckbox); // Enable SMS

    expect(smsCheckbox).toBeChecked();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(smsCheckbox).not.toBeChecked(); // Should revert to original state
      expect(screen.queryByText('Save Preferences')).not.toBeInTheDocument();
      expect(screen.getByText('Edit Preferences')).toBeInTheDocument();
    });
  });

  /**
   * Test: Error state during fetch
   */
  it('should display error message if fetching preferences fails', async () => {
    const errorMessage = 'Failed to load preferences';
    mockedNotificationApiService.getNotificationPreferences.mockRejectedValue(new Error(errorMessage));

    render(
      <NotificationPreferences
        onPreferencesUpdate={mockOnPreferencesUpdate}
        onCancel={mockOnCancel}
        onEditModeToggle={mockOnEditModeToggle}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to load preferences/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Error state during update
   */
  it('should display error message if updating preferences fails', async () => {
    const errorMessage = 'Failed to save preferences';
    mockedNotificationApiService.updateNotificationPreferences.mockRejectedValue(new Error(errorMessage));

    render(
      <NotificationPreferences
        onPreferencesUpdate={mockOnPreferencesUpdate}
        onCancel={mockOnCancel}
        onEditModeToggle={mockOnEditModeToggle}
        editMode={true}
      />,
      { wrapper }
    );

    await waitFor(() => expect(screen.getByText('Save Preferences')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Save Preferences'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Failed to save preferences: ${errorMessage}`);
    });
  });
});