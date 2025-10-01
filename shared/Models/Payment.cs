using System;

namespace Shared.Models
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentMethod { get; set; } = null!;
        public string PaymentStatus { get; set; } = "Pending";
        public string? TransactionId { get; set; }
        public string? PaymentGateway { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal RefundAmount { get; set; }
        public Guid TenantId { get; set; }

        // Navigation properties
        public virtual Booking Booking { get; set; } = null!;
    }
}