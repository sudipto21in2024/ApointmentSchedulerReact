using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class UpdatePaymentMethodRequest
    {
        [Range(1, 12)]
        public int? ExpiryMonth { get; set; }

        [Range(2023, 2050)]
        public int? ExpiryYear { get; set; }

        public string? CardholderName { get; set; }
    }
}