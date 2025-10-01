using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.Models
{
    public class NotificationPreference
    {
        public Guid Id { get; set; }
        [Required]
        public Guid UserId { get; set; }
        public bool EmailEnabled { get; set; } = true;
        public bool SmsEnabled { get; set; } = true;
        public bool PushEnabled { get; set; } = true;
        public string? PreferredTimezone { get; set; }
        public Guid TenantId { get; set; }

        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}