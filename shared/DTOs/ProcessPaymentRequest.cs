using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for processing a payment
    /// </summary>
    public class ProcessPaymentRequest
    {
        /// <summary>
        /// The ID of the booking associated with this payment
        /// </summary>
        [Required]
        public Guid BookingId { get; set; }

        /// <summary>
        /// The ID of the customer making the payment
        /// </summary>
        [Required]
        public Guid CustomerId { get; set; }

        /// <summary>
        /// The ID of the service provider
        /// </summary>
        [Required]
        public Guid ProviderId { get; set; }

        /// <summary>
        /// The ID of the tenant
        /// </summary>
        [Required]
        public Guid TenantId { get; set; }

        /// <summary>
        /// The amount to be charged
        /// </summary>
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
        public decimal Amount { get; set; }

        /// <summary>
        /// The currency code (e.g., USD, EUR)
        /// </summary>
        [Required]
        [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be a 3-letter code")]
        public string Currency { get; set; } = "USD";

        /// <summary>
        /// The payment method (e.g., CreditCard, PayPal, BankTransfer)
        /// </summary>
        [Required]
        public string PaymentMethod { get; set; } = string.Empty;

        /// <summary>
        /// Optional payment token from the payment gateway
        /// </summary>
        public string? PaymentToken { get; set; }

        /// <summary>
        /// Optional description of the payment
        /// </summary>
        public string? Description { get; set; }
    }
}