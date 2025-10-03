/**
 * Login Component Tests
 *
 * Comprehensive unit tests for the Login component covering authentication flows,
 * form validation, user interactions, and error handling scenarios.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../../components/auth/Login/Login';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
const mockLocation = {
  state: null as any,
  pathname: '/auth/login'
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Test wrapper with all necessary providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.state = null;
    mockLocation.pathname = '/auth/login';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render login form correctly', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Check main elements
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByText('Enter your email and password to access your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render remember me checkbox', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(rememberMeCheckbox).toBeInTheDocument();
      expect(rememberMeCheckbox).not.toBeChecked();
    });

    it('should render forgot password link', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
    });

    it('should render registration link', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      const registerLink = screen.getByRole('link', { name: /sign up here/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/auth/register');
    });

    it('should show demo credentials in development mode', () => {
      // Mock development environment
      vi.stubEnv('DEV', true);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByText('🔧 Development Demo Credentials')).toBeInTheDocument();
      expect(screen.getByText('demo@example.com')).toBeInTheDocument();
      expect(screen.getByText('demo123456')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty form submission', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    it('should clear errors when user starts typing', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Trigger validation errors
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      // Start typing to clear errors
      await user.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle email input changes', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should handle password input changes', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const passwordInput = screen.getByDisplayValue('');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should handle remember me checkbox', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();
    });

    it('should handle password visibility toggle', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const passwordInput = screen.getByDisplayValue('');

      // Initially should be password type
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click password visibility toggle (eye icon button)
      const toggleButton = screen.getByLabelText('Show password');
      await user.click(toggleButton);

      // Should change to text type when toggled
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Authentication Flow', () => {
    it('should handle successful login', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in valid credentials
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });

      // Should navigate to dashboard after successful login
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should handle login failure', async () => {
      // Mock login failure
      const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in credentials and submit
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Login failed. Please check your credentials and try again.')).toBeInTheDocument();
      });
    });

    it('should redirect to intended destination after login', async () => {
      // Set up return URL in location state
      mockLocation.state = { from: { pathname: '/customer/bookings' } };

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in valid credentials
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should navigate to intended destination
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/customer/bookings', { replace: true });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and descriptions', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');

      // Check ARIA attributes
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Tab through form elements
      await user.tab();

      // First element (email input) should be focused
      expect(screen.getByLabelText(/email address/i)).toHaveFocus();

      // Tab to password input
      await user.tab();
      expect(screen.getByDisplayValue('')).toHaveFocus();

      // Tab to remember me checkbox
      await user.tab();
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toHaveFocus();

      // Tab to submit button
      await user.tab();
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus();
    });

    it('should announce errors to screen readers', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Error messages should have proper ARIA attributes
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Loading States', () => {
    it('should disable form during submission', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

      // Fill in credentials
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Form elements should be disabled during submission
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(rememberMeCheckbox).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show loading spinner during authentication check', () => {
      // Mock loading state in AuthContext
      vi.doMock('../../../contexts/AuthContext', () => ({
        AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        useAuth: () => ({
          login: vi.fn(),
          isLoading: true,
          isAuthenticated: false,
          user: null,
          register: vi.fn(),
          logout: vi.fn(),
        }),
      }));

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Submit button should be disabled when auth is loading
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in credentials
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should handle and display error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should clear errors on successful retry', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First attempt with wrong credentials
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrong');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Clear error by typing in email field
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Component should render without layout issues
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // All interactive elements should be keyboard accessible
      await user.tab();
      expect(screen.getByLabelText(/email address/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByDisplayValue('')).toHaveFocus();
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission with invalid data', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Try to submit empty form
      await user.click(submitButton);

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle form submission with Enter key', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');

      // Fill in valid credentials
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Press Enter in password field
      await user.type(passwordInput, '{enter}');

      // Should trigger form submission
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Remember Me Functionality', () => {
    it('should handle remember me state changes', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

      // Initially unchecked
      expect(rememberMeCheckbox).not.toBeChecked();

      // Check the box
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();

      // Uncheck the box
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();
    });
  });

  describe('Navigation Integration', () => {
    it('should redirect after successful login', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByDisplayValue('');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in valid credentials
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should navigate to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should handle navigation state from location', () => {
      // Set up return URL
      mockLocation.state = { from: { pathname: '/protected-page' } };

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Component should handle the return URL state internally
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });
  });
});