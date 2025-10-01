using System;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for payment details
    /// </summary>
    public class PaymentDetails
    {
        /// <summary>
        /// The unique identifier for the payment
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The ID of the booking associated with this payment
        /// </summary>
        public Guid BookingId { get; set; }

        /// <summary>
        /// The amount of the payment
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// The currency code (e.g., USD, EUR)
        /// </summary>
        public string Currency { get; set; } = "USD";

        /// <summary>
        /// The payment method used
        /// </summary>
        public string PaymentMethod { get; set; } = string.Empty;

        /// <summary>
        /// The current status of the payment
        /// </summary>
        public string PaymentStatus { get; set; } = string.Empty;

        /// <summary>
        /// The transaction ID from the payment gateway
        /// </summary>
        public string? TransactionId { get; set; }

        /// <summary>
        /// The payment gateway used
        /// </summary>
        public string? PaymentGateway { get; set; }

        /// <summary>
        /// The date and time when the payment was processed
        /// </summary>
        public DateTime? PaidAt { get; set; }

        /// <summary>
        /// The date and time when the payment was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// The date and time when the payment was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// The amount refunded (if any)
        /// </summary>
        public decimal RefundAmount { get; set; }

        /// <summary>
        /// The ID of the tenant
        /// </summary>
        public Guid TenantId { get; set; }
    }
}