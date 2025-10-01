using System;

namespace Shared.Models
{
    public class PaymentMethod
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid? TenantId { get; set; }
        public string Token { get; set; } = null!; // Tokenized payment method from gateway
        public string Type { get; set; } = null!; // e.g., "CreditCard", "DebitCard"
        public string LastFourDigits { get; set; } = null!;
        public int ExpiryMonth { get; set; }
        public int ExpiryYear { get; set; }
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual User? User { get; set; }
        public virtual Tenant? Tenant { get; set; }
    }
}