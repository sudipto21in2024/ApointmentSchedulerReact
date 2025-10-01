using System;

namespace Shared.Events
{
    /// <summary>
    /// Event triggered when a payment is successfully processed
    /// </summary>
    public class PaymentProcessedEvent : IEvent
    {
        public Guid PaymentId { get; set; }
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentMethod { get; set; } = string.Empty; // CreditCard, PayPal, etc.
        public string TransactionId { get; set; } = string.Empty;
        public string PaymentGateway { get; set; } = string.Empty; // Stripe, PayPal, etc.
        public DateTime ProcessedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a payment is refunded to the customer
    /// </summary>
    public class PaymentRefundedEvent : IEvent
    {
        public Guid PaymentId { get; set; }
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public decimal RefundAmount { get; set; }
        public string Currency { get; set; } = "USD";
        public string RefundReason { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public DateTime RefundedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a payment processing attempt fails
    /// </summary>
    public class PaymentFailedEvent : IEvent
    {
        public Guid PaymentId { get; set; }
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentMethod { get; set; } = string.Empty;
        public string FailureReason { get; set; } = string.Empty;
        public DateTime FailedAt { get; set; }
    }
}