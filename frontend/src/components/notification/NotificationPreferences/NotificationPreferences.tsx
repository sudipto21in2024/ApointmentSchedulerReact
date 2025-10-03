/**
 * ============================================================================
 * NOTIFICATION PREFERENCES COMPONENT
 * ============================================================================
 * Allows users to view and manage their notification preferences, including
 * enabling/disabling email, SMS, and push notifications.
 *
 * Features:
 * - Displays current notification preferences.
 * - Provides toggle switches for different notification types.
 * - Integrates with API to save updated preferences.
 * - Handles loading and error states.
 * - Responsive design.
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-03
 * @license MIT
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import type {
  NotificationPreference,
  NotificationPreferencesProps,
  UpdateNotificationPreferencesRequest
} from '../../../types/notification';
import { useDesignTokens } from '../../../services/design-tokens.service';
import { useNotificationPreferences } from '../../../hooks/useNotificationPreferences'; // Import the useNotificationPreferences hook

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onPreferencesUpdate,
  onCancel,
  editMode: initialEditMode = false,
  onEditModeToggle,
}) => {
  // Assuming userId is available from an AuthContext or similar for the current user
  const currentUserId = 'some-hardcoded-user-id'; // Replace with actual user ID from AuthContext

  const [editMode, setEditMode] = useState<boolean>(initialEditMode);

  // Use the hook to manage notification preferences state
  const {
    preferences,
    loading,
    error,
    updatePreferences: updatePreferencesHook,
    refresh,
  } = useNotificationPreferences({ userId: currentUserId });

  // Internal state to hold changes before saving
  const [localPreferences, setLocalPreferences] = useState<NotificationPreference | null>(null);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

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

  /**
   * ============================================================================
   * FORM HANDLING
   * Handlers for managing form state and submission.
   * ============================================================================
   */
  /**
   * Handles toggling the state of a specific notification preference (e.g., emailEnabled).
   * Updates the local state of preferences.
   * @param {keyof UpdateNotificationPreferencesRequest} type - The key of the preference to toggle.
   * @param {boolean} value - The new boolean value for the preference.
   */
  const handleToggleChange = useCallback((type: keyof UpdateNotificationPreferencesRequest, value: boolean) => {
    if (localPreferences) {
      setLocalPreferences(prev => prev ? { ...prev, [type]: value } : null);
    }
  }, [localPreferences]);

  /**
   * Handles the submission of the preferences form.
   * Calls the `updatePreferencesHook` to persist changes via the API.
   */
  const handleSubmit = useCallback(async () => {
    if (!localPreferences || !localPreferences.userId) return;

    try {
      const updateRequest: UpdateNotificationPreferencesRequest = {
        emailEnabled: localPreferences.emailEnabled,
        smsEnabled: localPreferences.smsEnabled,
        pushEnabled: localPreferences.pushEnabled,
        preferredTimezone: localPreferences.preferredTimezone,
      };
      await updatePreferencesHook(updateRequest);
      onPreferencesUpdate?.(updateRequest);
      setEditMode(false);
    } catch (err) {
      // Error handling is managed by the hook and toast, so we just log here.
      console.error('Error saving preferences in component:', err);
    }
  }, [localPreferences, updatePreferencesHook, onPreferencesUpdate]);

  /**
   * Handles the cancellation of editing preferences.
   * Reverts any unsaved changes by resetting local preferences to the fetched state.
   */
  const handleCancel = useCallback(() => {
    // Revert local changes by setting localPreferences back to the last fetched preferences.
    if (preferences) {
      setLocalPreferences(preferences);
    }
    setEditMode(false);
    onCancel?.();
  }, [preferences, onCancel]);

  return (
    <div className="notification-preferences-card" style={{
      backgroundColor: neutralColors.background.primary,
      borderRadius: cardTokens.borderRadius,
      padding: spacing("6"),
      boxShadow: cardTokens.shadow.base,
      color: neutralColors.text.primary,
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: spacing("4"),
        fontSize: fontSize('xl'),
        color: neutralColors.text.primary,
      }}>
        Notification Preferences
      </h2>

      {loading && (
        <div style={{ textAlign: 'center', padding: spacing("4") }}>Loading preferences...</div>
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

      {!loading && !error && localPreferences && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div style={{ marginBottom: spacing("4") }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: spacing("2"), cursor: editMode ? 'pointer' : 'default' }}>
              <input
                type="checkbox"
                checked={localPreferences.emailEnabled}
                onChange={(e) => handleToggleChange('emailEnabled', e.target.checked)}
                disabled={!editMode || loading}
                style={{ marginRight: spacing("2") }}
              />
              Email Notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: spacing("2"), cursor: editMode ? 'pointer' : 'default' }}>
              <input
                type="checkbox"
                checked={localPreferences.smsEnabled}
                onChange={(e) => handleToggleChange('smsEnabled', e.target.checked)}
                disabled={!editMode || loading}
                style={{ marginRight: spacing("2") }}
              />
              SMS Notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: editMode ? 'pointer' : 'default' }}>
              <input
                type="checkbox"
                checked={localPreferences.pushEnabled}
                onChange={(e) => handleToggleChange('pushEnabled', e.target.checked)}
                disabled={!editMode || loading}
                style={{ marginRight: spacing("2") }}
              />
              Push Notifications
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing("2"), marginTop: spacing("6") }}>
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
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
                  Cancel
                </button>
                <button
                  type="submit"
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
                  Save Preferences
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditMode(true);
                  onEditModeToggle?.();
                }}
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
                Edit Preferences
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default NotificationPreferences;