import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AutoLoginGuard from '../../guards/auto-login.guard';

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AutoLoginGuard', () => {
  const TestChild = () => <div>Login/Register Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading spinner when authentication is loading', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    // Act
    render(
      <MemoryRouter>
        <AutoLoginGuard>
          <TestChild />
        </AutoLoginGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('should render children when user is not authenticated', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    // Act
    render(
      <MemoryRouter>
        <AutoLoginGuard>
          <TestChild />
        </AutoLoginGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText('Login/Register Content')).toBeTruthy();
  });

  it('should redirect authenticated customer to customer dashboard', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'customer' },
    });

    // Act
    render(
      <MemoryRouter>
        <AutoLoginGuard>
          <TestChild />
        </AutoLoginGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.queryByText('Login/Register Content')).toBeNull();
  });

  it('should redirect authenticated service provider to provider dashboard', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'service_provider' },
    });

    // Act
    render(
      <MemoryRouter>
        <AutoLoginGuard>
          <TestChild />
        </AutoLoginGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.queryByText('Login/Register Content')).toBeNull();
  });

  it('should redirect authenticated admin to admin dashboard', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'tenant_admin' },
    });

    // Act
    render(
      <MemoryRouter>
        <AutoLoginGuard>
          <TestChild />
        </AutoLoginGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.queryByText('Login/Register Content')).toBeNull();
  });

  it('should use return path from location state if available', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'customer' },
    });

    // Act
    render(
      <MemoryRouter initialEntries={[{ pathname: '/auth/login', state: { from: { pathname: '/customer/bookings' } } }]}>
        <AutoLoginGuard>
          <TestChild />
        </AutoLoginGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.queryByText('Login/Register Content')).toBeNull();
  });
});