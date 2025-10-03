/**
 * ============================================================================
 * USE NOTIFICATIONS HOOK
 * ============================================================================
 * Custom React hook for managing notification-related state and actions using
 * TanStack Query. Provides functionalities for fetching, marking as read,
 * deleting, and marking all as read for notifications.
 *
 * This hook abstracts the data fetching and mutation logic, making it easier
 * for components to interact with the notification API and react to changes.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * @license MIT
 * ============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApiService } from '../services/notification-api.service';
import type {
  Notification,
  NotificationFilters,
  NotificationListResponse,
  NotificationSort,
  PaginationMeta,
  UseNotificationsReturn
} from '../types/notification';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Options interface for the useNotifications hook.
 * Allows customization of initial filters, sort, and pagination parameters.
 */
interface UseNotificationsOptions {
  userId?: string; // Optional user ID if fetching notifications for a specific user
  initialFilters?: NotificationFilters;
  initialSort?: NotificationSort;
  initialPage?: number;
  initialPageSize?: number;
}

/**
 * Custom hook to manage notification data and interactions.
 * Integrates with `notificationApiService` and `TanStack Query` for data management.
 *
 * @param {UseNotificationsOptions} [options] - Configuration options for the hook.
 * @returns {UseNotificationsReturn} An object containing notifications, loading state, error, pagination, and action callbacks.
 */
export const useNotifications = (options?: UseNotificationsOptions): UseNotificationsReturn => {
  const queryClient = useQueryClient();
  const [filters, _setFilters] = useState<NotificationFilters>(options?.initialFilters || {});
  const [sort, _setSort] = useState<NotificationSort>(options?.initialSort || { field: 'createdAt', direction: 'desc' });
  const [page, _setPage] = useState<number>(options?.initialPage || 1);
  const [pageSize, _setPageSize] = useState<number>(options?.initialPageSize || 10);

  // TanStack Query key for notifications. This key is used to cache and invalidate query results.
  const notificationsQueryKey = ['notifications', filters, sort, page, pageSize, options?.userId];

  /**
   * ============================================================================
   * QUERY FOR FETCHING NOTIFICATIONS
   * Fetches a list of notifications based on current filters, sort, and pagination.
   * Caches results and manages loading/error states.
   * ============================================================================
   */
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationListResponse, Error>({
    queryKey: notificationsQueryKey,
    queryFn: async () => {
      // Calls the API service to get notifications
      const response = await notificationApiService.getNotifications(filters, sort, { page, pageSize });
      return response; // Returns the full response including data and meta
    },
    // Keeps previous data visible while new data is being fetched, improving UX during transitions.
    placeholderData: (previousData: NotificationListResponse | undefined) => previousData,
    select: (response) => {
      // Transforms the raw API response into the format expected by the hook's return value.
      return response;
    },
  });

  // Extracts the actual notification array from the response data, defaulting to an empty array.
  const notifications = data?.data || [];
  // Constructs the pagination metadata from the response, providing default values if not available.
  const paginationMeta: PaginationMeta = data?.meta || {
    currentPage: page,
    perPage: pageSize,
    total: 0, // Placeholder: In a real API, this would come from the API response
    totalPages: 0, // Placeholder: In a real API, this would come from the API response
    hasNextPage: false, // Placeholder: In a real API, this would come from the API response
    hasPreviousPage: false, // Placeholder: In a real API, this would come from the API response
  };
  // NOTE: The pagination metadata (total, totalPages, hasNextPage, hasPreviousPage)
  // should ideally be provided by the API response. For this implementation,
  // we are using placeholder values or deriving them if 'data.meta' is available.
  // Future enhancement: Ensure API provides comprehensive pagination metadata.

  /**
   * ============================================================================
   * MUTATIONS FOR UPDATING NOTIFICATIONS
   * Defines mutations for various actions (mark as read, delete, mark all as read).
   * Each mutation handles API calls, cache updates, and user feedback (toasts).
   * ============================================================================
   */

  /**
   * Mutation for marking a single notification as read/unread.
   * Updates the cache optimistically and shows toast notifications.
   */
  const markAsReadMutation = useMutation<Notification, Error, { notificationId: string; isRead: boolean }>({
    mutationFn: ({ notificationId, isRead }) =>
      notificationApiService.updateNotification(notificationId, { isRead }),
    onSuccess: (updatedNotification) => {
      // Optimistically update the cache to reflect the change immediately
      queryClient.setQueryData<NotificationListResponse | undefined>(notificationsQueryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)),
        };
      });
      toast.success(updatedNotification.isRead ? 'Notification marked as read!' : 'Notification marked as unread!');
    },
    onError: (err) => {
      toast.error(`Failed to update notification: ${err.message}`);
    },
  });

  /**
   * Mutation for deleting a single notification.
   * Updates the cache optimistically and shows toast notifications.
   */
  const deleteNotificationMutation = useMutation<void, Error, string>({
    mutationFn: (notificationId) => notificationApiService.deleteNotification(notificationId),
    onSuccess: (__, notificationId) => {
      // Optimistically update the cache by removing the deleted notification
      queryClient.setQueryData<NotificationListResponse | undefined>(notificationsQueryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((n) => n.id !== notificationId),
          meta: { ...old.meta, total: old.meta.total - 1 }, // Decrement total count
        };
      });
      toast.success('Notification deleted successfully!');
    },
    onError: (err) => {
      toast.error(`Failed to delete notification: ${err.message}`);
    },
  });

  /**
   * Mutation for marking all notifications as read.
   * Updates the cache optimistically and shows toast notifications.
   */
  const markAllAsReadMutation = useMutation<void, Error>({
    mutationFn: () => notificationApiService.markAllAsRead(),
    onSuccess: () => {
      // Optimistically update the cache by marking all notifications as read
      queryClient.setQueryData<NotificationListResponse | undefined>(notificationsQueryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((n) => ({ ...n, isRead: true })),
        };
      });
      toast.success('All notifications marked as read!');
    },
    onError: (err) => {
      toast.error(`Failed to mark all as read: ${err.message}`);
    },
  });

  /**
   * ============================================================================
   * CALLBACKS FOR COMPONENT INTERACTION
   * Provides stable callback functions for components to interact with the hook.
   * ============================================================================
   */

  /**
   * Marks a specific notification as read or unread.
   * @param {string} notificationId - The ID of the notification to update.
   * @param {boolean} isRead - The new read status.
   */
  const markAsRead = useCallback(
    async (notificationId: string, isRead: boolean) => {
      await markAsReadMutation.mutateAsync({ notificationId, isRead });
    },
    [markAsReadMutation]
  );

  /**
   * Deletes a specific notification.
   * @param {string} notificationId - The ID of the notification to delete.
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      await deleteNotificationMutation.mutateAsync(notificationId);
    },
    [deleteNotificationMutation]
  );

  /**
   * Marks all notifications for the current user as read.
   */
  const markAllAsRead = useCallback(
    async () => {
      await markAllAsReadMutation.mutateAsync();
    },
    [markAllAsReadMutation]
  );

  /**
   * Refreshes the list of notifications by re-fetching data from the API.
   */
  const refresh = useCallback(
    () => refetch(),
    [refetch]
  );

  /**
   * Placeholder for loading more notifications (e.g., for infinite scrolling or next page).
   * Currently logs a warning as full pagination logic is not yet implemented in the API.
   */
  const loadMore = useCallback(
    async () => {
      // This logic assumes the API returns total and totalPages
      console.warn('loadMore not fully implemented without API pagination meta');
      // Future enhancement: Increment 'page' and trigger a new fetch/append data.
    },
    []
  );

  return {
    notifications,
    loading: isLoading,
    error: error ? error.message : null,
    pagination: paginationMeta,
    refresh,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    loadMore,
  };
};

export default useNotifications;