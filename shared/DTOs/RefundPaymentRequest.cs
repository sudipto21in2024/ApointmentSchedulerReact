using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for refunding a payment
    /// </summary>
    public class RefundPaymentRequest
    {
        /// <summary>
        /// The ID of the payment to refund
        /// </summary>
        [Required]
        public Guid PaymentId { get; set; }

        /// <summary>
        /// The ID of the booking associated with this payment
        /// </summary>
        [Required]
        public Guid BookingId { get; set; }

        /// <summary>
        /// The ID of the customer
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
        /// The amount to refund
        /// </summary>
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Refund amount must be greater than zero")]
        public decimal RefundAmount { get; set; }

        /// <summary>
        /// The currency code (e.g., USD, EUR)
        /// </summary>
        [Required]
        [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be a 3-letter code")]
        public string Currency { get; set; } = "USD";

        /// <summary>
        /// The reason for the refund
        /// </summary>
        [Required]
        public string RefundReason { get; set; } = string.Empty;
    }
}