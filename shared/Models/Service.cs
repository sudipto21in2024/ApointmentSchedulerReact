using System;
using System.Collections.Generic;

namespace Shared.Models
{
    public class Service
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public Guid CategoryId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public int Duration { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public bool IsActive { get; set; }
        public Enums.ServiceStatus Status { get; set; } = Enums.ServiceStatus.Pending; // Default status
        public string? RejectionReason { get; set; } // New property for rejection reason
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsFeatured { get; set; }
        public int MaxBookingsPerDay { get; set; }

        // Navigation properties
        public virtual ServiceCategory Category { get; set; } = null!;
        public virtual User Provider { get; set; } = null!;
        public virtual ICollection<Slot> Slots { get; set; } = new List<Slot>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}