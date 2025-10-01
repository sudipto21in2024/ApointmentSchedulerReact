using System;
using Shared.Events; // Assuming IEvent is in Shared.Events

namespace Shared.Events
{
    public class TemplateNotificationEvent : IEvent
    {
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }
        public string TemplateName { get; set; } = null!;
        public string RecipientEmail { get; set; } = null!;
        public object TemplateModel { get; set; } = null!; // Generic model for template data
        public DateTime Timestamp { get; set; }
    }
}