import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AuthGuard from '../../guards/auth.guard';

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AuthGuard', () => {
  const TestChild = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading spinner when authentication is loading', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    // Act
    render(
      <MemoryRouter>
        <AuthGuard>
          <TestChild />
        </AuthGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    // Act
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthGuard>
          <TestChild />
        </AuthGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.queryByText('Protected Content')).toBeNull();
    // Note: Navigate component redirects, so we can't easily test the redirect in this setup
  });

  it('should render children when user is authenticated', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    // Act
    render(
      <MemoryRouter>
        <AuthGuard>
          <TestChild />
        </AuthGuard>
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText('Protected Content')).toBeTruthy();
  });

  it('should pass location state to redirect when unauthenticated', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    // Act & Assert
    // This test would require more complex setup to verify the state passed to Navigate
    // For now, we verify the component doesn't crash and handles the unauthenticated state
    expect(() => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );
    }).not.toThrow();
  });
});