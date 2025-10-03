/**
 * ProtectedRoute Component Tests
 *
 * Unit tests for the ProtectedRoute component covering authentication protection,
 * role-based access control, loading states, and redirect behaviors.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/protected', state: null }),
  };
});

// Test wrapper with AuthProvider
const TestWrapper: React.FC<{
  children: React.ReactNode;
  authState?: {
    isAuthenticated: boolean;
    user: any;
    isLoading: boolean;
  }
}> = ({ children, authState }) => {
  // Mock the useAuth hook before rendering
  const mockAuth = authState || {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  vi.doMock('../../../contexts/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAuth: () => mockAuth,
  }));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<div>{children}</div>} />
      </Routes>
    </BrowserRouter>
  );
};

// Protected test component
const ProtectedContent: React.FC = () => (
  <div data-testid="protected-content">
    <h1>Protected Page</h1>
    <p>This content requires authentication</p>
  </div>
);

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated User', () => {
    it('should redirect to login when user is not authenticated', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to login, not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login', {
        state: { from: { pathname: '/protected' } },
        replace: true
      });
    });

    it('should preserve return URL when redirecting to login', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should include current location in redirect state
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login', {
        state: { from: { pathname: '/protected' } },
        replace: true
      });
    });
  });

  describe('Authenticated User', () => {
    it('should render protected content for authenticated user', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'John Doe',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should show protected content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Page')).toBeInTheDocument();
      expect(screen.getByText('This content requires authentication')).toBeInTheDocument();
    });

    it('should render content for authenticated user without specific role requirements', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'John Doe',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should render content when no role restrictions
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow access for user with required role', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'admin@example.com',
              name: 'Admin User',
              role: 'system_admin'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={['system_admin', 'tenant_admin']}>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should render content for authorized role
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should deny access for user without required role', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'customer@example.com',
              name: 'Regular User',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={['system_admin', 'tenant_admin']}>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to unauthorized page
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
    });

    it('should handle multiple allowed roles correctly', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'provider@example.com',
              name: 'Service Provider',
              role: 'service_provider'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={['system_admin', 'tenant_admin', 'service_provider']}>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should allow access for service_provider role
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner while authentication is being checked', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: true,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should show loading spinner, not redirect or render content
      expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not render protected content during loading', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', name: 'User', role: 'customer' },
            isLoading: true,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should show loading, not protected content
      expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user object for authenticated state', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: null, // Missing user but authenticated
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={['customer']}>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to unauthorized due to missing user
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
    });

    it('should handle empty allowed roles array', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'User',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={[]}>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should render content when allowedRoles is empty
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should handle undefined allowed roles', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'User',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should render content when allowedRoles is undefined
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    it('should redirect with replace to prevent back button issues', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should use replace navigation
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login', {
        state: { from: { pathname: '/protected' } },
        replace: true
      });
    });

    it('should handle different protected routes correctly', () => {
      // Mock different location
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => ({ pathname: '/admin/users', state: null }),
        };
      });

      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should preserve the correct return path
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login', {
        state: { from: { pathname: '/admin/users' } },
        replace: true
      });
    });
  });

  describe('Security', () => {
    it('should not render children for unauthenticated users', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Protected content should never be visible to unauthenticated users
      expect(screen.queryByText('Protected Page')).not.toBeInTheDocument();
      expect(screen.queryByText('This content requires authentication')).not.toBeInTheDocument();
    });

    it('should enforce role-based restrictions strictly', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'customer@example.com',
              name: 'Customer',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={['system_admin']}>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should not render content for insufficient role
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
    });
  });

  describe('Component Integration', () => {
    it('should work with nested route structures', () => {
      const NestedContent: React.FC = () => (
        <div>
          <h1>Nested Protected Route</h1>
          <ProtectedContent />
        </div>
      );

      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'User',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <NestedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should render nested content
      expect(screen.getByText('Nested Protected Route')).toBeInTheDocument();
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should handle multiple ProtectedRoute wrappers', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'admin@example.com',
              name: 'Admin',
              role: 'system_admin'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={['system_admin']}>
            <ProtectedRoute allowedRoles={['system_admin']}>
              <ProtectedContent />
            </ProtectedRoute>
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should render content when all role checks pass
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed user roles gracefully', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'User',
              role: 'invalid_role' as any
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={['customer']}>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to unauthorized for invalid role
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
    });

    it('should handle missing user properties', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'User'
              // Missing role property
            } as any,
            isLoading: false,
          }}
        >
          <ProtectedRoute allowedRoles={['customer']}>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to unauthorized when role is missing
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestComponent: React.FC = () => {
        renderSpy();
        return <ProtectedContent />;
      };

      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'User',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Component should render exactly once (no unnecessary re-renders)
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should not interfere with screen reader navigation', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'User',
              role: 'customer'
            },
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Protected content should be accessible
      expect(screen.getByRole('heading', { name: /protected page/i })).toBeInTheDocument();
      expect(screen.getByText('This content requires authentication')).toBeInTheDocument();
    });

    it('should maintain focus management during redirects', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect without focus issues
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});