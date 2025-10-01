using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class CreatePaymentMethodRequest
    {
        [Required]
        public string Type { get; set; } = null!; // e.g., "CreditCard"

        [Required]
        [RegularExpression(@"^\d{13,19}$", ErrorMessage = "Invalid card number")]
        public string CardNumber { get; set; } = null!;

        [Required]
        [Range(1, 12)]
        public int ExpiryMonth { get; set; }

        [Required]
        [Range(2023, 2050)]
        public int ExpiryYear { get; set; }

        [Required]
        [RegularExpression(@"^\d{3,4}$", ErrorMessage = "Invalid CVV")]
        public string CVV { get; set; } = null!;

        public string? CardholderName { get; set; }
    }
}