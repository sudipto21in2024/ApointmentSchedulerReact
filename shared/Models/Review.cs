using System;

namespace Shared.Models
{
    public class Review
    {
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        public Guid CustomerId { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public Guid TenantId { get; set; }

        // Navigation properties
        public virtual Service Service { get; set; } = null!;
        public virtual User Customer { get; set; } = null!;
    }
}