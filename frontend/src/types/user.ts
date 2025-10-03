/**
 * User-related type definitions for the application
 */

/**
 * User roles enumeration
 */
export type UserRole = 'customer' | 'service_provider' | 'tenant_admin' | 'system_admin';

/**
 * User status enumeration
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

/**
 * User base interface
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's full name (computed) */
  fullName: string;
  /** User's role in the system */
  role: UserRole;
  /** User's current status */
  status: UserStatus;
  /** Profile image URL */
  avatar?: string;
  /** User's phone number */
  phone?: string;
  /** User's date of birth */
  dateOfBirth?: string;
  /** User's timezone */
  timezone: string;
  /** User's preferred language */
  language: string;
  /** Email verification status */
  emailVerified: boolean;
  /** Two-factor authentication enabled */
  twoFactorEnabled: boolean;
  /** Last login timestamp */
  lastLoginAt?: string;
  /** Account creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * User creation data (for registration)
 */
export interface UserCreateData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's phone number (optional) */
  phone?: string;
  /** User's role (defaults to customer) */
  role?: UserRole;
  /** Terms acceptance timestamp */
  acceptedTerms: string;
  /** Marketing emails consent */
  marketingConsent: boolean;
}

/**
 * User update data (for profile updates)
 */
export interface UserUpdateData {
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User's phone number */
  phone?: string;
  /** User's date of birth */
  dateOfBirth?: string;
  /** User's timezone */
  timezone?: string;
  /** User's preferred language */
  language?: string;
  /** Profile image URL */
  avatar?: string;
}

/**
 * User login credentials
 */
export interface UserLoginData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Remember me flag */
  rememberMe?: boolean;
  /** Two-factor authentication token (if enabled) */
  twoFactorToken?: string;
}

/**
 * User profile information
 */
export interface UserProfile {
  /** User basic information */
  user: User;
  /** User's bio/description */
  bio?: string;
  /** User's website */
  website?: string;
  /** User's social media links */
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  /** User's business information (for service providers) */
  businessInfo?: {
    businessName?: string;
    businessAddress?: string;
    taxId?: string;
    licenseNumber?: string;
  };
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  /** Email notification preferences */
  notifications: {
    email: {
      bookingConfirmations: boolean;
      bookingReminders: boolean;
      bookingCancellations: boolean;
      promotionalEmails: boolean;
      reviewRequests: boolean;
      systemUpdates: boolean;
    };
    sms: {
      bookingConfirmations: boolean;
      bookingReminders: boolean;
      securityAlerts: boolean;
    };
    push: {
      bookingUpdates: boolean;
      promotionalOffers: boolean;
      systemNotifications: boolean;
    };
  };
  /** Privacy settings */
  privacy: {
    showProfileToPublic: boolean;
    showBookingHistory: boolean;
    allowReviews: boolean;
    dataSharing: boolean;
  };
  /** Display preferences */
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
}

/**
 * Password reset request data
 */
export interface PasswordResetRequest {
  /** User's email address */
  email: string;
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  /** Reset token from email */
  token: string;
  /** New password */
  password: string;
  /** Confirm new password */
  confirmPassword: string;
}

/**
 * User session information
 */
export interface UserSession {
  /** Session ID */
  id: string;
  /** Device information */
  device: string;
  /** Geographic location */
  location: string;
  /** Last activity timestamp */
  lastActive: string;
  /** Whether this is the current session */
  current: boolean;
  /** Session creation timestamp */
  createdAt: string;
}

/**
 * User activity log entry
 */
export interface UserActivity {
  /** Activity ID */
  id: string;
  /** User ID */
  userId: string;
  /** Activity type */
  type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'booking_created' | 'service_created';
  /** Activity description */
  description: string;
  /** IP address */
  ipAddress: string;
  /** User agent */
  userAgent: string;
  /** Geographic location */
  location?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Activity timestamp */
  timestamp: string;
}

/**
 * User statistics
 */
export interface UserStats {
  /** User ID */
  userId: string;
  /** Total bookings made/received */
  totalBookings: number;
  /** Total spent/earned */
  totalAmount: number;
  /** Average rating given/received */
  averageRating: number;
  /** Total reviews given/received */
  totalReviews: number;
  /** Account age in days */
  accountAge: number;
  /** Last activity date */
  lastActivity: string;
}

/**
 * User search filters
 */
export interface UserFilters {
  /** Search query */
  search?: string;
  /** Role filter */
  role?: UserRole[];
  /** Status filter */
  status?: UserStatus[];
  /** Registration date range */
  dateRange?: {
    start: string;
    end: string;
  };
  /** Email verification status */
  emailVerified?: boolean;
}

/**
 * User list response
 */
export interface UserListResponse {
  /** Array of users */
  users: User[];
  /** Total number of users */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /** User information */
  user: User;
  /** Access token */
  token: string;
  /** Refresh token */
  refreshToken: string;
  /** Token expiration time */
  expiresAt: string;
}

/**
 * Two-factor authentication setup data
 */
export interface TwoFactorSetup {
  /** QR code for authenticator app */
  qrCode: string;
  /** Secret key for manual entry */
  secret: string;
  /** Backup codes for account recovery */
  backupCodes: string[];
}

/**
 * Social login provider
 */
export type SocialProvider = 'google' | 'facebook' | 'apple';

/**
 * Social login authorization URL
 */
export interface SocialAuthUrl {
  /** Authorization URL */
  authUrl: string;
  /** State parameter for security */
  state: string;
}

/**
 * User export/import types
 */
export interface UserExportOptions {
  /** Data format */
  format: 'csv' | 'json' | 'xlsx';
  /** Fields to include */
  fields: string[];
  /** Date range */
  dateRange?: {
    start: string;
    end: string;
  };
  /** User filters */
  filters?: UserFilters;
}

/**
 * User import result
 */
export interface UserImportResult {
  /** Successfully imported users */
  imported: number;
  /** Failed imports */
  failed: number;
  /** Errors encountered */
  errors: Array<{
    row: number;
    error: string;
  }>;
}