import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui';

/**
 * Interface for password reset form data structure
 */
interface PasswordResetFormData {
  /** User's email address for password reset */
  email: string;
}

/**
 * Interface for password reset form validation errors
 */
interface PasswordResetErrors {
  /** Email validation error message */
  email?: string;
  /** General form submission error message */
  general?: string;
}

/**
 * PasswordReset Component - Handles password reset requests via email
 *
 * Features:
 * - Email validation for password reset requests
 * - Loading states during submission
 * - Success confirmation after email sent
 * - Error handling for invalid emails or server errors
 * - Responsive design and accessibility
 * - Integration with password reset API endpoint
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PasswordReset />
 *
 * // With custom success callback
 * <PasswordReset onSuccess={() => console.log('Reset email sent')} />
 * ```
 */
export const PasswordReset: React.FC = () => {
  // Form state management
  const [formData, setFormData] = useState<PasswordResetFormData>({
    email: '',
  });

  // Error state management
  const [errors, setErrors] = useState<PasswordResetErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state management
  const [isEmailSent, setIsEmailSent] = useState(false);

  /**
   * Validates email format using HTML5 email validation pattern
   * @param email - Email string to validate
   * @returns Boolean indicating if email is valid
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validates the form before submission
   * @returns Boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: PasswordResetErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles input field changes and clears related errors
   * @param field - The field name being updated
   * @returns Event handler function for input changes
   */
  const handleInputChange = (field: keyof PasswordResetFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific and general errors when user starts typing
    if (errors[field] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
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
      // Mock API call - replace with actual password reset API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      // Show success state
      setIsEmailSent(true);

    } catch (error) {
      // Handle password reset errors
      console.error('Password reset error:', error);

      setErrors({
        general: error instanceof Error
          ? error.message
          : 'Failed to send reset email. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles "Try Again" action to reset the form
   */
  const handleTryAgain = () => {
    setIsEmailSent(false);
    setFormData({ email: '' });
    setErrors({});
  };

  // Show success state if email was sent
  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to{' '}
                <span className="font-medium text-gray-900">
                  {formData.email}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 text-center">
                <p className="mb-4">
                  Click the link in the email to reset your password. If you don't see the email,
                  check your spam folder.
                </p>

                <div className="space-y-2">
                  <p className="font-medium">Didn't receive the email?</p>
                  <Button
                    variant="ghost"
                    onClick={handleTryAgain}
                    className="text-sm"
                  >
                    Try again with a different email
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Link
                  to="/auth/login"
                  className="text-sm text-primary-main hover:text-primary-dark font-medium"
                >
                  ← Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Reset your password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password
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
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : 'email-help'}
              />

              {/* Help text */}
              <p id="email-help" className="text-sm text-gray-600">
                Enter the email address associated with your account
              </p>

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                loadingText="Sending reset email..."
                disabled={isSubmitting}
                className="mt-6"
              >
                {isSubmitting ? 'Sending reset email...' : 'Send reset email'}
              </Button>
            </form>

            {/* Back to login link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/auth/login"
                  className="font-medium text-primary-main hover:text-primary-dark"
                >
                  Sign in here
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Additional help */}
        <Card variant="outlined" className="bg-blue-50">
          <CardContent>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Need help?</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email address</li>
                <li>• The reset link expires in 1 hour</li>
                <li>• Contact support if you continue having issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * PasswordReset component display name for debugging
 */
PasswordReset.displayName = 'PasswordReset';

export default PasswordReset;