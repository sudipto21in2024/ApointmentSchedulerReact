/**
 * ============================================================================
 * NOTIFICATION TYPE DEFINITIONS UNIT TESTS
 * ============================================================================
 * Unit tests for the Notification type definitions, specifically focusing on
 * the `isNotification` type guard and `NotificationType` enum.
 *
 * These tests ensure that the type guards correctly identify valid objects
 * and that the enum values are as expected.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * ============================================================================
 */

import { isNotification } from '../../types/notification';
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '../../types/enums';

describe('Notification Type Definitions', () => {
  /**
   * Test suite for NotificationType enum
   */
  describe('NotificationType', () => {
    it('should have correct enum values', () => {
      expect(NotificationType.EMAIL).toBe('Email');
      expect(NotificationType.SMS).toBe('SMS');
      expect(NotificationType.PUSH).toBe('Push');
    });
  });

  /**
   * Test suite for NotificationPriority enum
   */
  describe('NotificationPriority', () => {
    it('should have correct enum values', () => {
      expect(NotificationPriority.LOW).toBe('low');
      expect(NotificationPriority.NORMAL).toBe('normal');
      expect(NotificationPriority.HIGH).toBe('high');
      expect(NotificationPriority.URGENT).toBe('urgent');
    });
  });

  /**
   * Test suite for NotificationCategory enum
   */
  describe('NotificationCategory', () => {
    it('should have correct enum values', () => {
      expect(NotificationCategory.BOOKING).toBe('booking');
      expect(NotificationCategory.SERVICE).toBe('service');
      expect(NotificationCategory.PAYMENT).toBe('payment');
      expect(NotificationCategory.SYSTEM).toBe('system');
      expect(NotificationCategory.PROMOTIONAL).toBe('promotional');
    });
  });

  /**
   * Test suite for isNotification type guard
   */
  describe('isNotification type guard', () => {
    it('should return true for a valid Notification object', () => {
      const validNotification = {
        id: '123',
        userId: 'user-1',
        title: 'Test Notification',
        message: 'This is a test message.',
        type: NotificationType.EMAIL,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isNotification(validNotification)).toBe(true);
    });

    it('should return false if id is missing', () => {
      const invalidNotification = {
        userId: 'user-1',
        title: 'Test Notification',
        message: 'This is a test message.',
        type: NotificationType.EMAIL,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isNotification(invalidNotification)).toBe(false);
    });

    it('should return false if userId is missing', () => {
      const invalidNotification = {
        id: '123',
        title: 'Test Notification',
        message: 'This is a test message.',
        type: NotificationType.EMAIL,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isNotification(invalidNotification)).toBe(false);
    });

    it('should return false if title is missing', () => {
      const invalidNotification = {
        id: '123',
        userId: 'user-1',
        message: 'This is a test message.',
        type: NotificationType.EMAIL,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isNotification(invalidNotification)).toBe(false);
    });

    it('should return false if message is missing', () => {
      const invalidNotification = {
        id: '123',
        userId: 'user-1',
        title: 'Test Notification',
        type: NotificationType.EMAIL,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isNotification(invalidNotification)).toBe(false);
    });

    it('should return false if type is invalid', () => {
      const invalidNotification = {
        id: '123',
        userId: 'user-1',
        title: 'Test Notification',
        message: 'This is a test message.',
        type: 'INVALID_TYPE', // Invalid NotificationType
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isNotification(invalidNotification)).toBe(false);
    });

    it('should return false if isRead is missing', () => {
      const invalidNotification = {
        id: '123',
        userId: 'user-1',
        title: 'Test Notification',
        message: 'This is a test message.',
        type: NotificationType.EMAIL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isNotification(invalidNotification)).toBe(false);
    });

    it('should return false if createdAt is missing', () => {
      const invalidNotification = {
        id: '123',
        userId: 'user-1',
        title: 'Test Notification',
        message: 'This is a test message.',
        type: NotificationType.EMAIL,
        isRead: false,
        updatedAt: new Date().toISOString(),
      };
      expect(isNotification(invalidNotification)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isNotification(null)).toBe(false);
      expect(isNotification(undefined)).toBe(false);
      expect(isNotification('string')).toBe(false);
      expect(isNotification(123)).toBe(false);
      expect(isNotification([])).toBe(false);
    });
  });
});