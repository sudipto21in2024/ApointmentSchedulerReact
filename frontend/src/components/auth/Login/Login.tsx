import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui';
import { cn } from '../../../utils/cn';

/**
 * Interface for login form data structure
 */
interface LoginFormData {
  /** User's email address for authentication */
  email: string;
  /** User's password for authentication */
  password: string;
  /** Whether to remember the user's login session */
  rememberMe: boolean;
}

/**
 * Interface for login form validation errors
 */
interface LoginErrors {
  /** Email validation error message */
  email?: string;
  /** Password validation error message */
  password?: string;
  /** General form submission error message */
  general?: string;
}

/**
 * Login Component - Handles user authentication with email and password
 *
 * Features:
 * - Email and password validation
 * - Remember me functionality
 * - Loading states during authentication
 * - Error handling for invalid credentials
 * - Integration with AuthContext
 * - Responsive design
 * - Accessibility compliance
 * - Redirect handling after successful login
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Login />
 *
 * // With custom styling
 * <div className="custom-auth-container">
 *   <Login />
 * </div>
 * ```
 */
export const Login: React.FC = () => {
  // Get authentication context and navigation utilities
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state management
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Error state management
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the intended destination after login
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  /**
   * Validates the email format using HTML5 email validation pattern
   * @param email - Email string to validate
   * @returns Boolean indicating if email is valid
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validates the entire form before submission
   * @returns Boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles input field changes and clears related errors
   * @param field - The field name being updated
   * @returns Event handler function for input changes
   */
  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific and general errors when user starts typing
    if ((field === 'email' && errors.email) ||
        (field === 'password' && errors.password) ||
        errors.general) {
      setErrors(prev => ({
        ...prev,
        email: field === 'email' ? undefined : prev.email,
        password: field === 'password' ? undefined : prev.password,
        general: undefined,
      }));
    }
  };

  /**
   * Handles form submission with validation and API integration
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Attempt login through AuthContext
      await login(formData.email, formData.password);

      // Navigate to intended destination or default dashboard
      navigate(from, { replace: true });

    } catch (error) {
      // Handle authentication errors
      console.error('Login error:', error);

      setErrors({
        general: error instanceof Error
          ? error.message
          : 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles "Remember Me" checkbox changes
   * @param e - Checkbox change event
   */
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: e.target.checked,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General error message */}
              {errors.general && (
                <div
                  className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.general}
                </div>
              )}

              {/* Email input field */}
              <Input
                label="Email address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                errorMessage={errors.email}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
              />

              {/* Password input field */}
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                errorMessage={errors.password}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                showPasswordToggle
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="current-password"
              />

              {/* Remember me and forgot password row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleRememberMeChange}
                    className="h-4 w-4 text-primary-main focus:ring-primary-main border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/auth/forgot-password"
                    className="font-medium text-primary-main hover:text-primary-dark"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                loadingText="Signing in..."
                disabled={isLoading}
                className="mt-6"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Registration link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/auth/register"
                  className="font-medium text-primary-main hover:text-primary-dark"
                >
                  Sign up here
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials for development */}
        {import.meta.env.DEV && (
          <Card variant="outlined" className="bg-blue-50">
            <CardContent>
              <details className="text-sm">
                <summary className="font-medium text-blue-900 cursor-pointer">
                  🔧 Development Demo Credentials
                </summary>
                <div className="mt-2 space-y-1 text-blue-800">
                  <p><strong>Email:</strong> demo@example.com</p>
                  <p><strong>Password:</strong> demo123456</p>
                  <p className="text-xs text-blue-600 mt-2">
                    These credentials are for development testing only.
                  </p>
                </div>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

/**
 * Login component display name for debugging
 */
Login.displayName = 'Login';

export default Login;