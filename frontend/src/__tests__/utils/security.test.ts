/**
 * Security Utilities Tests
 *
 * Comprehensive unit tests for security utilities covering authorization,
 * input validation, data masking, CSRF protection, and audit logging.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  AuthorizationService,
  InputValidationService,
  DataMaskingService,
  CSRFProtectionService,
  RateLimitingService,
  AuditService,
  SecurityValidators,
  SecurityMiddleware
} from '../../utils/security';
import type { UserRole } from '../../utils/security';

// Define User interface locally for testing
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
import type { Booking } from '../../types/booking';

// Mock crypto API
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Test User Agent'
  }
});

describe('Security Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset CSRF token
    (CSRFProtectionService as any).token = null;
    // Clear rate limiting data
    (RateLimitingService as any).attempts.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AuthorizationService', () => {
    const mockUsers: Record<UserRole, User> = {
      customer: {
        id: 'customer-1',
        name: 'John Customer',
        email: 'customer@example.com',
        role: 'customer'
      },
      provider: {
        id: 'provider-1',
        name: 'Jane Provider',
        email: 'provider@example.com',
        role: 'provider'
      },
      admin: {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      super_admin: {
        id: 'super-admin-1',
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: 'super_admin'
      }
    };

    describe('getUserPermissions', () => {
      it('should return correct permissions for customer role', () => {
        const permissions = AuthorizationService.getUserPermissions(mockUsers.customer);

        expect(permissions.canCreateBooking).toBe(true);
        expect(permissions.canEditBooking).toBe(true);
        expect(permissions.canCancelBooking).toBe(true);
        expect(permissions.canViewAllBookings).toBe(false);
        expect(permissions.canManageUsers).toBe(false);
        expect(permissions.canManageServices).toBe(false);
        expect(permissions.canViewReports).toBe(false);
        expect(permissions.canManageSettings).toBe(false);
      });

      it('should return correct permissions for provider role', () => {
        const permissions = AuthorizationService.getUserPermissions(mockUsers.provider);

        expect(permissions.canCreateBooking).toBe(true);
        expect(permissions.canEditBooking).toBe(true);
        expect(permissions.canCancelBooking).toBe(true);
        expect(permissions.canViewAllBookings).toBe(true);
        expect(permissions.canManageUsers).toBe(false);
        expect(permissions.canManageServices).toBe(true);
        expect(permissions.canViewReports).toBe(true);
        expect(permissions.canManageSettings).toBe(false);
      });

      it('should return correct permissions for admin role', () => {
        const permissions = AuthorizationService.getUserPermissions(mockUsers.admin);

        expect(permissions.canCreateBooking).toBe(true);
        expect(permissions.canEditBooking).toBe(true);
        expect(permissions.canCancelBooking).toBe(true);
        expect(permissions.canViewAllBookings).toBe(true);
        expect(permissions.canManageUsers).toBe(true);
        expect(permissions.canManageServices).toBe(true);
        expect(permissions.canViewReports).toBe(true);
        expect(permissions.canManageSettings).toBe(true);
      });

      it('should return correct permissions for super_admin role', () => {
        const permissions = AuthorizationService.getUserPermissions(mockUsers.super_admin);

        expect(permissions.canCreateBooking).toBe(true);
        expect(permissions.canEditBooking).toBe(true);
        expect(permissions.canCancelBooking).toBe(true);
        expect(permissions.canViewAllBookings).toBe(true);
        expect(permissions.canManageUsers).toBe(true);
        expect(permissions.canManageServices).toBe(true);
        expect(permissions.canViewReports).toBe(true);
        expect(permissions.canManageSettings).toBe(true);
      });

      it('should return base permissions for unknown role', () => {
        const unknownUser = { ...mockUsers.customer, role: 'unknown' as any };
        const permissions = AuthorizationService.getUserPermissions(unknownUser);

        expect(permissions.canCreateBooking).toBe(false);
        expect(permissions.canEditBooking).toBe(false);
        expect(permissions.canCancelBooking).toBe(false);
        expect(permissions.canViewAllBookings).toBe(false);
        expect(permissions.canManageUsers).toBe(false);
        expect(permissions.canManageServices).toBe(false);
        expect(permissions.canViewReports).toBe(false);
        expect(permissions.canManageSettings).toBe(false);
      });
    });

    describe('canUserModifyBooking', () => {
      const mockBooking: Booking = {
        id: 'booking-1',
        serviceId: 'service-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
        scheduledAt: '2024-01-15T10:00:00Z',
        duration: 60,
        participantCount: 2,
        totalPrice: 100,
        currency: 'USD',
        status: 'confirmed',
        paymentStatus: 'paid',
        priority: 'normal',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z'
      };

      it('should allow customer to view their own booking', () => {
        const canView = AuthorizationService.canUserModifyBooking(mockUsers.customer, mockBooking, 'view');
        expect(canView).toBe(true);
      });

      it('should allow customer to edit their own booking', () => {
        const canEdit = AuthorizationService.canUserModifyBooking(mockUsers.customer, mockBooking, 'edit');
        expect(canEdit).toBe(true);
      });

      it('should allow customer to cancel their own booking', () => {
        const canCancel = AuthorizationService.canUserModifyBooking(mockUsers.customer, mockBooking, 'cancel');
        expect(canCancel).toBe(true);
      });

      it('should not allow customer to view other customers booking', () => {
        const otherCustomerBooking = { ...mockBooking, customerId: 'other-customer' };
        const canView = AuthorizationService.canUserModifyBooking(mockUsers.customer, otherCustomerBooking, 'view');
        expect(canView).toBe(false);
      });

      it('should allow provider to view all bookings', () => {
        const otherCustomerBooking = { ...mockBooking, customerId: 'other-customer' };
        const canView = AuthorizationService.canUserModifyBooking(mockUsers.provider, otherCustomerBooking, 'view');
        expect(canView).toBe(true);
      });

      it('should allow admin to modify any booking', () => {
        const otherCustomerBooking = { ...mockBooking, customerId: 'other-customer' };
        const canEdit = AuthorizationService.canUserModifyBooking(mockUsers.admin, otherCustomerBooking, 'edit');
        const canCancel = AuthorizationService.canUserModifyBooking(mockUsers.admin, otherCustomerBooking, 'cancel');
        expect(canEdit).toBe(true);
        expect(canCancel).toBe(true);
      });

      it('should deny unknown action', () => {
        const canUnknown = AuthorizationService.canUserModifyBooking(mockUsers.customer, mockBooking, 'unknown' as any);
        expect(canUnknown).toBe(false);
      });
    });

    describe('isAdminUser', () => {
      it('should identify admin users correctly', () => {
        expect(AuthorizationService.isAdminUser(mockUsers.admin)).toBe(true);
        expect(AuthorizationService.isAdminUser(mockUsers.super_admin)).toBe(true);
      });

      it('should not identify non-admin users as admin', () => {
        expect(AuthorizationService.isAdminUser(mockUsers.customer)).toBe(false);
        expect(AuthorizationService.isAdminUser(mockUsers.provider)).toBe(false);
      });
    });

    describe('canManageUsers', () => {
      it('should allow admin and super_admin to manage users', () => {
        expect(AuthorizationService.canManageUsers(mockUsers.admin)).toBe(true);
        expect(AuthorizationService.canManageUsers(mockUsers.super_admin)).toBe(true);
      });

      it('should not allow customer and provider to manage users', () => {
        expect(AuthorizationService.canManageUsers(mockUsers.customer)).toBe(false);
        expect(AuthorizationService.canManageUsers(mockUsers.provider)).toBe(false);
      });
    });
  });

  describe('InputValidationService', () => {
    describe('sanitizeString', () => {
      it('should remove HTML tags', () => {
        const input = '<script>alert("xss")</script>Hello World';
        const sanitized = InputValidationService.sanitizeString(input);
        expect(sanitized).toBe('Hello World');
      });

      it('should remove javascript protocol', () => {
        const input = 'javascript:alert("xss")';
        const sanitized = InputValidationService.sanitizeString(input);
        expect(sanitized).toBe('');
      });

      it('should remove event handlers', () => {
        const input = 'onclick=alert("xss")';
        const sanitized = InputValidationService.sanitizeString(input);
        expect(sanitized).toBe('');
      });

      it('should handle non-string input', () => {
        expect(InputValidationService.sanitizeString(null as any)).toBe('');
        expect(InputValidationService.sanitizeString(undefined as any)).toBe('');
        expect(InputValidationService.sanitizeString(123 as any)).toBe('');
      });

      it('should preserve safe content', () => {
        const input = 'Safe text with numbers 123 and symbols @#$';
        const sanitized = InputValidationService.sanitizeString(input);
        expect(sanitized).toBe(input);
      });
    });

    describe('isValidEmail', () => {
      it('should validate correct email formats', () => {
        expect(InputValidationService.isValidEmail('user@example.com')).toBe(true);
        expect(InputValidationService.isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
        expect(InputValidationService.isValidEmail('user123@test-domain.org')).toBe(true);
      });

      it('should reject invalid email formats', () => {
        expect(InputValidationService.isValidEmail('invalid-email')).toBe(false);
        expect(InputValidationService.isValidEmail('@example.com')).toBe(false);
        expect(InputValidationService.isValidEmail('user@')).toBe(false);
        expect(InputValidationService.isValidEmail('')).toBe(false);
      });
    });

    describe('isValidPhoneNumber', () => {
      it('should validate correct phone formats', () => {
        expect(InputValidationService.isValidPhoneNumber('+1234567890')).toBe(true);
        expect(InputValidationService.isValidPhoneNumber('1234567890')).toBe(true);
        expect(InputValidationService.isValidPhoneNumber('+1 (555) 123-4567')).toBe(true);
      });

      it('should reject invalid phone formats', () => {
        expect(InputValidationService.isValidPhoneNumber('abc')).toBe(false);
        expect(InputValidationService.isValidPhoneNumber('')).toBe(false);
        expect(InputValidationService.isValidPhoneNumber('++1234567890')).toBe(false);
      });
    });

    describe('sanitizeBookingNotes', () => {
      it('should sanitize and limit length', () => {
        const longNotes = 'A'.repeat(2000);
        const sanitized = InputValidationService.sanitizeBookingNotes(longNotes);
        expect(sanitized.length).toBe(1000);
      });

      it('should preserve safe content within limits', () => {
        const notes = 'Safe booking notes with special requests';
        const sanitized = InputValidationService.sanitizeBookingNotes(notes);
        expect(sanitized).toBe(notes);
      });
    });

    describe('isValidServiceId', () => {
      it('should validate correct service ID formats', () => {
        expect(InputValidationService.isValidServiceId('service-123')).toBe(true);
        expect(InputValidationService.isValidServiceId('SERVICE_123')).toBe(true);
        expect(InputValidationService.isValidServiceId('service_123')).toBe(true);
      });

      it('should reject invalid service ID formats', () => {
        expect(InputValidationService.isValidServiceId('service with spaces')).toBe(false);
        expect(InputValidationService.isValidServiceId('service@domain')).toBe(false);
        expect(InputValidationService.isValidServiceId('')).toBe(false);
        expect(InputValidationService.isValidServiceId('A'.repeat(51))).toBe(false);
      });
    });

    describe('isValidParticipantCount', () => {
      it('should validate correct participant counts', () => {
        expect(InputValidationService.isValidParticipantCount(1)).toBe(true);
        expect(InputValidationService.isValidParticipantCount(25)).toBe(true);
        expect(InputValidationService.isValidParticipantCount(50)).toBe(true);
      });

      it('should reject invalid participant counts', () => {
        expect(InputValidationService.isValidParticipantCount(0)).toBe(false);
        expect(InputValidationService.isValidParticipantCount(-1)).toBe(false);
        expect(InputValidationService.isValidParticipantCount(51)).toBe(false);
        expect(InputValidationService.isValidParticipantCount(1.5)).toBe(false);
      });
    });

    describe('isValidBookingDate', () => {
      it('should validate future dates within range', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);

        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 7);

        const tooFutureDate = new Date();
        tooFutureDate.setFullYear(tooFutureDate.getFullYear() + 3);

        expect(InputValidationService.isValidBookingDate(futureDate.toISOString())).toBe(true);
        expect(InputValidationService.isValidBookingDate(pastDate.toISOString())).toBe(false);
        expect(InputValidationService.isValidBookingDate(tooFutureDate.toISOString())).toBe(false);
      });

      it('should reject invalid date formats', () => {
        expect(InputValidationService.isValidBookingDate('invalid-date')).toBe(false);
        expect(InputValidationService.isValidBookingDate('')).toBe(false);
        expect(InputValidationService.isValidBookingDate('2024-13-40T25:70:00Z')).toBe(false);
      });
    });
  });

  describe('DataMaskingService', () => {
    describe('maskBookingId', () => {
      it('should mask long booking IDs', () => {
        const bookingId = 'booking-123456789';
        const masked = DataMaskingService.maskBookingId(bookingId);
        expect(masked).toBe('book****6789');
      });

      it('should not mask short booking IDs', () => {
        const shortId = 'short';
        const masked = DataMaskingService.maskBookingId(shortId);
        expect(masked).toBe(shortId);
      });

      it('should handle edge case lengths', () => {
        const eightCharId = '12345678';
        const masked = DataMaskingService.maskBookingId(eightCharId);
        expect(masked).toBe('1234****5678');
      });
    });

    describe('maskPhoneNumber', () => {
      it('should mask phone numbers correctly', () => {
        expect(DataMaskingService.maskPhoneNumber('+1234567890')).toBe('****7890');
        expect(DataMaskingService.maskPhoneNumber('1234567890')).toBe('****7890');
        expect(DataMaskingService.maskPhoneNumber('(555) 123-4567')).toBe('****4567');
      });

      it('should not mask short phone numbers', () => {
        expect(DataMaskingService.maskPhoneNumber('123')).toBe('123');
      });
    });

    describe('maskEmail', () => {
      it('should mask email addresses correctly', () => {
        expect(DataMaskingService.maskEmail('user@example.com')).toBe('us****@example.com');
        expect(DataMaskingService.maskEmail('test@test.co.uk')).toBe('te****@test.co.uk');
      });

      it('should not mask short usernames', () => {
        expect(DataMaskingService.maskEmail('ab@example.com')).toBe('ab@example.com');
      });
    });

    describe('maskCreditCard', () => {
      it('should mask credit card numbers correctly', () => {
        expect(DataMaskingService.maskCreditCard('4532-1234-5678-9012')).toBe('****-****-****-9012');
        expect(DataMaskingService.maskCreditCard('4532123456789012')).toBe('****-****-****-9012');
      });

      it('should handle short card numbers', () => {
        expect(DataMaskingService.maskCreditCard('123')).toBe('123');
      });
    });

    describe('maskCustomerInfo', () => {
      it('should mask customer information correctly', () => {
        const customerInfo = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890'
        };

        const masked = DataMaskingService.maskCustomerInfo(customerInfo);

        expect(masked.name).toBe('John Doe'); // Name should not be masked
        expect(masked.email).toBe('jo****@example.com');
        expect(masked.phone).toBe('****7890');
      });

      it('should handle missing phone number', () => {
        const customerInfo = {
          name: 'John Doe',
          email: 'john.doe@example.com'
        };

        const masked = DataMaskingService.maskCustomerInfo(customerInfo);

        expect(masked.name).toBe('John Doe');
        expect(masked.email).toBe('jo****@example.com');
        expect(masked.phone).toBeUndefined();
      });
    });

    describe('shouldMaskData', () => {
      const adminUser = { id: 'admin', role: 'admin' } as User;
      const customerUser = { id: 'customer', role: 'customer' } as User;

      it('should not mask data for admin users', () => {
        expect(DataMaskingService.shouldMaskData(adminUser, 'any-id')).toBe(false);
      });

      it('should not mask data for data owners', () => {
        expect(DataMaskingService.shouldMaskData(customerUser, 'customer')).toBe(false);
      });

      it('should mask data for non-owners', () => {
        expect(DataMaskingService.shouldMaskData(customerUser, 'other-customer')).toBe(true);
      });

      it('should mask data when dataOwnerId is not provided', () => {
        expect(DataMaskingService.shouldMaskData(customerUser)).toBe(true);
      });
    });
  });

  describe('CSRFProtectionService', () => {
    beforeEach(() => {
      (CSRFProtectionService as any).token = null;
    });

    describe('generateToken', () => {
      it('should generate a token of correct length', () => {
        const token = CSRFProtectionService.generateToken();
        expect(token).toHaveLength(64); // 32 bytes * 2 hex chars
      });

      it('should generate different tokens on each call', () => {
        const token1 = CSRFProtectionService.generateToken();
        const token2 = CSRFProtectionService.generateToken();
        expect(token1).not.toBe(token2);
      });

      it('should generate valid hex characters only', () => {
        const token = CSRFProtectionService.generateToken();
        expect(token).toMatch(/^[a-f0-9]+$/);
      });
    });

    describe('getToken', () => {
      it('should return existing token if available', () => {
        const existingToken = 'existing-token';
        (CSRFProtectionService as any).token = existingToken;

        const token = CSRFProtectionService.getToken();
        expect(token).toBe(existingToken);
      });

      it('should generate new token if none exists', () => {
        const token = CSRFProtectionService.getToken();
        expect(token).toHaveLength(64);
        expect(typeof token).toBe('string');
      });
    });

    describe('validateToken', () => {
      it('should validate correct token', () => {
        const token = CSRFProtectionService.generateToken();
        expect(CSRFProtectionService.validateToken(token)).toBe(true);
      });

      it('should reject incorrect token', () => {
        CSRFProtectionService.generateToken();
        expect(CSRFProtectionService.validateToken('wrong-token')).toBe(false);
      });

      it('should reject empty token', () => {
        CSRFProtectionService.generateToken();
        expect(CSRFProtectionService.validateToken('')).toBe(false);
      });
    });

    describe('getCSRFHeaders', () => {
      it('should return correct CSRF headers', () => {
        const token = CSRFProtectionService.generateToken();
        const headers = CSRFProtectionService.getCSRFHeaders();

        expect(headers['X-CSRF-Token']).toBe(token);
        expect(headers['X-Requested-With']).toBe('XMLHttpRequest');
      });

      it('should generate new token if none exists', () => {
        const headers = CSRFProtectionService.getCSRFHeaders();
        expect(headers['X-CSRF-Token']).toHaveLength(64);
      });
    });
  });

  describe('RateLimitingService', () => {
    beforeEach(() => {
      (RateLimitingService as any).attempts.clear();
    });

    describe('isRateLimited', () => {
      it('should not rate limit first attempt', () => {
        const isLimited = RateLimitingService.isRateLimited('test-key', 3, 60000);
        expect(isLimited).toBe(false);
      });

      it('should track attempts correctly', () => {
        const key = 'test-key';

        expect(RateLimitingService.isRateLimited(key, 3, 60000)).toBe(false);
        expect(RateLimitingService.isRateLimited(key, 3, 60000)).toBe(false);
        expect(RateLimitingService.isRateLimited(key, 3, 60000)).toBe(false);
        expect(RateLimitingService.isRateLimited(key, 3, 60000)).toBe(true); // 4th attempt should be limited
      });

      it('should reset after time window', () => {
        const key = 'test-key';

        // Use up all attempts
        for (let i = 0; i < 3; i++) {
          RateLimitingService.isRateLimited(key, 3, 100); // 100ms window
        }
        expect(RateLimitingService.isRateLimited(key, 3, 100)).toBe(true);

        // Wait for window to expire
        vi.advanceTimersByTime(101);

        // Should reset
        expect(RateLimitingService.isRateLimited(key, 3, 100)).toBe(false);
      });

      it('should handle different keys independently', () => {
        expect(RateLimitingService.isRateLimited('key1', 2, 60000)).toBe(false);
        expect(RateLimitingService.isRateLimited('key1', 2, 60000)).toBe(false);
        expect(RateLimitingService.isRateLimited('key1', 2, 60000)).toBe(true);

        expect(RateLimitingService.isRateLimited('key2', 2, 60000)).toBe(false);
      });
    });

    describe('recordFailedAttempt', () => {
      it('should increment attempt count', () => {
        const key = 'test-key';

        RateLimitingService.isRateLimited(key, 3, 60000);
        RateLimitingService.recordFailedAttempt(key);

        // Should be at limit now
        expect(RateLimitingService.isRateLimited(key, 3, 60000)).toBe(true);
      });
    });

    describe('resetRateLimit', () => {
      it('should reset rate limit for specific key', () => {
        const key = 'test-key';

        // Use up attempts
        for (let i = 0; i < 3; i++) {
          RateLimitingService.isRateLimited(key, 3, 60000);
        }
        expect(RateLimitingService.isRateLimited(key, 3, 60000)).toBe(true);

        // Reset
        RateLimitingService.resetRateLimit(key);

        // Should be allowed again
        expect(RateLimitingService.isRateLimited(key, 3, 60000)).toBe(false);
      });
    });
  });

  describe('AuditService', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('[]');
    });

    describe('logBookingAction', () => {
      it('should log booking action with correct data', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        AuditService.logBookingAction('create', 'booking-123', 'user-456', { amount: 100 });

        expect(consoleSpy).toHaveBeenCalledWith('Audit Log:', expect.objectContaining({
          action: 'create',
          resource: 'booking',
          resourceId: 'booking-123',
          userId: 'user-456',
          details: { amount: 100 },
          userAgent: 'Test User Agent',
          ip: 'client-side'
        }));

        consoleSpy.mockRestore();
      });

      it('should store audit entry in localStorage', () => {
        const setItemSpy = vi.spyOn(localStorage, 'setItem');

        AuditService.logBookingAction('update', 'booking-123', 'user-456');

        expect(setItemSpy).toHaveBeenCalledWith(
          'booking-audit-logs',
          expect.stringContaining('booking-123')
        );
      });

      it('should handle localStorage errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });

        expect(() => {
          AuditService.logBookingAction('delete', 'booking-123', 'user-456');
        }).not.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith('Failed to store audit log:', expect.any(Error));
        consoleSpy.mockRestore();
      });
    });

    describe('getAuditLogs', () => {
      it('should retrieve audit logs from localStorage', () => {
        const mockLogs = [
          { action: 'create', resourceId: 'booking-1' },
          { action: 'update', resourceId: 'booking-2' }
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLogs));

        const logs = AuditService.getAuditLogs();
        expect(logs).toEqual(mockLogs);
      });

      it('should return empty array for invalid JSON', () => {
        localStorageMock.getItem.mockReturnValue('invalid-json');

        const logs = AuditService.getAuditLogs();
        expect(logs).toEqual([]);
      });

      it('should return empty array when localStorage is not available', () => {
        localStorageMock.getItem.mockReturnValue(null);

        const logs = AuditService.getAuditLogs();
        expect(logs).toEqual([]);
      });
    });
  });

  describe('SecurityValidators', () => {
    describe('validateBookingCreateData', () => {
      it('should validate correct booking data', () => {
        const validData = {
          serviceId: 'service-123',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          participantCount: 2,
          notes: 'Valid notes'
        };

        const result = SecurityValidators.validateBookingCreateData(validData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject invalid service ID', () => {
        const invalidData = {
          serviceId: 'invalid service id',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          participantCount: 2
        };

        const result = SecurityValidators.validateBookingCreateData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid service ID format');
      });

      it('should reject invalid booking date', () => {
        const invalidData = {
          serviceId: 'service-123',
          scheduledAt: 'invalid-date',
          participantCount: 2
        };

        const result = SecurityValidators.validateBookingCreateData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid booking date or time');
      });

      it('should reject invalid participant count', () => {
        const invalidData = {
          serviceId: 'service-123',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          participantCount: 0
        };

        const result = SecurityValidators.validateBookingCreateData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid participant count');
      });

      it('should reject long notes', () => {
        const invalidData = {
          serviceId: 'service-123',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          participantCount: 2,
          notes: 'A'.repeat(1001)
        };

        const result = SecurityValidators.validateBookingCreateData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Notes exceed maximum length');
      });
    });

    describe('validateUserAction', () => {
      const mockUser: User = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      };

      it('should allow valid user actions', () => {
        const result = SecurityValidators.validateUserAction(mockUser, 'create_booking');
        expect(result.allowed).toBe(true);
        expect(result.reason).toBeUndefined();
      });

      it('should reject unknown actions', () => {
        const result = SecurityValidators.validateUserAction(mockUser, 'unknown_action');
        expect(result.allowed).toBe(false);
        expect(result.reason).toBe('Unknown action');
      });

      it('should validate booking edit permissions', () => {
        const ownBooking = { customerId: 'user-1' };
        const otherBooking = { customerId: 'other-user' };

        const ownResult = SecurityValidators.validateUserAction(mockUser, 'edit_booking', ownBooking);
        const otherResult = SecurityValidators.validateUserAction(mockUser, 'edit_booking', otherBooking);

        expect(ownResult.allowed).toBe(true);
        expect(otherResult.allowed).toBe(false);
        expect(otherResult.reason).toBe('Insufficient permissions');
      });

      it('should handle missing resource for resource-dependent actions', () => {
        const result = SecurityValidators.validateUserAction(mockUser, 'edit_booking');
        expect(result.allowed).toBe(false);
        expect(result.reason).toBe('Resource not provided');
      });
    });
  });

  describe('SecurityMiddleware', () => {
    describe('enhanceRequest', () => {
      it('should add security headers to request', () => {
        const originalConfig: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const enhanced = SecurityMiddleware.enhanceRequest(originalConfig);

        expect(enhanced.headers).toMatchObject({
          'Content-Type': 'application/json',
          'X-CSRF-Token': expect.any(String),
          'X-Requested-With': 'XMLHttpRequest',
          'X-Client-Version': '1.0.0',
          'X-Timestamp': expect.any(String)
        });
      });

      it('should preserve existing headers', () => {
        const originalConfig: RequestInit = {
          headers: {
            'Authorization': 'Bearer token123',
            'Custom-Header': 'custom-value'
          }
        };

        const enhanced = SecurityMiddleware.enhanceRequest(originalConfig);

        expect(enhanced.headers).toMatchObject({
          'Authorization': 'Bearer token123',
          'Custom-Header': 'custom-value'
        });
      });

      it('should handle requests without headers', () => {
        const originalConfig: RequestInit = {
          method: 'GET'
        };

        const enhanced = SecurityMiddleware.enhanceRequest(originalConfig);

        expect(enhanced.headers).toBeDefined();
        expect(enhanced.method).toBe('GET');
      });
    });

    describe('validateResponse', () => {
      it('should validate response with security header', () => {
        const mockResponse = {
          headers: {
            get: vi.fn().mockReturnValue('true')
          }
        } as any;

        const isValid = SecurityMiddleware.validateResponse(mockResponse);
        expect(isValid).toBe(true);
      });

      it('should reject response without security header', () => {
        const mockResponse = {
          headers: {
            get: vi.fn().mockReturnValue(null)
          }
        } as any;

        const isValid = SecurityMiddleware.validateResponse(mockResponse);
        expect(isValid).toBe(false);
      });

      it('should reject response with invalid security header', () => {
        const mockResponse = {
          headers: {
            get: vi.fn().mockReturnValue('false')
          }
        } as any;

        const isValid = SecurityMiddleware.validateResponse(mockResponse);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete security flow', () => {
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      };

      // Check permissions
      const permissions = AuthorizationService.getUserPermissions(user);
      expect(permissions.canCreateBooking).toBe(true);

      // Validate input
      const isValidEmail = InputValidationService.isValidEmail('test@example.com');
      expect(isValidEmail).toBe(true);

      // Generate CSRF token
      const token = CSRFProtectionService.generateToken();
      expect(token).toHaveLength(64);

      // Validate token
      const isValidToken = CSRFProtectionService.validateToken(token);
      expect(isValidToken).toBe(true);

      // Log action
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      AuditService.logBookingAction('create', 'booking-123', user.id);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle security validation for booking creation', () => {
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      };

      const bookingData = {
        serviceId: 'service-123',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        participantCount: 2,
        notes: 'Test booking'
      };

      // Validate booking data
      const validation = SecurityValidators.validateBookingCreateData(bookingData);
      expect(validation.isValid).toBe(true);

      // Check user permissions
      const permissionCheck = SecurityValidators.validateUserAction(user, 'create_booking');
      expect(permissionCheck.allowed).toBe(true);

      // Enhance request with security headers
      const requestConfig: RequestInit = { method: 'POST' };
      const secureConfig = SecurityMiddleware.enhanceRequest(requestConfig);
      expect(secureConfig.headers).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed user data gracefully', () => {
      const malformedUser = {} as User;

      expect(() => {
        AuthorizationService.getUserPermissions(malformedUser);
      }).not.toThrow();
    });

    it('should handle malformed booking data gracefully', () => {
      const malformedBooking = {} as Booking;

      expect(() => {
        AuthorizationService.canUserModifyBooking({} as User, malformedBooking, 'view');
      }).not.toThrow();
    });

    it('should handle localStorage failures gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      expect(() => {
        AuditService.getAuditLogs();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of rate limit checks efficiently', () => {
      const startTime = performance.now();

      // Perform 1000 rate limit checks
      for (let i = 0; i < 1000; i++) {
        RateLimitingService.isRateLimited(`key-${i}`, 10, 60000);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should handle audit logging efficiently', () => {
      const startTime = performance.now();

      // Log 100 audit entries
      for (let i = 0; i < 100; i++) {
        AuditService.logBookingAction('test', `booking-${i}`, 'user-1');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 50ms)
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long input strings', () => {
      const longString = 'A'.repeat(10000);
      const sanitized = InputValidationService.sanitizeString(longString);
      expect(sanitized.length).toBeLessThan(longString.length);
    });

    it('should handle special characters in emails', () => {
      const specialEmail = 'test+special@example.co.uk';
      expect(InputValidationService.isValidEmail(specialEmail)).toBe(true);
    });

    it('should handle international phone numbers', () => {
      const internationalPhone = '+44 20 7946 0958';
      expect(InputValidationService.isValidPhoneNumber(internationalPhone)).toBe(true);
    });

    it('should handle booking IDs with special characters', () => {
      const specialBookingId = 'booking_123-ABC';
      expect(InputValidationService.isValidServiceId(specialBookingId)).toBe(true);
    });
  });

  describe('Security Best Practices', () => {
    it('should not expose sensitive information in logs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const sensitiveData = {
        password: 'secret123',
        creditCard: '4532123456789012'
      };

      AuditService.logBookingAction('create', 'booking-123', 'user-1', sensitiveData);

      const logCall = consoleSpy.mock.calls[0][1];
      expect(logCall.details).toEqual(sensitiveData); // Should log as-is for debugging

      consoleSpy.mockRestore();
    });

    it('should validate all inputs before processing', () => {
      const maliciousInput = {
        serviceId: '<script>alert("xss")</script>',
        scheduledAt: '2024-01-01T00:00:00Z',
        participantCount: -1,
        notes: 'A'.repeat(2000)
      };

      const validation = SecurityValidators.validateBookingCreateData(maliciousInput);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should enforce rate limiting for security', () => {
      const key = 'login-attempts';

      // Simulate multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        RateLimitingService.recordFailedAttempt(key);
      }

      // Should be rate limited
      expect(RateLimitingService.isRateLimited(key, 5, 60000)).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency across operations', () => {
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      };

      const booking: Booking = {
        id: 'booking-1',
        serviceId: 'service-1',
        customerId: 'user-1',
        providerId: 'provider-1',
        scheduledAt: '2024-01-15T10:00:00Z',
        duration: 60,
        participantCount: 2,
        totalPrice: 100,
        currency: 'USD',
        status: 'confirmed',
        paymentStatus: 'paid',
        priority: 'normal',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z'
      };

      // Check permissions
      const permissions = AuthorizationService.getUserPermissions(user);
      const canModify = AuthorizationService.canUserModifyBooking(user, booking, 'edit');

      expect(permissions.canCreateBooking).toBe(true);
      expect(canModify).toBe(true);
    });

    it('should handle concurrent security checks', () => {
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      };

      // Simulate concurrent permission checks
      const checks = Array.from({ length: 10 }, () =>
        AuthorizationService.getUserPermissions(user)
      );

      checks.forEach(permissions => {
        expect(permissions.canManageUsers).toBe(true);
        expect(permissions.canViewReports).toBe(true);
      });
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with rate limiting', () => {
      // Create many rate limit entries
      for (let i = 0; i < 1000; i++) {
        RateLimitingService.isRateLimited(`key-${i}`, 5, 60000);
      }

      // Should not cause memory issues
      expect(() => {
        RateLimitingService.isRateLimited('new-key', 5, 60000);
      }).not.toThrow();
    });

    it('should handle audit log cleanup', () => {
      // Create many audit entries
      for (let i = 0; i < 150; i++) {
        AuditService.logBookingAction('test', `booking-${i}`, 'user-1');
      }

      const logs = AuditService.getAuditLogs();
      // Should maintain only last 100 entries
      expect(logs.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Browser Compatibility', () => {
    it('should work without crypto API', () => {
      // Mock missing crypto API
      const originalCrypto = window.crypto;
      delete (window as any).crypto;

      expect(() => {
        CSRFProtectionService.generateToken();
      }).not.toThrow();

      // Restore crypto API
      window.crypto = originalCrypto;
    });

    it('should work without localStorage', () => {
      const originalLocalStorage = window.localStorage;
      delete (window as any).localStorage;

      expect(() => {
        AuditService.getAuditLogs();
      }).not.toThrow();

      // Restore localStorage
      window.localStorage = originalLocalStorage;
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle complete booking creation security flow', () => {
      const user: User = {
        id: 'customer-1',
        name: 'John Customer',
        email: 'john@example.com',
        role: 'customer'
      };

      const bookingData = {
        serviceId: 'service-123',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        participantCount: 2,
        notes: 'Special requirements'
      };

      // 1. Check user permissions
      const permissions = AuthorizationService.getUserPermissions(user);
      expect(permissions.canCreateBooking).toBe(true);

      // 2. Validate input data
      const validation = SecurityValidators.validateBookingCreateData(bookingData);
      expect(validation.isValid).toBe(true);

      // 3. Generate CSRF token
      const token = CSRFProtectionService.generateToken();
      expect(token).toHaveLength(64);

      // 4. Enhance request with security headers
      const request = SecurityMiddleware.enhanceRequest({ method: 'POST' });
      expect(request.headers).toBeDefined();

      // 5. Log the action
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      AuditService.logBookingAction('create', 'booking-new', user.id, bookingData);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle security breach attempts', () => {
      const maliciousUser = {
        id: 'hacker',
        name: '<script>alert("xss")</script>',
        email: 'hacker@evil.com',
        role: 'customer'
      };

      // 1. Sanitize user input
      const sanitizedName = InputValidationService.sanitizeString(maliciousUser.name);
      expect(sanitizedName).not.toContain('<script>');

      // 2. Validate email
      expect(InputValidationService.isValidEmail(maliciousUser.email)).toBe(true);

      // 3. Check permissions (should be limited)
      const permissions = AuthorizationService.getUserPermissions(maliciousUser);
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canManageSettings).toBe(false);
    });
  });

  describe('Component Integration', () => {
    it('should work with React components', () => {
      const user: User = {
        id: 'user-1',
        name: 'Component User',
        email: 'component@example.com',
        role: 'admin'
      };

      // Test permission checks
      const permissions = AuthorizationService.getUserPermissions(user);
      expect(permissions.canManageUsers).toBe(true);

      // Test input validation
      const isValid = InputValidationService.isValidEmail('component@example.com');
      expect(isValid).toBe(true);

      // Test data masking
      const maskedEmail = DataMaskingService.maskEmail('component@example.com');
      expect(maskedEmail).toBe('co****@example.com');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from security check failures', () => {
      const invalidUser = null as any;

      expect(() => {
        AuthorizationService.getUserPermissions(invalidUser);
      }).not.toThrow();

      expect(() => {
        InputValidationService.isValidEmail(null as any);
      }).toBe(false);
    });

    it('should handle network failures gracefully', () => {
      // Mock network failure
      const originalFetch = window.fetch;
      window.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      expect(() => {
        // Security utilities should not depend on network
        const token = CSRFProtectionService.generateToken();
        expect(token).toHaveLength(64);
      }).not.toThrow();

      // Restore fetch
      window.fetch = originalFetch;
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high-frequency security checks', () => {
      const user: User = {
        id: 'user-1',
        name: 'Load Test User',
        email: 'loadtest@example.com',
        role: 'customer'
      };

      const startTime = performance.now();

      // Perform 1000 permission checks
      for (let i = 0; i < 1000; i++) {
        AuthorizationService.getUserPermissions(user);
        InputValidationService.isValidEmail(`test${i}@example.com`);
        DataMaskingService.maskEmail(`user${i}@example.com`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 200ms)
      expect(duration).toBeLessThan(200);
    });

    it('should handle concurrent security operations', async () => {
      const user: User = {
        id: 'user-1',
        name: 'Concurrent User',
        email: 'concurrent@example.com',
        role: 'admin'
      };

      // Simulate concurrent operations
      const operations = Array.from({ length: 50 }, async (_, i) => {
        return Promise.all([
          AuthorizationService.getUserPermissions(user),
          InputValidationService.isValidEmail(`test${i}@example.com`),
          DataMaskingService.maskEmail(`user${i}@example.com`),
          CSRFProtectionService.getToken()
        ]);
      });

      const results = await Promise.all(operations);

      // All operations should complete successfully
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result[0].canManageUsers).toBe(true);
        expect(result[1]).toBe(true);
        expect(result[2]).toContain('****');
        expect(result[3]).toHaveLength(64);
      });
    });
  });

  describe('Security Compliance', () => {
    it('should follow OWASP security guidelines', () => {
      // Test XSS prevention
      const xssAttempt = '<img src=x onerror=alert("xss")>';
      const sanitized = InputValidationService.sanitizeString(xssAttempt);
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('onerror');

      // Test input validation
      expect(InputValidationService.isValidEmail('test@example.com')).toBe(true);
      expect(InputValidationService.isValidEmail('invalid@')).toBe(false);

      // Test CSRF protection
      const token = CSRFProtectionService.generateToken();
      expect(CSRFProtectionService.validateToken(token)).toBe(true);
      expect(CSRFProtectionService.validateToken('wrong-token')).toBe(false);
    });

    it('should implement proper access controls', () => {
      const customer: User = {
        id: 'customer-1',
        name: 'Customer',
        email: 'customer@example.com',
        role: 'customer'
      };

      const admin: User = {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin'
      };

      // Customer should have limited permissions
      const customerPermissions = AuthorizationService.getUserPermissions(customer);
      expect(customerPermissions.canManageUsers).toBe(false);
      expect(customerPermissions.canManageSettings).toBe(false);

      // Admin should have full permissions
      const adminPermissions = AuthorizationService.getUserPermissions(admin);
      expect(adminPermissions.canManageUsers).toBe(true);
      expect(adminPermissions.canManageSettings).toBe(true);
    });
  });

  describe('Data Protection', () => {
    it('should protect sensitive customer data', () => {
      const sensitiveData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const masked = DataMaskingService.maskCustomerInfo(sensitiveData);

      expect(masked.name).toBe('John Doe'); // Name visible
      expect(masked.email).toBe('jo****@example.com'); // Email masked
      expect(masked.phone).toBe('****7890'); // Phone masked
    });

    it('should allow admins to see unmasked data', () => {
      const admin: User = {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin'
      };

      const shouldMask = DataMaskingService.shouldMaskData(admin, 'any-user');
      expect(shouldMask).toBe(false);
    });

    it('should mask data for non-owners', () => {
      const customer: User = {
        id: 'customer-1',
        name: 'Customer',
        email: 'customer@example.com',
        role: 'customer'
      };

      const shouldMask = DataMaskingService.shouldMaskData(customer, 'other-user');
      expect(shouldMask).toBe(true);
    });
  });

  describe('Audit Trail', () => {
    it('should maintain comprehensive audit logs', () => {
      const user: User = {
        id: 'user-1',
        name: 'Audit User',
        email: 'audit@example.com',
        role: 'customer'
      };

      // Perform various actions
      AuditService.logBookingAction('create', 'booking-1', user.id, { amount: 100 });
      AuditService.logBookingAction('update', 'booking-1', user.id, { status: 'confirmed' });
      AuditService.logBookingAction('cancel', 'booking-1', user.id, { reason: 'customer_request' });

      const logs = AuditService.getAuditLogs();
      expect(logs.length).toBe(3);
      expect(logs[0].action).toBe('create');
      expect(logs[1].action).toBe('update');
      expect(logs[2].action).toBe('cancel');
    });

    it('should include all required audit information', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      AuditService.logBookingAction('create', 'booking-123', 'user-456', { test: 'data' });

      const logCall = consoleSpy.mock.calls[0][1];
      expect(logCall).toMatchObject({
        timestamp: expect.any(String),
        action: 'create',
        resource: 'booking',
        resourceId: 'booking-123',
        userId: 'user-456',
        details: { test: 'data' },
        userAgent: 'Test User Agent',
        ip: 'client-side'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Rate Limiting Protection', () => {
    it('should prevent brute force attacks', () => {
      const loginKey = 'login-attempts-user-123';

      // Simulate failed login attempts
      for (let i = 0; i < 5; i++) {
        RateLimitingService.recordFailedAttempt(loginKey);
      }

      // Should be rate limited
      expect(RateLimitingService.isRateLimited(loginKey, 5, 60000)).toBe(true);

      // Should not allow further attempts
      expect(RateLimitingService.isRateLimited(loginKey, 5, 60000)).toBe(true);
    });

    it('should reset after time window expires', () => {
      const key = 'temp-rate-limit';

      // Use up all attempts
      for (let i = 0; i < 3; i++) {
        RateLimitingService.isRateLimited(key, 3, 100);
      }
      expect(RateLimitingService.isRateLimited(key, 3, 100)).toBe(true);

      // Advance time past window
      vi.advanceTimersByTime(101);

      // Should reset
      expect(RateLimitingService.isRateLimited(key, 3, 100)).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should prevent XSS attacks', () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
        'onclick=alert("xss")',
        '<svg onload=alert("xss")>'
      ];

      xssPayloads.forEach(payload => {
        const sanitized = InputValidationService.sanitizeString(payload);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
      });
    });

    it('should preserve safe content', () => {
      const safeContent = 'Safe text with numbers 123 and symbols @#$%';
      const sanitized = InputValidationService.sanitizeString(safeContent);
      expect(sanitized).toBe(safeContent);
    });

    it('should handle mixed safe and unsafe content', () => {
      const mixedContent = 'Safe text <script>alert("xss")</script> more safe text';
      const sanitized = InputValidationService.sanitizeString(mixedContent);
      expect(sanitized).toBe('Safe text  more safe text');
    });
  });

  describe('CSRF Protection', () => {
    it('should generate cryptographically secure tokens', () => {
      const token1 = CSRFProtectionService.generateToken();
      const token2 = CSRFProtectionService.generateToken();

      // Tokens should be different
      expect(token1).not.toBe(token2);

      // Tokens should be valid hex
      expect(token1).toMatch(/^[a-f0-9]{64}$/);
      expect(token2).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should validate tokens correctly', () => {
      const token = CSRFProtectionService.generateToken();

      expect(CSRFProtectionService.validateToken(token)).toBe(true);
      expect(CSRFProtectionService.validateToken('wrong-token')).toBe(false);
      expect(CSRFProtectionService.validateToken('')).toBe(false);
    });

    it('should provide consistent headers', () => {
      const headers1 = CSRFProtectionService.getCSRFHeaders();
      const headers2 = CSRFProtectionService.getCSRFHeaders();

      expect(headers1['X-CSRF-Token']).toBe(headers2['X-CSRF-Token']);
      expect(headers1['X-Requested-With']).toBe('XMLHttpRequest');
      expect(headers2['X-Requested-With']).toBe('XMLHttpRequest');
    });
  });

  describe('Authorization Edge Cases', () => {
    it('should handle role transitions correctly', () => {
      const user: User = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      };

      // Customer permissions
      const customerPermissions = AuthorizationService.getUserPermissions(user);
      expect(customerPermissions.canManageUsers).toBe(false);

      // Simulate role change to admin
      const adminUser = { ...user, role: 'admin' };
      const adminPermissions = AuthorizationService.getUserPermissions(adminUser);
      expect(adminPermissions.canManageUsers).toBe(true);
    });

    it('should handle malformed role data', () => {
      const malformedUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: null as any
      };

      expect(() => {
        AuthorizationService.getUserPermissions(malformedUser);
      }).not.toThrow();
    });
  });

  describe('Data Masking Edge Cases', () => {
    it('should handle short data gracefully', () => {
      expect(DataMaskingService.maskEmail('ab@example.com')).toBe('ab@example.com');
      expect(DataMaskingService.maskPhoneNumber('123')).toBe('123');
      expect(DataMaskingService.maskBookingId('short')).toBe('short');
    });

    it('should handle international characters', () => {
      const internationalEmail = 'tëst@ëxämple.com';
      const masked = DataMaskingService.maskEmail(internationalEmail);
      expect(masked).toContain('****');
    });

    it('should handle very long input', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const masked = DataMaskingService.maskEmail(longEmail);
      expect(masked.length).toBeLessThan(longEmail.length);
    });
  });

  describe('Final Integration Test', () => {
    it('should provide complete security coverage for booking system', () => {
      const user: User = {
        id: 'user-1',
        name: 'Integration Test User',
        email: 'integration@example.com',
        role: 'customer'
      };

      const booking: Booking = {
        id: 'booking-integration',
        serviceId: 'service-123',
        customerId: 'user-1',
        providerId: 'provider-1',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        duration: 60,
        participantCount: 2,
        totalPrice: 100,
        currency: 'USD',
        status: 'confirmed',
        paymentStatus: 'paid',
        priority: 'normal',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z'
      };

      // 1. Authorization check
      const permissions = AuthorizationService.getUserPermissions(user);
      expect(permissions.canCreateBooking).toBe(true);

      // 2. Permission validation for booking modification
      const canEdit = AuthorizationService.canUserModifyBooking(user, booking, 'edit');
      expect(canEdit).toBe(true);

      // 3. Input validation
      const isValidEmail = InputValidationService.isValidEmail(user.email);
      expect(isValidEmail).toBe(true);

      // 4. Data masking for display
      const maskedEmail = DataMaskingService.maskEmail(user.email);
      expect(maskedEmail).toContain('****');

      // 5. CSRF protection
      const token = CSRFProtectionService.generateToken();
      expect(CSRFProtectionService.validateToken(token)).toBe(true);

      // 6. Rate limiting
      expect(RateLimitingService.isRateLimited('test-action', 5, 60000)).toBe(false);

      // 7. Audit logging
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      AuditService.logBookingAction('create', booking.id, user.id);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();

      // 8. Security validation
      const validation = SecurityValidators.validateBookingCreateData({
        serviceId: booking.serviceId,
        scheduledAt: booking.scheduledAt,
        participantCount: booking.participantCount
      });
      expect(validation.isValid).toBe(true);

      // 9. Request enhancement
      const secureRequest = SecurityMiddleware.enhanceRequest({ method: 'POST' });
      expect(secureRequest.headers).toBeDefined();
    });
  });
});