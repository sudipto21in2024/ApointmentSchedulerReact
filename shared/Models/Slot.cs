using System;
using System.Collections.Generic;

namespace Shared.Models
{
    public class Slot
    {
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int MaxBookings { get; set; }
        public int AvailableBookings { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsRecurring { get; set; }
        public Guid TenantId { get; set; }

        // Navigation properties
        public virtual Service Service { get; set; } = null!;
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}