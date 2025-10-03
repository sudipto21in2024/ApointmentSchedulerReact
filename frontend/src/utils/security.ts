/**
 * Security Utilities
 *
 * Comprehensive security utilities for booking management system following design system specifications.
 * Implements authorization checks, input validation, and sensitive data protection.
 *
 * Security Features:
 * - Authorization checks for booking management actions
 * - Input validation to prevent injection attacks
 * - Sensitive booking information protection
 * - XSS prevention and sanitization
 * - CSRF protection utilities
 * - Secure data masking and encryption
 */

import type { Booking } from '../types/booking';

// User interface for security utilities
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// User role definitions
export type UserRole = 'customer' | 'provider' | 'admin' | 'super_admin';

export interface UserPermissions {
  canCreateBooking: boolean;
  canEditBooking: boolean;
  canCancelBooking: boolean;
  canViewAllBookings: boolean;
  canManageUsers: boolean;
  canManageServices: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

/**
 * Authorization utility class for booking management permissions
 */
export class AuthorizationService {
  /**
   * Get user permissions based on role
   */
  static getUserPermissions(user: User): UserPermissions {
    const role = user.role as UserRole;

    const basePermissions: UserPermissions = {
      canCreateBooking: false,
      canEditBooking: false,
      canCancelBooking: false,
      canViewAllBookings: false,
      canManageUsers: false,
      canManageServices: false,
      canViewReports: false,
      canManageSettings: false
    };

    switch (role) {
      case 'customer':
        return {
          ...basePermissions,
          canCreateBooking: true,
          canEditBooking: true,
          canCancelBooking: true
        };

      case 'provider':
        return {
          ...basePermissions,
          canCreateBooking: true,
          canEditBooking: true,
          canCancelBooking: true,
          canViewAllBookings: true,
          canManageServices: true,
          canViewReports: true
        };

      case 'admin':
        return {
          ...basePermissions,
          canCreateBooking: true,
          canEditBooking: true,
          canCancelBooking: true,
          canViewAllBookings: true,
          canManageUsers: true,
          canManageServices: true,
          canViewReports: true,
          canManageSettings: true
        };

      case 'super_admin':
        return {
          canCreateBooking: true,
          canEditBooking: true,
          canCancelBooking: true,
          canViewAllBookings: true,
          canManageUsers: true,
          canManageServices: true,
          canViewReports: true,
          canManageSettings: true
        };

      default:
        return basePermissions;
    }
  }

  /**
   * Check if user can perform action on booking
   */
  static canUserModifyBooking(user: User, booking: Booking, action: 'edit' | 'cancel' | 'view'): boolean {
    const permissions = this.getUserPermissions(user);

    switch (action) {
      case 'view':
        return permissions.canViewAllBookings || booking.customerId === user.id;

      case 'edit':
        return permissions.canEditBooking && (
          booking.customerId === user.id ||
          permissions.canViewAllBookings
        );

      case 'cancel':
        return permissions.canCancelBooking && (
          booking.customerId === user.id ||
          permissions.canViewAllBookings
        );

      default:
        return false;
    }
  }

  /**
   * Check if user can access admin features
   */
  static isAdminUser(user: User): boolean {
    return ['admin', 'super_admin'].includes(user.role as UserRole);
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(user: User): boolean {
    return this.getUserPermissions(user).canManageUsers;
  }
}

/**
 * Input validation and sanitization utilities
 */
export class InputValidationService {
  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validate booking notes (prevent injection)
   */
  static sanitizeBookingNotes(notes: string): string {
    return this.sanitizeString(notes)
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate service ID format
   */
  static isValidServiceId(serviceId: string): boolean {
    const serviceIdRegex = /^[a-zA-Z0-9\-_]+$/;
    return serviceIdRegex.test(serviceId) && serviceId.length <= 50;
  }

  /**
   * Validate participant count
   */
  static isValidParticipantCount(count: number): boolean {
    return Number.isInteger(count) && count >= 1 && count <= 50;
  }

  /**
   * Validate date format and range
   */
  static isValidBookingDate(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(now.getFullYear() + 2); // Max 2 years in future

    return date instanceof Date &&
           !isNaN(date.getTime()) &&
           date >= now &&
           date <= maxFutureDate;
  }
}

/**
 * Data masking utilities for sensitive information
 */
export class DataMaskingService {
  /**
   * Mask booking ID for display
   */
  static maskBookingId(bookingId: string): string {
    if (bookingId.length <= 8) return bookingId;
    return `${bookingId.slice(0, 4)}****${bookingId.slice(-4)}`;
  }

  /**
   * Mask customer phone number
   */
  static maskPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.length <= 4) return phone;
    return `****${cleaned.slice(-4)}`;
  }

  /**
   * Mask email address
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.slice(0, 2)}****@${domain}`;
  }

  /**
   * Mask credit card number
   */
  static maskCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return cardNumber;
    return `****-****-****-${cleaned.slice(-4)}`;
  }

  /**
   * Mask customer information for display
   */
  static maskCustomerInfo(customerInfo: {
    name: string;
    email: string;
    phone?: string;
  }): typeof customerInfo {
    return {
      name: customerInfo.name, // Keep full name for usability
      email: this.maskEmail(customerInfo.email),
      phone: customerInfo.phone ? this.maskPhoneNumber(customerInfo.phone) : undefined
    };
  }

  /**
   * Determine if data should be masked based on user permissions
   */
  static shouldMaskData(user: User, dataOwnerId?: string): boolean {
    if (AuthorizationService.isAdminUser(user)) return false;
    if (dataOwnerId && dataOwnerId === user.id) return false;
    return true;
  }
}

/**
 * CSRF protection utilities
 */
export class CSRFProtectionService {
  private static token: string | null = null;

  /**
   * Generate CSRF token
   */
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return this.token;
  }

  /**
   * Get current CSRF token
   */
  static getToken(): string {
    if (!this.token) {
      this.token = this.generateToken();
    }
    return this.token;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token: string): boolean {
    return this.token === token;
  }

  /**
   * Add CSRF token to request headers
   */
  static getCSRFHeaders(): Record<string, string> {
    return {
      'X-CSRF-Token': this.getToken(),
      'X-Requested-With': 'XMLHttpRequest'
    };
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimitingService {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Check if action is rate limited
   */
  static isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (record.count >= maxAttempts) {
      return true;
    }

    record.count++;
    return false;
  }

  /**
   * Record failed attempt
   */
  static recordFailedAttempt(key: string): void {
    const record = this.attempts.get(key);
    if (record) {
      record.count++;
    }
  }

  /**
   * Reset rate limit for key
   */
  static resetRateLimit(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Audit logging utilities
 */
export class AuditService {
  /**
   * Log booking action for audit trail
   */
  static logBookingAction(
    action: string,
    bookingId: string,
    userId: string,
    details?: Record<string, any>
  ): void {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      resource: 'booking',
      resourceId: bookingId,
      userId,
      details,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Would be set by server
    };

    // In a real application, this would send to audit service
    console.log('Audit Log:', auditEntry);

    // Store in local storage for demo purposes
    this.storeAuditEntry(auditEntry);
  }

  /**
   * Store audit entry locally
   */
  private static storeAuditEntry(entry: any): void {
    try {
      const existing = localStorage.getItem('booking-audit-logs') || '[]';
      const logs = JSON.parse(existing);
      logs.push(entry);

      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('booking-audit-logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store audit log:', error);
    }
  }

  /**
   * Get audit logs
   */
  static getAuditLogs(): any[] {
    try {
      const logs = localStorage.getItem('booking-audit-logs') || '[]';
      return JSON.parse(logs);
    } catch {
      return [];
    }
  }
}

/**
 * Security validation helpers
 */
export const SecurityValidators = {
  /**
   * Validate booking creation data
   */
  validateBookingCreateData: (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!InputValidationService.isValidServiceId(data.serviceId)) {
      errors.push('Invalid service ID format');
    }

    if (!InputValidationService.isValidBookingDate(data.scheduledAt)) {
      errors.push('Invalid booking date or time');
    }

    if (!InputValidationService.isValidParticipantCount(data.participantCount)) {
      errors.push('Invalid participant count');
    }

    if (data.notes && data.notes.length > 1000) {
      errors.push('Notes exceed maximum length');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate user permissions for action
   */
  validateUserAction: (user: User, action: string, resource?: any): { allowed: boolean; reason?: string } => {
    const permissions = AuthorizationService.getUserPermissions(user);

    switch (action) {
      case 'create_booking':
        return { allowed: permissions.canCreateBooking };

      case 'edit_booking':
        if (!resource) return { allowed: false, reason: 'Resource not provided' };
        return {
          allowed: AuthorizationService.canUserModifyBooking(user, resource, 'edit'),
          reason: !AuthorizationService.canUserModifyBooking(user, resource, 'edit') ? 'Insufficient permissions' : undefined
        };

      case 'cancel_booking':
        if (!resource) return { allowed: false, reason: 'Resource not provided' };
        return {
          allowed: AuthorizationService.canUserModifyBooking(user, resource, 'cancel'),
          reason: !AuthorizationService.canUserModifyBooking(user, resource, 'cancel') ? 'Insufficient permissions' : undefined
        };

      default:
        return { allowed: false, reason: 'Unknown action' };
    }
  }
};

/**
 * Security middleware for API calls
 */
export const SecurityMiddleware = {
  /**
   * Add security headers to API requests
   */
  enhanceRequest: (config: RequestInit): RequestInit => {
    return {
      ...config,
      headers: {
        ...config.headers,
        ...CSRFProtectionService.getCSRFHeaders(),
        'X-Client-Version': '1.0.0',
        'X-Timestamp': new Date().toISOString()
      }
    };
  },

  /**
   * Validate response security
   */
  validateResponse: (response: Response): boolean => {
    // Check for security headers
    const securityHeaders = response.headers.get('X-Security-Validated');
    return securityHeaders === 'true';
  }
};

export default {
  AuthorizationService,
  InputValidationService,
  DataMaskingService,
  CSRFProtectionService,
  RateLimitingService,
  AuditService,
  SecurityValidators,
  SecurityMiddleware
};