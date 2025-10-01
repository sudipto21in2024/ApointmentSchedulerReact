using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class NotificationPreferenceDto
    {
        [Required]
        public Guid UserId { get; set; }
        public bool EmailEnabled { get; set; }
        public bool SmsEnabled { get; set; }
        public bool PushEnabled { get; set; }
        public string? PreferredTimezone { get; set; }
    }
}