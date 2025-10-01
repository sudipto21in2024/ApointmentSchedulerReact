using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for creating a subscription
    /// </summary>
    public class CreateSubscriptionRequest
    {
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
        /// The ID of the service to subscribe to
        /// </summary>
        [Required]
        public Guid ServiceId { get; set; }

        /// <summary>
        /// The amount to be charged for the subscription
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
        /// The frequency of the subscription (e.g., Monthly, Yearly)
        /// </summary>
        [Required]
        public string Frequency { get; set; } = string.Empty;

        /// <summary>
        /// The payment method to use for the subscription
        /// </summary>
        [Required]
        public string PaymentMethod { get; set; } = string.Empty;

        /// <summary>
        /// Optional payment token from the payment gateway
        /// </summary>
        public string? PaymentToken { get; set; }

        /// <summary>
        /// Optional description of the subscription
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// The start date of the subscription
        /// </summary>
        [Required]
        public DateTime StartDate { get; set; }

        /// <summary>
        /// The end date of the subscription (optional for ongoing subscriptions)
        /// </summary>
        public DateTime? EndDate { get; set; }
    }
}