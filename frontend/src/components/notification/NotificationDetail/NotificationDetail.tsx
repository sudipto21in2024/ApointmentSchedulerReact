/**
 * ============================================================================
 * NOTIFICATION DETAIL COMPONENT
 * ============================================================================
 * Displays the detailed view of a single notification, including its content,
 * status, and actions like marking as read/unread or deleting.
 *
 * Features:
 * - Displays notification title, message, type, and timestamps.
 * - Shows read/unread status.
 * - Provides actions to mark the notification as read/unread.
 * - Provides an action to delete the notification.
 * - Utilizes a modal/dialog for display.
 * - Responsive design.
 * - Loading states and error handling.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * @license MIT
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationDetailProps } from '../../../types/notification';
import { notificationApiService } from '../../../services/notification-api.service';
import { useDesignTokens } from '../../../services/design-tokens.service';
import { NotificationType } from '../../../types/enums';

/**
 * NotificationDetail Component - Displays the detailed view of a single notification.
 * This component is typically used within a modal or a dedicated view to show
 * comprehensive information about a notification and allow user interactions.
 *
 * @param {NotificationDetailProps} props - The properties for the component.
 * @param {Notification | null} props.notification - The notification object to display.
 * @param {boolean} props.isOpen - Controls the visibility of the detail view.
 * @param {function} props.onClose - Callback function to close the detail view.
 * @param {function} [props.onNotificationUpdate] - Callback for when a notification's status is updated.
 * @param {function} [props.onNotificationDelete] - Callback for when a notification is deleted.
 * @param {boolean} [props.loading] - Initial loading state.
 */
export const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notification,
  isOpen,
  onClose,
  onNotificationUpdate,
  onNotificationDelete,
  loading: initialLoading = false,
}) => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(notification);
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string | null>(null);

  /**
   * ============================================================================
   * DESIGN TOKENS
   * ============================================================================
   */
  const {
    getNeutralColors,
    getSemanticColors,
    getSpacing,
    getFontSize,
    getCardTokens,
    getButtonTokens,
    getPrimaryColors // Added getPrimaryColors to destructuring
  } = useDesignTokens();

  const neutralColors = getNeutralColors();
  const semanticColors = getSemanticColors();
  const primaryColors = getPrimaryColors(); // Use the destructured hook version
  const spacing = getSpacing;
  const fontSize = getFontSize;
  const cardTokens = getCardTokens();
  const buttonTokens = getButtonTokens();

  useEffect(() => {
    setCurrentNotification(notification);
  }, [notification]);

  /**
   * ============================================================================
   * DATA LOADING
   * Fetches the full notification details if not already provided.
   * ============================================================================
   */
  /**
   * Fetches a notification by its ID.
   * @param {string} id - The unique identifier of the notification.
   */
  const fetchNotification = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedNotification = await notificationApiService.getNotificationById(id);
      setCurrentNotification(fetchedNotification);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notification details';
      setError(errorMessage);
      console.error('Error fetching notification details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && notification?.id && !currentNotification) {
      fetchNotification(notification.id);
    }
  }, [isOpen, notification, currentNotification, fetchNotification]);

  /**
   * ============================================================================
   * NOTIFICATION ACTIONS
   * Handles user interactions like marking as read/unread and deleting.
   * ============================================================================
   */
  /**
   * Handles marking the current notification as read or unread.
   * @param {boolean} isRead - The new read status for the notification.
   */
  const handleMarkAsRead = useCallback(async (isRead: boolean) => {
    if (!currentNotification) return;

    setLoading(true);
    setError(null);
    try {
      const updated = await notificationApiService.updateNotification(currentNotification.id, { isRead });
      setCurrentNotification(updated);
      onNotificationUpdate?.(currentNotification.id, { isRead });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notification status';
      setError(errorMessage);
      console.error('Error marking notification as read/unread:', err);
    } finally {
      setLoading(false);
    }
  }, [currentNotification, onNotificationUpdate]);

  /**
   * Handles the deletion of the current notification.
   */
  const handleDelete = useCallback(async () => {
    if (!currentNotification) return;

    setLoading(true);
    setError(null);
    try {
      await notificationApiService.deleteNotification(currentNotification.id);
      onNotificationDelete?.(currentNotification.id);
      onClose(); // Close the modal after deletion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
      console.error('Error deleting notification:', err);
    } finally {
      setLoading(false);
    }
  }, [currentNotification, onNotificationDelete, onClose]);

  /**
   * ============================================================================
   * RENDER HELPERS
   * Utility functions for rendering notification-related information.
   * ============================================================================
   */
  /**
   * Get notification type icon
   * @param {NotificationType} type - The type of notification.
   * @returns {string} An emoji and string representation of the notification type.
   */
  const getNotificationTypeIcon = useCallback((type: NotificationType) => {
    switch (type) {
      case NotificationType.EMAIL:
        return '📧 Email';
      case NotificationType.SMS:
        return '💬 SMS';
      case NotificationType.PUSH:
        return '🔔 Push';
      default:
        return '📌 General';
    }
  }, []);

  /**
   * Format notification date
   * @param {string} dateString - The date string to format.
   * @returns {string} A localized string representation of the date and time.
   */
  const formatDateTime = useCallback((dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // You might want to use a more specific format based on locale/preferences or a utility library like date-fns
    return date.toLocaleString();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="notification-detail-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="notification-detail-modal" style={{
        backgroundColor: neutralColors.background.primary,
        borderRadius: cardTokens.borderRadius,
        padding: spacing("6"),
        width: '90%',
        maxWidth: '600px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        color: neutralColors.text.primary,
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: spacing("3"),
            right: spacing("3"),
            background: 'none',
            border: 'none',
            fontSize: fontSize('xl'),
            cursor: 'pointer',
            color: neutralColors.text.secondary,
          }}
        >
          &times;
        </button>

        {loading && (
          <div style={{ textAlign: 'center', padding: spacing("4") }}>Loading notification details...</div>
        )}

        {error && (
          <div style={{
            padding: spacing("3"),
            backgroundColor: semanticColors.danger.light,
            color: semanticColors.danger.dark,
            borderRadius: cardTokens.borderRadius,
            border: `1px solid ${semanticColors.danger.main}`,
            marginBottom: spacing("4"),
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && currentNotification && (
          <div>
            <h2 style={{
              marginTop: 0,
              marginBottom: spacing("4"),
              fontSize: fontSize('2xl'),
              color: neutralColors.text.primary,
            }}>
              {currentNotification.title}
            </h2>

            <p style={{
              marginBottom: spacing("4"),
              fontSize: fontSize('base'),
              lineHeight: 1.6,
              color: neutralColors.text.secondary,
            }}>
              {currentNotification.message}
            </p>

            <div style={{ marginBottom: spacing("4"), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing("2") }}>
              <div>
                <strong>Type:</strong> <span style={{ color: neutralColors.text.secondary }}>{getNotificationTypeIcon(currentNotification.type)}</span>
              </div>
              <div>
                <strong>Status:</strong> <span style={{ color: currentNotification.isRead ? semanticColors.success.main : semanticColors.warning.main }}>
                  {currentNotification.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              <div>
                <strong>Sent At:</strong> <span style={{ color: neutralColors.text.secondary }}>{formatDateTime(currentNotification.sentAt || currentNotification.createdAt)}</span>
              </div>
              <div>
                <strong>Created At:</strong> <span style={{ color: neutralColors.text.secondary }}>{formatDateTime(currentNotification.createdAt)}</span>
              </div>
              {currentNotification.expiresAt && (
                <div>
                  <strong>Expires At:</strong> <span style={{ color: neutralColors.text.secondary }}>{formatDateTime(currentNotification.expiresAt)}</span>
                </div>
              )}
              {currentNotification.relatedEntityId && (
                <div>
                  <strong>Related Entity:</strong> <span style={{ color: neutralColors.text.secondary }}>{currentNotification.relatedEntityType} #{currentNotification.relatedEntityId.slice(-8)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing("2"), marginTop: spacing("6") }}>
              {!currentNotification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(true)}
                  disabled={loading}
                  style={{
                    height: buttonTokens.height.md,
                    padding: buttonTokens.padding.md,
                    borderRadius: buttonTokens.borderRadius,
                    fontWeight: buttonTokens.fontWeight,
                    transition: buttonTokens.transition,
                    backgroundColor: primaryColors.main,
                    color: 'white',
                    border: 'none',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    ...buttonTokens.focus,
                  }}
                >
                  Mark as Read
                </button>
              )}
              {currentNotification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(false)}
                  disabled={loading}
                  style={{
                    height: buttonTokens.height.md,
                    padding: buttonTokens.padding.md,
                    borderRadius: buttonTokens.borderRadius,
                    fontWeight: buttonTokens.fontWeight,
                    transition: buttonTokens.transition,
                    backgroundColor: neutralColors.background.secondary,
                    color: neutralColors.text.primary,
                    border: `1px solid ${neutralColors.border.light}`,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    ...buttonTokens.focus,
                  }}
                >
                  Mark as Unread
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  height: buttonTokens.height.md,
                  padding: buttonTokens.padding.md,
                  borderRadius: buttonTokens.borderRadius,
                  fontWeight: buttonTokens.fontWeight,
                  transition: buttonTokens.transition,
                  backgroundColor: semanticColors.danger.main,
                  color: 'white',
                  border: 'none',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  ...buttonTokens.focus,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;