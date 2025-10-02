/**
 * Comprehensive TypeScript type definitions for Authentication Components
 *
 * This file contains all type definitions used across the authentication component library,
 * providing type safety and better developer experience for auth-related functionality.
 */

import type { ReactNode, HTMLAttributes, FormHTMLAttributes } from 'react';

/**
 * Base authentication component props that all auth components can extend
 */
export interface BaseAuthComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Child components */
  children?: ReactNode;
  /** Test ID for testing purposes */
  'data-testid'?: string;
  /** Custom redirect URL after successful authentication */
  redirectTo?: string;
  /** Callback fired on successful authentication */
  onSuccess?: () => void;
  /** Callback fired on authentication error */
  onError?: (error: AuthError) => void;
}

/**
 * User role types in the system
 */
export type UserRole = 'customer' | 'service_provider' | 'tenant_admin' | 'system_admin';

/**
 * Authentication status types
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * User interface representing authenticated user data
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's full name */
  name: string;
  /** User's role in the system */
  role: UserRole;
  /** Tenant ID for multi-tenant systems */
  tenantId?: string;
  /** User's profile image URL */
  avatar?: string;
  /** Whether user's email is verified */
  emailVerified?: boolean;
  /** User's phone number */
  phone?: string;
  /** Account creation timestamp */
  createdAt?: string;
  /** Last login timestamp */
  lastLoginAt?: string;
  /** User preferences */
  preferences?: UserPreferences;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  /** Preferred language */
  language?: string;
  /** Timezone */
  timezone?: string;
  /** Notification preferences */
  notifications?: NotificationPreferences;
  /** Theme preference */
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
  /** Email notifications enabled */
  email: boolean;
  /** SMS notifications enabled */
  sms: boolean;
  /** Push notifications enabled */
  push: boolean;
  /** Marketing communications enabled */
  marketing: boolean;
}

/**
 * Authentication error interface
 */
export interface AuthError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Field-specific errors (for form validation) */
  fieldErrors?: Record<string, string>;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Timestamp when error occurred */
  timestamp: Date;
}

/**
 * Login form data interface
 */
export interface LoginFormData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Whether to remember the login session */
  rememberMe: boolean;
}

/**
 * Registration form data interface
 */
export interface RegisterFormData {
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
  /** User's selected role */
  role: UserRole;
  /** Whether user agrees to terms and conditions */
  agreeToTerms: boolean;
  /** Whether user agrees to marketing communications */
  agreeToMarketing?: boolean;
  /** User's phone number (optional) */
  phone?: string;
}

/**
 * Password reset form data interface
 */
export interface PasswordResetFormData {
  /** User's email address for password reset */
  email: string;
}

/**
 * Password reset confirmation data interface
 */
export interface PasswordResetConfirmData {
  /** Reset token from email */
  token: string;
  /** New password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  /** Authenticated user data */
  user: User;
  /** JWT access token */
  accessToken: string;
  /** JWT refresh token */
  refreshToken: string;
  /** Token expiration timestamp */
  expiresAt: string;
  /** Token type */
  tokenType: 'Bearer';
}

/**
 * Login component props interface
 */
export interface LoginProps extends BaseAuthComponentProps {
  /** Initial form values */
  initialValues?: Partial<LoginFormData>;
  /** Whether to show "Remember Me" option */
  showRememberMe?: boolean;
  /** Whether to show social login options */
  showSocialLogin?: boolean;
  /** Custom login API endpoint */
  loginEndpoint?: string;
  /** Additional form fields */
  additionalFields?: ReactNode;
}

/**
 * Register component props interface
 */
export interface RegisterProps extends BaseAuthComponentProps {
  /** Initial form values */
  initialValues?: Partial<RegisterFormData>;
  /** Default user role for registration */
  defaultRole?: UserRole;
  /** Whether to show role selection */
  showRoleSelection?: boolean;
  /** Available roles for selection */
  availableRoles?: UserRole[];
  /** Whether to show marketing opt-in */
  showMarketingOptIn?: boolean;
  /** Whether to show phone number field */
  showPhoneNumber?: boolean;
  /** Custom registration API endpoint */
  registerEndpoint?: string;
  /** Additional form fields */
  additionalFields?: ReactNode;
}

/**
 * Password reset component props interface
 */
export interface PasswordResetProps extends BaseAuthComponentProps {
  /** Initial form values */
  initialValues?: Partial<PasswordResetFormData>;
  /** Custom password reset API endpoint */
  resetEndpoint?: string;
  /** Whether to show back to login link */
  showBackToLogin?: boolean;
  /** Additional form fields */
  additionalFields?: ReactNode;
}

/**
 * Form validation error interfaces
 */
export interface LoginErrors {
  /** Email field error */
  email?: string;
  /** Password field error */
  password?: string;
  /** General form error */
  general?: string;
}

export interface RegisterErrors {
  /** First name field error */
  firstName?: string;
  /** Last name field error */
  lastName?: string;
  /** Email field error */
  email?: string;
  /** Password field error */
  password?: string;
  /** Confirm password field error */
  confirmPassword?: string;
  /** Role field error */
  role?: string;
  /** Terms agreement error */
  agreeToTerms?: string;
  /** General form error */
  general?: string;
}

export interface PasswordResetErrors {
  /** Email field error */
  email?: string;
  /** General form error */
  general?: string;
}

/**
 * Authentication context interface
 */
export interface AuthContextValue {
  /** Current authenticated user */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Authentication status */
  status: AuthStatus;
  /** Whether authentication is in progress */
  isLoading: boolean;
  /** Login function */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Register function */
  register: (userData: RegisterData) => Promise<void>;
  /** Logout function */
  logout: () => void;
  /** Password reset function */
  resetPassword: (email: string) => Promise<void>;
  /** Refresh token function */
  refreshToken: () => Promise<void>;
  /** Update user profile function */
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Whether to remember the login */
  rememberMe?: boolean;
}

/**
 * Registration data interface
 */
export interface RegisterData {
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** User's selected role */
  role: UserRole;
  /** User's phone number (optional) */
  phone?: string;
  /** Marketing opt-in preference */
  marketingOptIn?: boolean;
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  /** User's email address */
  email: string;
}

/**
 * Password reset confirmation interface
 */
export interface PasswordResetConfirmation {
  /** Reset token from email */
  token: string;
  /** New password */
  password: string;
}

/**
 * Authentication API response interfaces
 */
export interface LoginResponse extends AuthResponse {}

export interface RegisterResponse extends AuthResponse {
  /** Whether email verification is required */
  requiresEmailVerification: boolean;
  /** Email verification token if required */
  verificationToken?: string;
}

export interface PasswordResetResponse {
  /** Whether reset email was sent successfully */
  success: boolean;
  /** Message for the user */
  message: string;
}

/**
 * Token storage interface
 */
export interface TokenStorage {
  /** Access token */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Token expiration timestamp */
  expiresAt: string;
  /** Token type */
  tokenType: string;
}

/**
 * Session management interface
 */
export interface SessionData {
  /** Session ID */
  sessionId: string;
  /** User data */
  user: User;
  /** Session creation timestamp */
  createdAt: string;
  /** Session expiration timestamp */
  expiresAt: string;
  /** Whether session should persist */
  persistent: boolean;
}

/**
 * Multi-factor authentication interfaces
 */
export interface MFAData {
  /** Whether MFA is enabled */
  enabled: boolean;
  /** MFA method (SMS, email, authenticator) */
  method: 'sms' | 'email' | 'authenticator';
  /** Backup codes for account recovery */
  backupCodes?: string[];
}

export interface MFACode {
  /** Verification code */
  code: string;
  /** Whether to trust this device */
  trustDevice?: boolean;
}

/**
 * Social login interfaces
 */
export interface SocialLoginProvider {
  /** Provider name (google, facebook, github) */
  name: string;
  /** Provider display name */
  displayName: string;
  /** Provider icon */
  icon: ReactNode;
  /** Provider color */
  color: string;
}

export interface SocialLoginData {
  /** Provider name */
  provider: string;
  /** Provider access token */
  accessToken: string;
  /** Provider user data */
  userData: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

/**
 * Form submission state interface
 */
export interface FormSubmissionState {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form has been submitted successfully */
  isSubmitted: boolean;
  /** Submission error if any */
  error?: AuthError;
  /** Number of submission attempts */
  attempts: number;
}

/**
 * Password strength interface
 */
export interface PasswordStrength {
  /** Strength level (0-4) */
  level: number;
  /** Strength label */
  label: string;
  /** CSS class for strength color */
  color: string;
  /** Detailed feedback */
  feedback?: string[];
}

/**
 * Authentication event interfaces
 */
export interface AuthEvent {
  /** Event type */
  type: 'login' | 'logout' | 'register' | 'password_reset' | 'token_refresh';
  /** Timestamp when event occurred */
  timestamp: Date;
  /** User ID if available */
  userId?: string;
  /** Additional event data */
  data?: Record<string, any>;
}

/**
 * Security-related interfaces
 */
export interface SecuritySettings {
  /** Password requirements */
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  /** Session timeout in minutes */
  sessionTimeout: number;
  /** Maximum login attempts before lockout */
  maxLoginAttempts: number;
  /** Account lockout duration in minutes */
  lockoutDuration: number;
  /** Whether MFA is required */
  requireMFA: boolean;
}

/**
 * Audit log entry interface
 */
export interface AuthAuditLog {
  /** Unique log entry ID */
  id: string;
  /** User ID */
  userId: string;
  /** Action performed */
  action: string;
  /** IP address */
  ipAddress: string;
  /** User agent */
  userAgent: string;
  /** Timestamp */
  timestamp: Date;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Component composition types
 */
export type AuthComponentWithChildren<T = {}> = T & { children?: ReactNode };
export type AuthComponentWithClassName<T = {}> = T & { className?: string };
export type AuthComponentWithError<T = {}> = T & { error?: AuthError };

/**
 * Event handler types for authentication
 */
export type LoginHandler = (credentials: LoginCredentials) => Promise<void>;
export type RegisterHandler = (userData: RegisterData) => Promise<void>;
export type LogoutHandler = () => void;
export type PasswordResetHandler = (email: string) => Promise<void>;
export type AuthErrorHandler = (error: AuthError) => void;
export type AuthSuccessHandler = (user: User) => void;

/**
 * Form validation types
 */
export interface FormValidation<T> {
  /** Form data */
  data: T;
  /** Validation errors */
  errors: Partial<Record<keyof T, string>>;
  /** Whether form is valid */
  isValid: boolean;
  /** Whether form is currently validating */
  isValidating: boolean;
}

/**
 * Authentication hook return types
 */
export interface UseAuthReturn {
  /** Current user */
  user: User | null;
  /** Authentication status */
  isAuthenticated: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Login function */
  login: LoginHandler;
  /** Register function */
  register: RegisterHandler;
  /** Logout function */
  logout: LogoutHandler;
  /** Password reset function */
  resetPassword: PasswordResetHandler;
  /** Error state */
  error: AuthError | null;
  /** Clear error function */
  clearError: () => void;
}

/**
 * Authentication provider props
 */
export interface AuthProviderProps {
  /** Child components */
  children: ReactNode;
  /** Authentication API base URL */
  apiUrl?: string;
  /** Token storage key */
  tokenKey?: string;
  /** Refresh token key */
  refreshTokenKey?: string;
  /** Whether to persist authentication state */
  persistAuth?: boolean;
  /** Custom storage implementation */
  storage?: Storage;
}

/**
 * Route protection types
 */
export interface ProtectedRouteProps {
  /** Components to render when authenticated */
  children: ReactNode;
  /** Required user roles */
  allowedRoles?: UserRole[];
  /** Fallback component when not authenticated */
  fallback?: ReactNode;
  /** Redirect path when not authenticated */
  redirectTo?: string;
}

export interface PublicRouteProps {
  /** Components to render */
  children: ReactNode;
  /** Whether to redirect authenticated users */
  redirectAuthenticated?: boolean;
  /** Redirect path for authenticated users */
  redirectTo?: string;
}

/**
 * Theme integration types
 */
export interface AuthTheme {
  /** Color scheme */
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    error: string;
    success: string;
    warning: string;
  };
  /** Typography settings */
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
  /** Spacing scale */
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  /** Border radius values */
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
}

/**
 * Responsive design types
 */
export interface AuthResponsiveProps {
  /** Mobile breakpoint styles */
  mobile?: Record<string, any>;
  /** Tablet breakpoint styles */
  tablet?: Record<string, any>;
  /** Desktop breakpoint styles */
  desktop?: Record<string, any>;
}

/**
 * Animation and transition types
 */
export interface AuthAnimationProps {
  /** Animation duration */
  duration?: number;
  /** Animation easing function */
  easing?: string;
  /** Whether to disable animations */
  disableAnimation?: boolean;
}

/**
 * Internationalization types
 */
export interface AuthI18n {
  /** Login form translations */
  login: {
    title: string;
    emailLabel: string;
    passwordLabel: string;
    submitButton: string;
    forgotPassword: string;
    rememberMe: string;
    noAccount: string;
    signUpLink: string;
  };
  /** Registration form translations */
  register: {
    title: string;
    firstNameLabel: string;
    lastNameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    roleLabel: string;
    termsAgreement: string;
    marketingOptIn: string;
    submitButton: string;
    haveAccount: string;
    signInLink: string;
  };
  /** Password reset translations */
  passwordReset: {
    title: string;
    emailLabel: string;
    submitButton: string;
    backToLogin: string;
    successTitle: string;
    successMessage: string;
    helpText: string;
  };
  /** Common translations */
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    required: string;
  };
}

/**
 * Error boundary types for authentication
 */
export interface AuthErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error?: Error;
  /** Error information */
  errorInfo?: {
    componentStack: string;
  };
}

/**
 * Testing utility types
 */
export interface AuthTestUtils {
  /** Mock user for testing */
  mockUser: User;
  /** Mock authentication response */
  mockAuthResponse: AuthResponse;
  /** Mock login credentials */
  mockCredentials: LoginCredentials;
  /** Helper to render auth components in tests */
  renderAuthComponent: (component: ReactNode) => any;
  /** Helper to simulate login in tests */
  simulateLogin: (credentials?: LoginCredentials) => Promise<void>;
  /** Helper to simulate logout in tests */
  simulateLogout: () => void;
}

/**
 * Utility types for better type inference
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type AuthFormData = LoginFormData | RegisterFormData | PasswordResetFormData;
export type AuthErrors = LoginErrors | RegisterErrors | PasswordResetErrors;

/**
 * Generic authentication component props
 */
export interface GenericAuthProps<T = AuthFormData> {
  /** Form data */
  data: T;
  /** Form errors */
  errors: Partial<Record<keyof T, string>>;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is loading */
  isLoading: boolean;
  /** Form submission handler */
  onSubmit: (e: React.FormEvent) => void;
  /** Field change handler */
  onChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Social authentication types
 */
export interface SocialAuthProps {
  /** Available social providers */
  providers: SocialLoginProvider[];
  /** Whether social login is loading */
  isLoading?: boolean;
  /** Social login error */
  error?: AuthError;
  /** Social login handler */
  onSocialLogin: (provider: string) => Promise<void>;
}

/**
 * Account verification types
 */
export interface EmailVerificationProps {
  /** Verification token */
  token: string;
  /** Email address being verified */
  email: string;
  /** Verification handler */
  onVerify: (token: string) => Promise<void>;
  /** Resend verification handler */
  onResend: () => Promise<void>;
}

/**
 * Password policy types
 */
export interface PasswordPolicy {
  /** Minimum password length */
  minLength: number;
  /** Whether uppercase letters are required */
  requireUppercase: boolean;
  /** Whether lowercase letters are required */
  requireLowercase: boolean;
  /** Whether numbers are required */
  requireNumbers: boolean;
  /** Whether special characters are required */
  requireSpecialChars: boolean;
  /** Common passwords to reject */
  rejectCommonPasswords: boolean;
}

/**
 * Session management types
 */
export interface SessionConfig {
  /** Session timeout in minutes */
  timeout: number;
  /** Whether to extend session on activity */
  extendOnActivity: boolean;
  /** Maximum number of concurrent sessions */
  maxConcurrentSessions: number;
  /** Whether to show session expiry warning */
  showExpiryWarning: boolean;
  /** Warning time before expiry in minutes */
  warningTime: number;
}

/**
 * Export utility type helpers
 */
export type AuthComponentProps<T = {}> = T & BaseAuthComponentProps;
export type FormComponentProps<T = {}> = T & {
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  onSubmit?: (data: any) => void;
};