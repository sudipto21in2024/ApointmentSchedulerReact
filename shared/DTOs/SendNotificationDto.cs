using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class SendNotificationDto
    {
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public string Title { get; set; } = null!;
        [Required]
        public string Message { get; set; } = null!;
        [Required]
        public string Type { get; set; } = null!; // e.g., "email", "sms", "push"
        public Guid? RelatedEntityId { get; set; }
    }
}