import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RoleGuard from '../../guards/role.guard';

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('RoleGuard', () => {
  const TestChild = () => <div>Role Protected Content</div>;

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
        <RoleGuard requiredRoles={['admin']}>
          <TestChild />
        </RoleGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    // Act
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <RoleGuard requiredRoles={['admin']}>
          <TestChild />
        </RoleGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.queryByText('Role Protected Content')).toBeNull();
  });

  it('should redirect to unauthorized when user lacks required role', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'customer' },
    });

    // Act
    render(
      <MemoryRouter>
        <RoleGuard requiredRoles={['admin']}>
          <TestChild />
        </RoleGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.queryByText('Role Protected Content')).toBeNull();
  });

  it('should render children when user has required role', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'admin' },
    });

    // Act
    render(
      <MemoryRouter>
        <RoleGuard requiredRoles={['admin']}>
          <TestChild />
        </RoleGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText('Role Protected Content')).toBeTruthy();
  });

  it('should render children when user has one of multiple required roles', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: 'service_provider' },
    });

    // Act
    render(
      <MemoryRouter>
        <RoleGuard requiredRoles={['admin', 'service_provider']}>
          <TestChild />
        </RoleGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText('Role Protected Content')).toBeTruthy();
  });
});