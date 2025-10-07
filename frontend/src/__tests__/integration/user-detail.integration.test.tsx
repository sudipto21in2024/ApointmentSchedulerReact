import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserDetail } from '../../components/user/user-detail';
import { useUser } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../services/user-api.service';
import type { User } from '../../types/user';

// Mock the hooks
vi.mock('../../hooks/useUsers');
vi.mock('../../hooks/useAuth');

// Mock the user API service
vi.mock('../../services/user-api.service', () => ({
  userApi: {
    getUser: vi.fn()
  }
}));

const mockUseUser = useUser as any;
const mockUseAuth = useAuth as any;
const mockUserApi = userApi as any;

const mockUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  role: 'customer',
  status: 'active',
  phone: '+1234567890',
  dateOfBirth: '1990-01-01',
  timezone: 'America/New_York',
  language: 'en',
  avatar: 'https://example.com/avatar.jpg',
  emailVerified: true,
  twoFactorEnabled: false,
  lastLoginAt: '2023-12-01T10:00:00Z',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-12-01T10:00:00Z'
};

const mockCurrentUser: User = {
  id: '2',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  fullName: 'Admin User',
  role: 'system_admin',
  status: 'active',
  timezone: 'UTC',
  language: 'en',
  emailVerified: true,
  twoFactorEnabled: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('UserDetail Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockUseUser.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    mockUseAuth.mockReturnValue({
      user: mockCurrentUser,
      isAuthenticated: true
    });

    mockUserApi.getUser.mockResolvedValue(mockUser);
  });

  it('integrates with useUser hook and userApi correctly', async () => {
    // Render component
    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify useUser hook was called with correct userId
    expect(mockUseUser).toHaveBeenCalledWith('1');

    // Verify userApi.getUser was called (through the hook)
    // Note: The actual API call happens inside the useUser hook
    expect(mockUserApi.getUser).not.toHaveBeenCalled(); // Since we're mocking the hook

    // Verify data is displayed correctly
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2);
    expect(screen.getAllByText('Customer')).toHaveLength(2);
    expect(screen.getAllByText('active')).toHaveLength(2);
  });

  it('handles API error responses through useUser hook gracefully', async () => {
    const mockError = new Error('User not found');
    (mockError as any).status = 404;

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn()
    });

    // Render component
    render(<UserDetail userId="999" />, { wrapper: createWrapper() });

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load user details. Please try again.')).toBeInTheDocument();
    });

    // Verify error handling UI is present
    expect(screen.getByText('Failed to load user details. Please try again.')).toBeInTheDocument();
  });

  it('integrates with useAuth hook for privacy controls', async () => {
    // Test with service provider viewing customer (should see sensitive info)
    mockUseAuth.mockReturnValue({
      user: { ...mockCurrentUser, role: 'service_provider' },
      isAuthenticated: true
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should show contact information (sensitive info allowed)
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  it('respects privacy controls for unauthorized access', async () => {
    // Test with customer trying to view another customer's details
    mockUseAuth.mockReturnValue({
      user: { ...mockCurrentUser, role: 'customer', id: '999' },
      isAuthenticated: true
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    // Should show permission denied message
    expect(screen.getByText("You don't have permission to view this user's details.")).toBeInTheDocument();

    // Should not show any user information
    expect(screen.queryByText('Basic Information')).not.toBeInTheDocument();
  });

  it('handles loading states during data fetch', async () => {
    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    // Should show loading state
    expect(screen.getByText('Loading user details...')).toBeInTheDocument();
  });

  it('maintains data consistency between hook response and UI display', async () => {
    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify all user data sections are displayed
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Account Information')).toBeInTheDocument();

    // Verify specific data points
    expect(screen.getByText('John')).toBeInTheDocument(); // Basic info
    expect(screen.getByText('Doe')).toBeInTheDocument(); // Basic info
    expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2); // Header and basic info
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('America/New_York')).toBeInTheDocument();
  });

  it('handles callback functions correctly', async () => {
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    render(<UserDetail userId="1" onSuccess={mockOnSuccess} onError={mockOnError} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify onSuccess was called with user data
    expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('handles error callback when API fails', async () => {
    const mockError = new Error('API Error');
    const mockOnError = vi.fn();

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" onError={mockOnError} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Failed to load user details. Please try again.')).toBeInTheDocument();
    });

    // Verify onError was called with the error
    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it('integrates retry functionality with useUser hook', async () => {
    const mockRefetch = vi.fn();
    const mockError = new Error('Network Error');

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Failed to load user details. Please try again.')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    retryButton.click();

    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('passes userId parameter correctly to useUser hook', async () => {
    const testUserId = 'test-user-123';

    render(<UserDetail userId={testUserId} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify useUser was called with the correct userId
    expect(mockUseUser).toHaveBeenCalledWith(testUserId);
  });
});