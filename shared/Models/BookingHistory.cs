using System;

namespace Shared.Models
{
    public class BookingHistory
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string? OldStatus { get; set; }
        public string NewStatus { get; set; } = null!;
        public Guid ChangedBy { get; set; }
        public string? ChangeReason { get; set; }
        public DateTime ChangedAt { get; set; }
        public string? Notes { get; set; }
        public Guid TenantId { get; set; }

        // Navigation properties
        public virtual Booking Booking { get; set; } = null!;
        public virtual User ChangedByUser { get; set; } = null!;
    }
}