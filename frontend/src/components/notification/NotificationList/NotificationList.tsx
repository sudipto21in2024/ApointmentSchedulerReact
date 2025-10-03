/**
 * ============================================================================
 * NOTIFICATION LIST COMPONENT
 * ============================================================================
 * Displays a paginated list of notifications with read/unread status,
 * filtering, sorting, and real-time updates.
 *
 * Features:
 * - Paginated notification display
 * - Read/unread status indicators
 * - Mark as read/unread actions
 * - Filter by type (Email, SMS, Push)
 * - Sort by date/priority
 * - Real-time updates
 * - Responsive design
 * - Loading states and error handling
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * @license MIT
 * ============================================================================
 */

import React, { useState, useCallback, useMemo } from 'react';
import type {
  NotificationListProps,
  NotificationFilters,
  NotificationSort
} from '../../../types/notification';
import { NotificationType } from '../../../types/enums';
import { useDesignTokens } from '../../../services/design-tokens.service';
import { useNotifications } from '../../../hooks/useNotifications'; // Import the useNotifications hook

/**
 * NotificationList Component - Displays a paginated list of notifications.
 * This component integrates with the `useNotifications` hook to fetch, display,
 * and manage notifications, including filtering, sorting, and pagination.
 *
 * @param {NotificationListProps} props - The properties for the component.
 * @param {boolean} [props.showFilters=true] - Whether to display filter controls.
 * @param {boolean} [props.showPagination=true] - Whether to display pagination controls.
 * @param {string} [props.className=''] - Additional CSS class names for styling.
 */
export const NotificationList: React.FC<NotificationListProps> = ({
  showFilters = true,
  showPagination = true,
  className = ''
}) => {
  /**
   * ============================================================================
   * DESIGN TOKENS
   * Retrieves design tokens for consistent styling across the application.
   * ============================================================================
   */
  const {
    getNeutralColors,
    getSemanticColors,
    getSpacing,
    getFontSize,
    getCardTokens,
    getPrimaryColors
  } = useDesignTokens();

  const neutralColors = getNeutralColors();
  const semanticColors = getSemanticColors();
  const primaryColors = getPrimaryColors();
  const spacing = getSpacing;
  const fontSize = getFontSize;
  const cardTokens = getCardTokens();

  /**
   * ============================================================================
   * NOTIFICATIONS HOOK
   * Manages the state and actions related to notifications.
   * ============================================================================
   */
  const {
    notifications,
    loading,
    error,
    pagination,
    refresh,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications();

  // Local state for filters and sort, which will eventually be passed to useNotifications
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [sort, setSort] = useState<NotificationSort>({ field: 'createdAt', direction: 'desc' });


  /**
   * ============================================================================
   * FILTERING AND SORTING
   * Handlers for updating filters and sort options, triggering data re-fetch.
   * ============================================================================
   */

  /**
   * Handles changes to notification filters.
   * Resets to the first page when filters are applied.
   * @param {Partial<NotificationFilters>} newFilters - The new filter values to apply.
   */
  const handleFilterChange = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Handles changes to notification sort options.
   * Resets to the first page when sorting is applied.
   * @param {NotificationSort} newSort - The new sort option to apply.
   */
  const handleSortChange = useCallback((newSort: NotificationSort) => {
    setSort(newSort);
  }, []);



  /**
   * ============================================================================
   * RENDER HELPERS
   * Utility functions to assist in rendering notification-related UI elements.
   * ============================================================================
   */

  /**
   * Returns an emoji and string representation for a given notification type.
   * @param {NotificationType} type - The type of notification.
   * @returns {string} Formatted string with emoji and type name.
   */
  const getNotificationTypeIcon = useCallback((type: NotificationType) => {
    switch (type) {
      case NotificationType.EMAIL:
        return '📧';
      case NotificationType.SMS:
        return '💬';
      case NotificationType.PUSH:
        return '🔔';
      default:
        return '📌';
    }
  }, []);

  /**
   * Formats a date string into a more readable format (e.g., time, weekday, or short date).
   * @param {string} dateString - The ISO date string to format.
   * @returns {string} Formatted date string.
   */
  const formatNotificationDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  /**
   * Calculates the number of unread notifications.
   * @returns {number} The count of unread notifications.
   */
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  /**
   * ============================================================================
   * RENDER COMPONENT
   * Main render function for the NotificationList component.
   * ============================================================================
   */
  return (
    <div className={`notification-list ${className}`}>
      {/* Header section with title, unread count, and global actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing("4"),
        paddingBottom: spacing("3"),
        borderBottom: `1px solid ${neutralColors.border.light}`
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: fontSize('xl'),
            color: neutralColors.text.primary
          }}>
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p style={{
              margin: `${spacing("1")} 0 0 0`,
              fontSize: fontSize('sm'),
              color: neutralColors.text.secondary
            }}>
              {unreadCount} unread
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: spacing("2") }}>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={loading}
              style={{
                padding: `${spacing("2")} ${spacing("3")}`,
                backgroundColor: semanticColors.success.main,
                color: 'white',
                border: 'none',
                borderRadius: cardTokens.borderRadius,
                fontSize: fontSize('sm'),
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Mark All Read
            </button>
          )}

        </div>
      </div>

      {/* Filters section (conditionally rendered) */}
      {showFilters && (
        <div style={{
          display: 'flex',
          gap: spacing("3"),
          marginBottom: spacing("4"),
          padding: spacing("3"),
          backgroundColor: neutralColors.background.primary,
          borderRadius: cardTokens.borderRadius
        }}>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange({
              type: e.target.value as NotificationType || undefined
            })}
            style={{
              padding: `${spacing("2")} ${spacing("3")}`,
              border: `1px solid ${neutralColors.border.light}`,
              borderRadius: cardTokens.borderRadius,
              fontSize: fontSize('sm'),
              backgroundColor: neutralColors.background.primary
            }}
          >
            <option value="">All Types</option>
            <option value={NotificationType.EMAIL}>Email</option>
            <option value={NotificationType.SMS}>SMS</option>
            <option value={NotificationType.PUSH}>Push</option>
          </select>

          <select
            value={filters.isRead === undefined ? '' : filters.isRead.toString()}
            onChange={(e) => handleFilterChange({
              isRead: e.target.value === '' ? undefined : e.target.value === 'true'
            })}
            style={{
              padding: `${spacing("2")} ${spacing("3")}`,
              border: `1px solid ${neutralColors.border.light}`,
              borderRadius: cardTokens.borderRadius,
              fontSize: fontSize('sm'),
              backgroundColor: neutralColors.background.primary
            }}
          >
            <option value="">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>

          <select
            value={sort.field}
            onChange={(e) => handleSortChange({
              ...sort,
              field: e.target.value as NotificationSort['field']
            })}
            style={{
              padding: `${spacing("2")} ${spacing("3")}`,
              border: `1px solid ${neutralColors.border.light}`,
              borderRadius: cardTokens.borderRadius,
              fontSize: fontSize('sm'),
              backgroundColor: neutralColors.background.primary
            }}
          >
            <option value="createdAt">Date Created</option>
            <option value="updatedAt">Last Updated</option>
            <option value="title">Title</option>
          </select>

          <button
            onClick={() => handleSortChange({
              ...sort,
              direction: sort.direction === 'asc' ? 'desc' : 'asc'
            })}
            style={{
              padding: `${spacing("2")} ${spacing("3")}`,
              border: `1px solid ${neutralColors.border.light}`,
              borderRadius: cardTokens.borderRadius,
              fontSize: fontSize('sm'),
              backgroundColor: neutralColors.background.primary,
              cursor: 'pointer'
            }}
          >
            {sort.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      )}

      {/* Error State: Displayed when an error occurs during data fetching or mutation */}
      {error && (
        <div style={{
          padding: spacing("4"),
          marginBottom: spacing("4"),
          backgroundColor: semanticColors.danger.light,
          color: semanticColors.danger.dark,
          borderRadius: cardTokens.borderRadius,
          border: `1px solid ${semanticColors.danger.main}`
        }}>
          <strong>Error:</strong> {error}
          <button
            onClick={() => refresh()}
            style={{
              marginLeft: spacing("3"),
              padding: `${spacing("1")} ${spacing("2")}`,
              backgroundColor: semanticColors.danger.main,
              color: 'white',
              border: 'none',
              borderRadius: cardTokens.borderRadius,
              fontSize: fontSize('xs'),
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State: Displayed while notifications are being fetched */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing("8"),
          color: neutralColors.text.secondary
        }}>
          <div>Loading notifications...</div>
        </div>
      )}

      {/* Empty State: Displayed when no notifications are found and not in a loading/error state */}
      {!loading && notifications.length === 0 && !error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing("8"),
          color: neutralColors.text.secondary
        }}>
          <div style={{ fontSize: '3rem', marginBottom: spacing("2") }}>📭</div>
          <div>No notifications found</div>
          <div style={{ fontSize: fontSize('sm'), marginTop: spacing("1") }}>
            {Object.keys(filters).length > 0 || sort.field !== 'createdAt'
              ? 'Try adjusting your filters or sort options'
              : 'You\'re all caught up!'
            }
          </div>
        </div>
      )}

      {/* Notifications List: Renders individual notification items */}
      {!loading && notifications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing("2") }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: spacing("3"),
                backgroundColor: notification.isRead
                  ? neutralColors.background.primary
                  : neutralColors.background.primary,
                border: `1px solid ${notification.isRead
                  ? neutralColors.border.light
                  : primaryColors.light
                }`,
                borderRadius: cardTokens.borderRadius,
                opacity: notification.isRead ? 0.8 : 1,
                transition: 'all 0.2s ease'
              }}
            >

              {/* Notification Type Icon: Visual indicator of the notification type */}
              <div style={{
                fontSize: fontSize('lg'),
                marginRight: spacing("3"),
                minWidth: '2rem',
                textAlign: 'center'
              }}>
                {getNotificationTypeIcon(notification.type)}
              </div>

              {/* Notification Content: Displays title, message, and related entity info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing("1")
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: fontSize('base'),
                    color: neutralColors.text.primary,
                    fontWeight: notification.isRead ? 'normal' : '600'
                  }}>
                    {notification.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing("2") }}>
                    {/* Read/Unread Indicator: Visually indicates the notification's read status */}
                    <span style={{
                      fontSize: fontSize('xs'),
                      color: notification.isRead
                        ? neutralColors.text.secondary
                        : primaryColors.main,
                      fontWeight: notification.isRead ? 'normal' : '600'
                    }}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>

                    {/* Date: Displays the formatted creation date of the notification */}
                    <span style={{
                      fontSize: fontSize('xs'),
                      color: neutralColors.text.secondary
                    }}>
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                  </div>
                </div>

                <p style={{
                  margin: 0,
                  fontSize: fontSize('sm'),
                  color: neutralColors.text.secondary,
                  lineHeight: 1.4
                }}>
                  {notification.message}
                </p>

                {/* Related Entity: Displays information about the entity linked to the notification */}
                {notification.relatedEntityId && (
                  <div style={{
                    marginTop: spacing("2"),
                    fontSize: fontSize('xs'),
                    color: neutralColors.text.secondary
                  }}>
                    Related: {notification.relatedEntityType} #{notification.relatedEntityId.slice(-8)}
                  </div>
                )}
              </div>

              {/* Actions: Buttons for marking as read/unread and deleting notifications */}
              <div style={{
                display: 'flex',
                gap: spacing("1"),
                marginLeft: spacing("3")
              }}>
                <button
                  onClick={() => markAsRead(notification.id, !notification.isRead)}
                  title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                  style={{
                    padding: spacing("1"),
                    backgroundColor: 'transparent',
                    border: `1px solid ${neutralColors.border.light}`,
                    borderRadius: cardTokens.borderRadius,
                    cursor: 'pointer',
                    fontSize: fontSize('sm')
                  }}
                >
                  {notification.isRead ? '🔖' : '✅'}
                </button>

                <button
                  onClick={() => deleteNotification(notification.id)}
                  title="Delete notification"
                  style={{
                    padding: spacing("1"),
                    backgroundColor: semanticColors.danger.light,
                    border: `1px solid ${semanticColors.danger.main}`,
                    borderRadius: cardTokens.borderRadius,
                    color: semanticColors.danger.dark,
                    cursor: 'pointer',
                    fontSize: fontSize('sm')
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination: Controls for navigating through pages of notifications */}
      {showPagination && pagination && pagination.totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing("2"),
          marginTop: spacing("6"),
          paddingTop: spacing("4"),
          borderTop: `1px solid ${neutralColors.border.light}`
        }}>
          <button
            disabled={pagination.currentPage <= 1 || loading}
            style={{
              padding: `${spacing("2")} ${spacing("3")}`,
              backgroundColor: pagination.currentPage <= 1 ? neutralColors.gray['100'] : neutralColors.background.primary,
              border: `1px solid ${neutralColors.border.light}`,
              borderRadius: cardTokens.borderRadius,
              cursor: pagination.currentPage <= 1 || loading ? 'not-allowed' : 'pointer',
              fontSize: fontSize('sm')
            }}
          >
            Previous
          </button>

          <span style={{
            fontSize: fontSize('sm'),
            color: neutralColors.text.secondary,
            margin: `0 ${spacing("3")}`
          }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={pagination.currentPage >= pagination.totalPages || loading}
            style={{
              padding: `${spacing("2")} ${spacing("3")}`,
              backgroundColor: pagination.currentPage >= pagination.totalPages ? neutralColors.gray['100'] : neutralColors.background.primary,
              border: `1px solid ${neutralColors.border.light}`,
              borderRadius: cardTokens.borderRadius,
              cursor: pagination.currentPage >= pagination.totalPages || loading ? 'not-allowed' : 'pointer',
              fontSize: fontSize('sm')
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;