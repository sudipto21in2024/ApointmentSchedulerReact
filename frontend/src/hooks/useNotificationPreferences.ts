/**
 * ============================================================================
 * USE NOTIFICATION PREFERENCES HOOK
 * ============================================================================
 * Custom React hook for managing user notification preferences using TanStack Query.
 * Provides functionalities for fetching and updating user preferences.
 *
 * This hook abstracts the data fetching and mutation logic for notification
 * preferences, making it easier for components to interact with the API.
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
  NotificationPreference,
  UpdateNotificationPreferencesRequest,
  UseNotificationPreferencesReturn
} from '../types/notification';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Options interface for the useNotificationPreferences hook.
 * Specifies the user ID for whom to manage preferences.
 */
interface UseNotificationPreferencesOptions {
  userId: string; // User ID is required to fetch/update preferences
}

/**
 * Custom hook to manage user notification preferences.
 * Integrates with `notificationApiService` and `TanStack Query` for data management.
 *
 * @param {UseNotificationPreferencesOptions} options - Configuration options for the hook.
 * @returns {UseNotificationPreferencesReturn} An object containing preferences, loading state, error, and action callbacks.
 */
export const useNotificationPreferences = (
  options: UseNotificationPreferencesOptions
): UseNotificationPreferencesReturn => {
  const queryClient = useQueryClient();
  const { userId } = options;

  // TanStack Query key for notification preferences, ensuring data is cached per user.
  const preferencesQueryKey = ['notificationPreferences', userId];

  /**
   * ============================================================================
   * QUERY FOR FETCHING NOTIFICATION PREFERENCES
   * Fetches the user's notification preferences.
   * ============================================================================
   */
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationPreference, Error>({
    queryKey: preferencesQueryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required to fetch notification preferences.');
      }
      return await notificationApiService.getNotificationPreferences(userId);
    },
    enabled: !!userId, // The query will only run if a userId is provided.
  });

  // Extracts the notification preferences data, defaulting to null if not yet fetched or an error occurred.
  const preferences = data || null;

  /**
   * ============================================================================
   * MUTATION FOR UPDATING NOTIFICATION PREFERENCES
   * Handles the update of user notification preferences via API.
   * Manages cache invalidation and user feedback.
   * ============================================================================
   */
  const updatePreferencesMutation = useMutation<
    NotificationPreference,
    Error,
    UpdateNotificationPreferencesRequest
  >({
    mutationFn: (updates) => {
      if (!userId) {
        throw new Error('User ID is required to update notification preferences.');
      }
      return notificationApiService.updateNotificationPreferences(userId, updates);
    },
    onSuccess: (updatedPreferences) => {
      // Upon successful update, the cache is immediately updated with the new preferences.
      queryClient.setQueryData(preferencesQueryKey, updatedPreferences);
      toast.success('Notification preferences updated successfully!');
    },
    onError: (err) => {
      toast.error(`Failed to update preferences: ${err.message}`);
    },
  });

  /**
   * ============================================================================
   * CALLBACKS FOR COMPONENT INTERACTION
   * ============================================================================
   */

  const updatePreferences = useCallback(
    async (updates: UpdateNotificationPreferencesRequest) => {
      await updatePreferencesMutation.mutateAsync(updates);
    },
    [updatePreferencesMutation]
  );

  const refresh = useCallback(
    async () => {
      await refetch();
    },
    [refetch]
  );

  return {
    preferences,
    loading: isLoading,
    error: error ? error.message : null,
    updatePreferences,
    refresh,
  };
};

export default useNotificationPreferences;