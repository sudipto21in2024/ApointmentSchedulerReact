using System;
using System.Threading.Tasks;
using Shared.DTOs;
using Shared.Models;

namespace PaymentService.Services
{
    /// <summary>
    /// Interface for payment service operations
    /// </summary>
    public interface IPaymentService
    {
        /// <summary>
        /// Processes a payment for a booking
        /// </summary>
        /// <param name="request">Payment processing request</param>
        /// <returns>Payment details</returns>
        Task<PaymentDetails> ProcessPaymentAsync(ProcessPaymentRequest request);

        /// <summary>
        /// Refunds a payment
        /// </summary>
        /// <param name="request">Refund request</param>
        /// <returns>Updated payment details</returns>
        Task<PaymentDetails> ProcessRefundAsync(RefundPaymentRequest request);

        /// <summary>
        /// Gets payment details by ID
        /// </summary>
        /// <param name="paymentId">Payment ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>Payment details</returns>
        Task<PaymentDetails> GetPaymentDetailsAsync(Guid paymentId, Guid tenantId);

        /// <summary>
        /// Creates a subscription
        /// </summary>
        /// <param name="request">Subscription creation request</param>
        /// <returns>Subscription details</returns>
        Task<PaymentDetails> CreateSubscriptionAsync(CreateSubscriptionRequest request);
    }
}