using System;
using System.Collections.Generic;

namespace Shared.Models
{
    public class Booking
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid SlotId { get; set; }
        public Guid TenantId { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime BookingDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? Notes { get; set; }
        public DateTime? CancelledAt { get; set; }
        public Guid? CancelledBy { get; set; }

        // Navigation properties
        public virtual User Customer { get; set; } = null!;
        public virtual Service Service { get; set; } = null!;
        public virtual Slot Slot { get; set; } = null!;
        public virtual User? CancelledByUser { get; set; }
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public virtual ICollection<BookingHistory> History { get; set; } = new List<BookingHistory>();
    }
}