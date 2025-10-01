using System;
using System.Threading.Tasks;
using Shared.DTOs;

namespace PaymentService.Validators
{
    /// <summary>
    /// Interface for payment validation operations
    /// </summary>
    public interface IPaymentValidator
    {
        /// <summary>
        /// Validates a payment processing request
        /// </summary>
        /// <param name="request">Payment processing request</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>Validation result</returns>
        Task<ValidationResult> ValidateProcessPaymentRequestAsync(ProcessPaymentRequest request, Guid tenantId);

        /// <summary>
        /// Validates a refund request
        /// </summary>
        /// <param name="request">Refund request</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>Validation result</returns>
        Task<ValidationResult> ValidateRefundPaymentRequestAsync(RefundPaymentRequest request, Guid tenantId);

        /// <summary>
        /// Validates a subscription creation request
        /// </summary>
        /// <param name="request">Subscription creation request</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>Validation result</returns>
        Task<ValidationResult> ValidateCreateSubscriptionRequestAsync(CreateSubscriptionRequest request, Guid tenantId);
    }
}