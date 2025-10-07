import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { UserDetail } from '../../../components/user/user-detail';
import { useUser } from '../../../hooks/useUsers';
import { useAuth } from '../../../hooks/useAuth';
import type { User } from '../../../types/user';

// Mock the hooks
vi.mock('../../../hooks/useUsers');
vi.mock('../../../hooks/useAuth');

// Mock the UI components
vi.mock('../../../components/ui/Card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-testid={`button-${variant || 'default'}`}>
      {children}
    </button>
  )
}));

const mockUseUser = useUser as any;
const mockUseAuth = useAuth as any;

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

describe('UserDetail Component', () => {
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
  });

  it('renders loading state initially', () => {
    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading user details...')).toBeInTheDocument();
  });

  it('renders error state when API fails', () => {
    const mockError = new Error('Failed to fetch user');
    const mockRefetch = vi.fn();

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to load user details. Please try again.')).toBeInTheDocument();
    expect(screen.getByTestId('button-ghost')).toBeInTheDocument();
  });

  it('renders user not found when no data', () => {
    mockUseUser.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    expect(screen.getByText('User not found.')).toBeInTheDocument();
  });

  it('renders permission denied when user cannot view details', () => {
    // Mock current user as customer trying to view another customer's details
    mockUseAuth.mockReturnValue({
      user: { ...mockCurrentUser, role: 'customer', id: '999' },
      isAuthenticated: true
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    expect(screen.getByText("You don't have permission to view this user's details.")).toBeInTheDocument();
  });

  it('renders complete user details for authorized user', () => {
    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    // Check header information
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2); // Header and basic info
    expect(screen.getAllByText('Customer')).toHaveLength(2); // Header and basic info
    expect(screen.getAllByText('active')).toHaveLength(2); // Header and basic info

    // Check basic information section
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument(); // Email verified

    // Check contact information (should be visible for admin)
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('America/New_York')).toBeInTheDocument();

    // Check account information
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument(); // 2FA disabled
  });

  it('hides sensitive information for unauthorized users', () => {
    // Mock current user as customer trying to view another customer's details
    mockUseAuth.mockReturnValue({
      user: { ...mockCurrentUser, role: 'customer', id: '999' },
      isAuthenticated: true
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    // Should show permission denied message
    expect(screen.getByText("You don't have permission to view this user's details.")).toBeInTheDocument();

    // Should not show any user information
    expect(screen.queryByText('Basic Information')).not.toBeInTheDocument();
    expect(screen.queryByText('Contact Information')).not.toBeInTheDocument();
  });

  it('shows privacy notice when sensitive info is hidden', () => {
    // Mock current user as service provider viewing another service provider's details
    mockUseAuth.mockReturnValue({
      user: { ...mockCurrentUser, role: 'service_provider', id: '999' },
      isAuthenticated: true
    });

    // Change the viewed user to service_provider
    mockUseUser.mockReturnValue({
      data: { ...mockUser, role: 'service_provider' },
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    // Basic info should be visible
    expect(screen.getByText('Basic Information')).toBeInTheDocument();

    // Contact info should be hidden (sensitive)
    expect(screen.queryByText('Contact Information')).not.toBeInTheDocument();

    // Privacy notice should be shown
    expect(screen.getByText('Privacy Protected')).toBeInTheDocument();
    expect(screen.getByText('Some information is hidden to protect user privacy. Only authorized personnel can view sensitive details.')).toBeInTheDocument();
  });

  it('displays user avatar when available', () => {
    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    const avatar = screen.getByAltText("John Doe's avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('displays default avatar when no avatar provided', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined };
    mockUseUser.mockReturnValue({
      data: userWithoutAvatar,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    // Should show initials in avatar placeholder
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    // Check that dates are formatted (exact format depends on locale)
    expect(screen.getAllByText(/January 1, 2023/)).toHaveLength(1); // Created date
    expect(screen.getAllByText(/December 1, 2023/)).toHaveLength(2); // Last login and updated date
  });

  it('displays "Not provided" for missing optional fields', () => {
    const userWithMissingFields = {
      ...mockUser,
      phone: undefined,
      dateOfBirth: undefined
    };

    mockUseUser.mockReturnValue({
      data: userWithMissingFields,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    expect(screen.getAllByText('Not provided')).toHaveLength(2);
  });

  it('displays "Never" for users who have never logged in', () => {
    const userNeverLoggedIn = { ...mockUser, lastLoginAt: undefined };

    mockUseUser.mockReturnValue({
      data: userNeverLoggedIn,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const mockOnError = vi.fn();
    const mockError = new Error('API Error');

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn()
    });

    render(<UserDetail userId="1" onError={mockOnError} />, { wrapper: createWrapper() });

    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it('calls onSuccess callback when data loads successfully', () => {
    const mockOnSuccess = vi.fn();

    render(<UserDetail userId="1" onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });

    expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
  });

  it('handles retry button click', () => {
    const mockRefetch = vi.fn();
    const mockError = new Error('API Error');

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch
    });

    render(<UserDetail userId="1" />, { wrapper: createWrapper() });

    const retryButton = screen.getByTestId('button-ghost');
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<UserDetail userId="1" className="custom-class" />, { wrapper: createWrapper() });

    // The custom class should be applied to the root div
    const rootElement = document.querySelector('.space-y-6.custom-class');
    expect(rootElement).toBeInTheDocument();
  });

  it('displays correct role display names', () => {
    const roles = [
      { role: 'customer', display: 'Customer' },
      { role: 'service_provider', display: 'Service Provider' },
      { role: 'tenant_admin', display: 'Tenant Administrator' },
      { role: 'system_admin', display: 'System Administrator' }
    ];

    roles.forEach(({ role, display }) => {
      const userWithRole = { ...mockUser, role: role as User['role'] };
      mockUseUser.mockReturnValue({
        data: userWithRole,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      const { unmount } = render(<UserDetail userId="1" />, { wrapper: createWrapper() });

      expect(screen.getAllByText(display)).toHaveLength(2); // Header and basic info

      // Clean up for next iteration
      unmount();
    });
  });

  it('displays correct status badges', () => {
    const statuses = ['active', 'inactive', 'suspended', 'pending_verification'];

    statuses.forEach((status) => {
      const userWithStatus = { ...mockUser, status: status as User['status'] };
      mockUseUser.mockReturnValue({
        data: userWithStatus,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      const { unmount } = render(<UserDetail userId="1" />, { wrapper: createWrapper() });

      expect(screen.getAllByText(status.replace('_', ' '))).toHaveLength(2); // Header and basic info

      // Clean up for next iteration
      unmount();
    });
  });
});