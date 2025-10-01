using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class UpdateNotificationPreferencesRequest
    {
        [Required]
        public bool EmailEnabled { get; set; }

        [Required]
        public bool SmsEnabled { get; set; }

        [Required]
        public bool PushEnabled { get; set; }

        public string? PreferredTimezone { get; set; }
    }
}