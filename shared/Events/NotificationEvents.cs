using System;

namespace Shared.Events
{
    /// <summary>
    /// Event triggered when a notification is successfully sent to a user
    /// </summary>
    public class NotificationSentEvent : IEvent
    {
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }
        public Guid TenantId { get; set; }
        public string NotificationType { get; set; } = string.Empty; // Email, SMS, Push
        public string Channel { get; set; } = string.Empty; // Welcome, BookingConfirmation, Reminder, etc.
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public string Provider { get; set; } = string.Empty; // SendGrid, Twilio, etc.
    }

    /// <summary>
    /// Event triggered when a notification fails to be delivered to a user
    /// </summary>
    public class NotificationFailedEvent : IEvent
    {
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }
        public Guid TenantId { get; set; }
        public string NotificationType { get; set; } = string.Empty; // Email, SMS, Push
        public string Channel { get; set; } = string.Empty; // Welcome, BookingConfirmation, Reminder, etc.
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string FailureReason { get; set; } = string.Empty;
        public DateTime FailedAt { get; set; }
        public string Provider { get; set; } = string.Empty; // SendGrid, Twilio, etc.
    }
}