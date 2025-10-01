using System;

namespace Shared.DTOs
{
    public class PaymentMethodDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = null!;
        public string LastFourDigits { get; set; } = null!;
        public int ExpiryMonth { get; set; }
        public int ExpiryYear { get; set; }
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CardholderName { get; set; }
    }
}