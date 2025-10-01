using System;

namespace Shared.DTOs
{
    public class NotificationHistoryDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Type { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime SentAt { get; set; }
        public string Status { get; set; } = null!; // e.g., "Sent", "Failed", "Delivered"
        public Guid? RelatedEntityId { get; set; }
    }
}