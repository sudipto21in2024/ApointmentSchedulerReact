import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserList } from '../../components/user/user-list';
import { userApi } from '../../services/user-api.service';
import type { User } from '../../types/user';

// Mock the user API service
vi.mock('../../services/user-api.service', () => ({
  userApi: {
    getAllUsers: vi.fn()
  }
}));

const mockUserApi = userApi as any;

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    role: 'customer',
    status: 'active',
    timezone: 'UTC',
    language: 'en',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    fullName: 'Jane Smith',
    role: 'service_provider',
    status: 'active',
    timezone: 'UTC',
    language: 'en',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  }
];

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

describe('UserList Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integrates with user API service correctly', async () => {
    // Setup mock response
    const mockResponse = {
      users: mockUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1
    };

    mockUserApi.getAllUsers.mockResolvedValue(mockResponse);

    // Render component
    render(<UserList />, { wrapper: createWrapper() });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify API was called with correct parameters
    expect(mockUserApi.getAllUsers).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // Verify data is displayed correctly
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
  });

  it('handles API error responses gracefully', async () => {
    // Setup mock error with 4xx status to prevent retries
    const error = new Error('Network Error');
    (error as any).status = 404;
    mockUserApi.getAllUsers.mockRejectedValue(error);

    // Render component
    render(<UserList />, { wrapper: createWrapper() });

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load users. Please try again.')).toBeInTheDocument();
    });

    // Verify error handling UI is present
    expect(screen.getByText('Failed to load users. Please try again.')).toBeInTheDocument();
  });

  it('passes correct parameters to API for filtering and sorting', async () => {
    const mockResponse = {
      users: [mockUsers[0]], // Only John Doe matches filter
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1
    };

    mockUserApi.getAllUsers.mockResolvedValue(mockResponse);

    // Render component
    render(<UserList />, { wrapper: createWrapper() });

    // Wait for initial load
    await waitFor(() => {
      expect(mockUserApi.getAllUsers).toHaveBeenCalledTimes(1);
    });

    // Verify initial call parameters
    expect(mockUserApi.getAllUsers).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  });

  it('maintains data consistency between API response and UI display', async () => {
    const mockResponse = {
      users: mockUsers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1
    };

    mockUserApi.getAllUsers.mockResolvedValue(mockResponse);

    render(<UserList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify all user data is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();

    // Verify summary information
    expect(screen.getByText('Showing 2 of 2 users')).toBeInTheDocument();
  });
});