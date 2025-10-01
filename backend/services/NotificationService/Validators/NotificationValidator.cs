using Shared.DTOs;
using System;
using System.Threading.Tasks;

namespace NotificationService.Validators
{
    public class NotificationValidator : INotificationValidator
    {
        public Task ValidateSendNotificationAsync(SendNotificationDto? notificationDto)
        {
            if (notificationDto == null)
            {
                throw new ArgumentNullException(nameof(notificationDto));
            }

            if (notificationDto.UserId == Guid.Empty)
            {
                throw new ArgumentException("User ID cannot be empty.", nameof(notificationDto.UserId));
            }

            if (string.IsNullOrWhiteSpace(notificationDto.Title))
            {
                throw new ArgumentException("Notification title cannot be empty.", nameof(notificationDto.Title));
            }

            if (string.IsNullOrWhiteSpace(notificationDto.Message))
            {
                throw new ArgumentException("Notification message cannot be empty.", nameof(notificationDto.Message));
            }

            if (string.IsNullOrWhiteSpace(notificationDto.Type))
            {
                throw new ArgumentException("Notification type cannot be empty.", nameof(notificationDto.Type));
            }

            // Additional validation for notification type, e.g., "email", "sms", "push"
            // You might want to have a predefined list of allowed types.
            // For now, we'll just check if it's not empty.

            return Task.CompletedTask;
        }

        public Task ValidateUpdateNotificationPreferencesAsync(NotificationPreferenceDto? preferencesDto)
        {
            if (preferencesDto == null)
            {
                throw new ArgumentNullException(nameof(preferencesDto));
            }

            if (preferencesDto.UserId == Guid.Empty)
            {
                throw new ArgumentException("User ID cannot be empty.", nameof(preferencesDto.UserId));
            }

            // No other specific validation rules for booleans or preferred timezone for now.

            return Task.CompletedTask;
        }
    }
}