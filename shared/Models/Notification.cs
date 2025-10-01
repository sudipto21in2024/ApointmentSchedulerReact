using System;

namespace Shared.Models
{
    public class Notification
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Type { get; set; } = null!;
        public bool IsRead { get; set; }
        public string Status { get; set; } = "Pending"; // Add Status property
        public DateTime SentAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public Guid? RelatedEntityId { get; set; }
        public Guid TenantId { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
    }
}