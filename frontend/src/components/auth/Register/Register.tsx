import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui';
import { cn } from '../../../utils/cn';

/**
 * Interface for registration form data structure
 */
interface RegisterFormData {
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** User's role in the system */
  role: 'customer' | 'service_provider';
  /** Whether user agrees to terms and conditions */
  agreeToTerms: boolean;
  /** Whether user agrees to receive marketing communications */
  agreeToMarketing?: boolean;
}

/**
 * Interface for registration form validation errors
 */
interface RegisterErrors {
  /** First name validation error */
  firstName?: string;
  /** Last name validation error */
  lastName?: string;
  /** Email validation error */
  email?: string;
  /** Password validation error */
  password?: string;
  /** Password confirmation validation error */
  confirmPassword?: string;
  /** Role selection validation error */
  role?: string;
  /** Terms agreement validation error */
  agreeToTerms?: string;
  /** General form submission error */
  general?: string;
}

/**
 * Register Component - Handles user registration with form validation
 *
 * Features:
 * - Multi-field registration form with validation
 * - Password strength requirements
 * - Role selection (customer/service provider)
 * - Terms and conditions agreement
 * - Real-time form validation
 * - Loading states during registration
 * - Error handling for registration failures
 * - Integration with AuthContext
 * - Responsive design and accessibility
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Register />
 *
 * // With custom redirect
 * <Register redirectTo="/dashboard" />
 * ```
 */
export const Register: React.FC = () => {
  // Get authentication context and navigation utilities
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Form state management
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    agreeToTerms: false,
    agreeToMarketing: false,
  });

  // Error state management
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
   * Validates password strength requirements
   * @param password - Password string to validate
   * @returns Boolean indicating if password meets requirements
   */
  const isValidPassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  /**
   * Validates the entire form before submission
   * @returns Boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: RegisterErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles input field changes and clears related errors
   * @param field - The field name being updated
   * @returns Event handler function for input changes
   */
  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific and general errors when user starts typing
    if ((field === 'firstName' && errors.firstName) ||
        (field === 'lastName' && errors.lastName) ||
        (field === 'email' && errors.email) ||
        (field === 'password' && errors.password) ||
        (field === 'confirmPassword' && errors.confirmPassword) ||
        (field === 'role' && errors.role) ||
        (field === 'agreeToTerms' && errors.agreeToTerms) ||
        errors.general) {
      setErrors(prev => ({
        ...prev,
        firstName: field === 'firstName' ? undefined : prev.firstName,
        lastName: field === 'lastName' ? undefined : prev.lastName,
        email: field === 'email' ? undefined : prev.email,
        password: field === 'password' ? undefined : prev.password,
        confirmPassword: field === 'confirmPassword' ? undefined : prev.confirmPassword,
        role: field === 'role' ? undefined : prev.role,
        agreeToTerms: field === 'agreeToTerms' ? undefined : prev.agreeToTerms,
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
      // Combine first and last name for AuthContext
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      // Attempt registration through AuthContext
      await register(formData.email, formData.password, fullName, formData.role);

      // Navigate to appropriate dashboard based on role
      const redirectPath = formData.role === 'service_provider'
        ? '/provider/dashboard'
        : '/customer/dashboard';

      navigate(redirectPath, { replace: true });

    } catch (error) {
      // Handle registration errors
      console.error('Registration error:', error);

      setErrors({
        general: error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Gets password strength indicator information
   * @param password - Password to analyze
   * @returns Object with strength level and feedback
   */
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) {
      return { level: 0, label: '', color: '' };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: 'text-red-600' };
    if (score <= 3) return { level: 2, label: 'Fair', color: 'text-yellow-600' };
    if (score <= 4) return { level: 3, label: 'Good', color: 'text-blue-600' };
    return { level: 4, label: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Create your account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to create a new account
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

              {/* Name fields row */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  errorMessage={errors.firstName}
                  placeholder="John"
                  required
                  disabled={isSubmitting}
                  autoComplete="given-name"
                />

                <Input
                  label="Last name"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  errorMessage={errors.lastName}
                  placeholder="Doe"
                  required
                  disabled={isSubmitting}
                  autoComplete="family-name"
                />
              </div>

              {/* Email input field */}
              <Input
                label="Email address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                errorMessage={errors.email}
                placeholder="john.doe@example.com"
                required
                disabled={isSubmitting}
                autoComplete="email"
              />

              {/* Role selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  I am a *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={formData.role === 'customer'}
                      onChange={handleInputChange('role')}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all",
                      formData.role === 'customer'
                        ? "border-primary-main bg-primary-light text-primary-dark"
                        : "border-gray-300 hover:border-gray-400"
                    )}>
                      <div className="font-medium">Customer</div>
                      <div className="text-sm text-gray-600">
                        Looking for services
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="service_provider"
                      checked={formData.role === 'service_provider'}
                      onChange={handleInputChange('role')}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all",
                      formData.role === 'service_provider'
                        ? "border-primary-main bg-primary-light text-primary-dark"
                        : "border-gray-300 hover:border-gray-400"
                    )}>
                      <div className="font-medium">Service Provider</div>
                      <div className="text-sm text-gray-600">
                        Offering services
                      </div>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Password input field */}
              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  errorMessage={errors.password}
                  placeholder="Create a strong password"
                  required
                  disabled={isSubmitting}
                  showPasswordToggle
                  autoComplete="new-password"
                />

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={cn("font-medium", passwordStrength.color)}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          passwordStrength.level === 1 && "w-1/4 bg-red-500",
                          passwordStrength.level === 2 && "w-2/4 bg-yellow-500",
                          passwordStrength.level === 3 && "w-3/4 bg-blue-500",
                          passwordStrength.level === 4 && "w-full bg-green-500"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password input field */}
              <Input
                label="Confirm password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                errorMessage={errors.confirmPassword}
                placeholder="Confirm your password"
                required
                disabled={isSubmitting}
                showPasswordToggle
                autoComplete="new-password"
              />

              {/* Terms and conditions */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange('agreeToTerms')}
                    className="h-4 w-4 text-primary-main focus:ring-primary-main border-gray-300 rounded mt-1"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-primary-main hover:text-primary-dark"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link
                      to="/privacy"
                      className="text-primary-main hover:text-primary-dark"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    *
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.agreeToTerms}
                  </p>
                )}

                <div className="flex items-start">
                  <input
                    id="agreeToMarketing"
                    name="agreeToMarketing"
                    type="checkbox"
                    checked={formData.agreeToMarketing}
                    onChange={handleInputChange('agreeToMarketing')}
                    className="h-4 w-4 text-primary-main focus:ring-primary-main border-gray-300 rounded mt-1"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="agreeToMarketing" className="ml-2 block text-sm text-gray-900">
                    I would like to receive marketing communications and updates
                  </label>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                loadingText="Creating account..."
                disabled={isLoading}
                className="mt-6"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
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
      </div>
    </div>
  );
};

/**
 * Register component display name for debugging
 */
Register.displayName = 'Register';

export default Register;