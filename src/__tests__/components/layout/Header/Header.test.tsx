import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from '../../../../components/layout/Header/Header';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

/**
 * Test suite for Header component
 * Tests rendering, authentication states, user interactions, and accessibility
 */
describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test authenticated user state rendering
   */
  describe('Authenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER'
        },
        logout: vi.fn(),
        isAuthenticated: true
      });
    });

    it('renders header with user information', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByText('Appointment Scheduler')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('renders notifications button', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const notificationsButton = screen.getByLabelText('Notifications');
      expect(notificationsButton).toBeInTheDocument();
    });

    it('handles logout correctly', async () => {
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: { firstName: 'John', lastName: 'Doe' },
        logout: mockLogout,
        isAuthenticated: true
      });

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('renders user avatar with initials', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      // Check for user initials in avatar
      const avatar = screen.getByText('J'); // First letter of firstName
      expect(avatar).toBeInTheDocument();
    });
  });

  /**
   * Test unauthenticated user state rendering
   */
  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: vi.fn(),
        isAuthenticated: false
      });
    });

    it('renders sign in and get started buttons', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    });

    it('renders navigation links correctly', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const signInLink = screen.getByText('Sign In');
      const getStartedLink = screen.getByText('Get Started');

      expect(signInLink.closest('a')).toHaveAttribute('href', '/auth/login');
      expect(getStartedLink.closest('a')).toHaveAttribute('href', '/auth/register');
    });
  });

  /**
   * Test accessibility features
   */
  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { firstName: 'John', lastName: 'Doe' },
        logout: vi.fn(),
        isAuthenticated: true
      });
    });

    it('has proper ARIA labels', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    it('has proper semantic HTML structure', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  /**
   * Test responsive design and mobile behavior
   */
  describe('Responsive Design', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { firstName: 'John', lastName: 'Doe' },
        logout: vi.fn(),
        isAuthenticated: true
      });
    });

    it('renders user name on larger screens', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      // This test would need responsive testing utilities
      // For now, we check that the element exists
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('applies correct CSS classes for responsive design', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });
  });

  /**
   * Test breadcrumb navigation
   */
  describe('Breadcrumb Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { firstName: 'John', lastName: 'Doe' },
        logout: vi.fn(),
        isAuthenticated: true
      });
    });

    it('renders breadcrumb navigation section', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const breadcrumbNav = screen.getByLabelText('Breadcrumb');
      expect(breadcrumbNav).toBeInTheDocument();
    });

    it('includes home link in breadcrumbs', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const homeLink = screen.getByText('Home');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  /**
   * Test error handling
   */
  describe('Error Handling', () => {
    it('handles logout errors gracefully', async () => {
      const mockLogout = vi.fn().mockRejectedValue(new Error('Logout failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAuth.mockReturnValue({
        user: { firstName: 'John', lastName: 'Doe' },
        logout: mockLogout,
        isAuthenticated: true
      });

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});