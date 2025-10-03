/**
 * PublicRoute Component Tests
 *
 * Unit tests for the PublicRoute component covering public access control,
 * authenticated user redirection, loading states, and navigation behaviors.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicRoute from '../../../components/auth/PublicRoute';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/public', state: { from: { pathname: '/dashboard' } } }),
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
  // Mock the useAuth hook
  vi.doMock('../../../contexts/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAuth: () => authState || {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
  }));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={children} />
      </Routes>
    </BrowserRouter>
  );
};

// Public test component
const PublicContent: React.FC = () => (
  <div data-testid="public-content">
    <h1>Public Page</h1>
    <p>This content is publicly accessible</p>
  </div>
);

describe('PublicRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated User', () => {
    it('should render public content for unauthenticated users', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should show public content
      expect(screen.getByTestId('public-content')).toBeInTheDocument();
      expect(screen.getByText('Public Page')).toBeInTheDocument();
      expect(screen.getByText('This content is publicly accessible')).toBeInTheDocument();
    });

    it('should not redirect unauthenticated users from public routes', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should not navigate away from public content
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByTestId('public-content')).toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    it('should redirect authenticated users to dashboard', () => {
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should redirect to dashboard, not show public content
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });

    it('should preserve return URL when redirecting authenticated users', () => {
      // Mock location with return path
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/public',
            state: { from: { pathname: '/special-page' } }
          }),
        };
      });

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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should redirect to the intended destination
      expect(mockNavigate).toHaveBeenCalledWith('/special-page', { replace: true });
    });

    it('should use default dashboard path when no return URL is specified', () => {
      // Mock location without return path
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/public',
            state: null
          }),
        };
      });

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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should redirect to default dashboard
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should show loading spinner, not redirect or render content
      expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not render public content during loading', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', name: 'User', role: 'customer' },
            isLoading: true,
          }}
        >
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should show loading, not public content or redirect
      expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Integration', () => {
    it('should redirect with replace to prevent back button issues', () => {
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should use replace navigation
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });

    it('should handle different public routes correctly', () => {
      // Mock different public route
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/about',
            state: { from: { pathname: '/admin/settings' } }
          }),
        };
      });

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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should redirect to the intended destination from about page
      expect(mockNavigate).toHaveBeenCalledWith('/admin/settings', { replace: true });
    });
  });

  describe('Component Integration', () => {
    it('should work with nested route structures', () => {
      const NestedContent: React.FC = () => (
        <div>
          <h1>Nested Public Route</h1>
          <PublicContent />
        </div>
      );

      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <PublicRoute>
            <NestedContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should render nested content for unauthenticated users
      expect(screen.getByText('Nested Public Route')).toBeInTheDocument();
      expect(screen.getByTestId('public-content')).toBeInTheDocument();
    });

    it('should handle multiple PublicRoute wrappers', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <PublicRoute>
            <PublicRoute>
              <PublicContent />
            </PublicRoute>
          </PublicRoute>
        </TestWrapper>
      );

      // Should render content for unauthenticated users
      expect(screen.getByTestId('public-content')).toBeInTheDocument();
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should redirect even with missing user object
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });

    it('should handle undefined location state', () => {
      // Mock location without state
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/public',
            state: undefined
          }),
        };
      });

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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should use default redirect path
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });
  });

  describe('Security', () => {
    it('should not render public content for authenticated users', () => {
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Public content should never be visible to authenticated users
      expect(screen.queryByText('Public Page')).not.toBeInTheDocument();
      expect(screen.queryByText('This content is publicly accessible')).not.toBeInTheDocument();
    });

    it('should always redirect authenticated users regardless of role', () => {
      const roles = ['customer', 'service_provider', 'tenant_admin', 'system_admin'];

      roles.forEach(role => {
        render(
          <TestWrapper
            authState={{
              isAuthenticated: true,
              user: {
                id: '1',
                email: 'user@example.com',
                name: 'User',
                role: role as any
              },
              isLoading: false,
            }}
          >
            <PublicRoute>
              <PublicContent />
            </PublicRoute>
          </TestWrapper>
        );

        // Should redirect for all authenticated roles
        expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
      });
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestComponent: React.FC = () => {
        renderSpy();
        return <PublicContent />;
      };

      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <PublicRoute>
            <TestComponent />
          </PublicRoute>
        </TestWrapper>
      );

      // Component should render exactly once (no unnecessary re-renders)
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should not interfere with screen reader navigation for public content', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Public content should be accessible
      expect(screen.getByRole('heading', { name: /public page/i })).toBeInTheDocument();
      expect(screen.getByText('This content is publicly accessible')).toBeInTheDocument();
    });

    it('should maintain focus management during redirects', () => {
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should redirect without focus issues
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed location state gracefully', () => {
      // Mock location with malformed state
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/public',
            state: { from: 'invalid-path' } // Invalid from structure
          }),
        };
      });

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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should use default redirect path when state is malformed
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });

    it('should handle missing location state properties', () => {
      // Mock location with incomplete state
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/public',
            state: {} // Missing from property
          }),
        };
      });

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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should use default redirect path when state is incomplete
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });
  });

  describe('User Experience', () => {
    it('should provide smooth transition for unauthenticated users', () => {
      render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should immediately show public content without delay
      expect(screen.getByTestId('public-content')).toBeInTheDocument();
      expect(screen.getByText('Public Page')).toBeInTheDocument();
    });

    it('should redirect authenticated users immediately', () => {
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should immediately redirect without showing public content
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });
  });

  describe('Browser History Management', () => {
    it('should use replace navigation to prevent back button issues', () => {
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should use replace to prevent adding entry to history
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });

    it('should handle browser back/forward navigation correctly', () => {
      // First render as unauthenticated
      const { rerender } = render(
        <TestWrapper
          authState={{
            isAuthenticated: false,
            user: null,
            isLoading: false,
          }}
        >
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      expect(screen.getByTestId('public-content')).toBeInTheDocument();

      // Simulate authentication state change
      rerender(
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
          <PublicRoute>
            <PublicContent />
          </PublicRoute>
        </TestWrapper>
      );

      // Should redirect when authentication state changes
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard', { replace: true });
    });
  });
});