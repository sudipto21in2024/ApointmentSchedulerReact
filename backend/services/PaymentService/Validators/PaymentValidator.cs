using System;
using System.Threading.Tasks;
using Shared.Data;
using Shared.DTOs;
using Microsoft.EntityFrameworkCore;

namespace PaymentService.Validators
{
    /// <summary>
    /// Implementation of payment validation operations
    /// </summary>
    public class PaymentValidator : IPaymentValidator
    {
        private readonly ApplicationDbContext _dbContext;

        /// <summary>
        /// Constructor for PaymentValidator
        /// </summary>
        /// <param name="dbContext">Database context</param>
        public PaymentValidator(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Validates a payment processing request
        /// </summary>
        /// <param name="request">Payment processing request</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>Validation result</returns>
        public async Task<ValidationResult> ValidateProcessPaymentRequestAsync(ProcessPaymentRequest request, Guid tenantId)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate required fields
            if (request.BookingId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Booking ID is required");
            }

            if (request.CustomerId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Customer ID is required");
            }

            if (request.ProviderId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Provider ID is required");
            }

            if (request.TenantId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Tenant ID is required");
            }

            if (request.Amount <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Amount must be greater than zero");
            }

            if (string.IsNullOrEmpty(request.Currency))
            {
                result.IsValid = false;
                result.Errors.Add("Currency is required");
            }
            else if (request.Currency.Length != 3)
            {
                result.IsValid = false;
                result.Errors.Add("Currency must be a 3-letter code");
            }

            if (string.IsNullOrEmpty(request.PaymentMethod))
            {
                result.IsValid = false;
                result.Errors.Add("Payment method is required");
            }

            // Validate booking exists and belongs to tenant
            if (request.BookingId != Guid.Empty)
            {
                var booking = await _dbContext.Bookings
                    .FirstOrDefaultAsync(b => b.Id == request.BookingId && b.TenantId == tenantId);

                if (booking == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid booking ID or booking does not belong to the tenant");
                }
            }

            // Validate customer exists and belongs to tenant
            if (request.CustomerId != Guid.Empty)
            {
                var customer = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == request.CustomerId && u.TenantId == tenantId);

                if (customer == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid customer ID or customer does not belong to the tenant");
                }
            }

            // Validate provider exists and belongs to tenant
            if (request.ProviderId != Guid.Empty)
            {
                var provider = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == request.ProviderId && u.TenantId == tenantId);

                if (provider == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid provider ID or provider does not belong to the tenant");
                }
            }

            return result;
        }

        /// <summary>
        /// Validates a refund request
        /// </summary>
        /// <param name="request">Refund request</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>Validation result</returns>
        public async Task<ValidationResult> ValidateRefundPaymentRequestAsync(RefundPaymentRequest request, Guid tenantId)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate required fields
            if (request.PaymentId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Payment ID is required");
            }

            if (request.BookingId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Booking ID is required");
            }

            if (request.CustomerId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Customer ID is required");
            }

            if (request.ProviderId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Provider ID is required");
            }

            if (request.TenantId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Tenant ID is required");
            }

            if (request.RefundAmount <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Refund amount must be greater than zero");
            }

            if (string.IsNullOrEmpty(request.Currency))
            {
                result.IsValid = false;
                result.Errors.Add("Currency is required");
            }
            else if (request.Currency.Length != 3)
            {
                result.IsValid = false;
                result.Errors.Add("Currency must be a 3-letter code");
            }

            if (string.IsNullOrEmpty(request.RefundReason))
            {
                result.IsValid = false;
                result.Errors.Add("Refund reason is required");
            }

            // Validate payment exists and belongs to tenant
            if (request.PaymentId != Guid.Empty)
            {
                var payment = await _dbContext.Payments
                    .FirstOrDefaultAsync(p => p.Id == request.PaymentId && p.TenantId == tenantId);

                if (payment == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid payment ID or payment does not belong to the tenant");
                    return result; // Exit early if payment is not found
                }
                else
                {
                    // Check if payment is already refunded
                    if (payment.PaymentStatus == "Refunded")
                    {
                        result.IsValid = false;
                        result.Errors.Add("Payment has already been refunded");
                    }
                    // Check if payment is completed
                    else if (payment.PaymentStatus != "Completed")
                    {
                        result.IsValid = false;
                        result.Errors.Add("Payment must be completed to process a refund");
                    }
                    // Check if refund amount is not greater than payment amount
                    else if (request.RefundAmount > payment.Amount)
                    {
                        result.IsValid = false;
                        result.Errors.Add("Refund amount cannot be greater than the original payment amount");
                    }
                }
            }

            // Validate booking exists and belongs to tenant
            if (request.BookingId != Guid.Empty)
            {
                var booking = await _dbContext.Bookings
                    .FirstOrDefaultAsync(b => b.Id == request.BookingId && b.TenantId == tenantId);

                if (booking == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid booking ID or booking does not belong to the tenant");
                }
            }

            // Validate customer exists and belongs to tenant
            if (request.CustomerId != Guid.Empty)
            {
                var customer = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == request.CustomerId && u.TenantId == tenantId);

                if (customer == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid customer ID or customer does not belong to the tenant");
                }
            }

            // Validate provider exists and belongs to tenant
            if (request.ProviderId != Guid.Empty)
            {
                var provider = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == request.ProviderId && u.TenantId == tenantId);

                if (provider == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid provider ID or provider does not belong to the tenant");
                }
            }

            return result;
        }

        /// <summary>
        /// Validates a subscription creation request
        /// </summary>
        /// <param name="request">Subscription creation request</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>Validation result</returns>
        public async Task<ValidationResult> ValidateCreateSubscriptionRequestAsync(CreateSubscriptionRequest request, Guid tenantId)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate required fields
            if (request.CustomerId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Customer ID is required");
            }

            if (request.ProviderId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Provider ID is required");
            }

            if (request.TenantId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Tenant ID is required");
            }

            if (request.ServiceId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Service ID is required");
            }

            if (request.Amount <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Amount must be greater than zero");
            }

            if (string.IsNullOrEmpty(request.Currency))
            {
                result.IsValid = false;
                result.Errors.Add("Currency is required");
            }
            else if (request.Currency.Length != 3)
            {
                result.IsValid = false;
                result.Errors.Add("Currency must be a 3-letter code");
            }

            if (string.IsNullOrEmpty(request.Frequency))
            {
                result.IsValid = false;
                result.Errors.Add("Frequency is required");
            }

            if (string.IsNullOrEmpty(request.PaymentMethod))
            {
                result.IsValid = false;
                result.Errors.Add("Payment method is required");
            }

            if (request.StartDate == DateTime.MinValue)
            {
                result.IsValid = false;
                result.Errors.Add("Start date is required");
            }

            // Validate start date is not in the past
            if (request.StartDate.Date < DateTime.UtcNow.Date)
            {
                result.IsValid = false;
                result.Errors.Add("Start date cannot be in the past");
            }

            // Validate end date if provided
            if (request.EndDate.HasValue && request.EndDate.Value < request.StartDate)
            {
                result.IsValid = false;
                result.Errors.Add("End date must be after start date");
            }

            // Validate customer exists and belongs to tenant
            if (request.CustomerId != Guid.Empty)
            {
                var customer = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == request.CustomerId && u.TenantId == tenantId);

                if (customer == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid customer ID or customer does not belong to the tenant");
                }
            }

            // Validate provider exists and belongs to tenant
            if (request.ProviderId != Guid.Empty)
            {
                var provider = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == request.ProviderId && u.TenantId == tenantId);

                if (provider == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid provider ID or provider does not belong to the tenant");
                }
            }

            // Validate service exists and belongs to tenant
            if (request.ServiceId != Guid.Empty)
            {
                var service = await _dbContext.Services
                    .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantId);

                if (service == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid service ID or service does not belong to the tenant");
                }
            }

            return result;
        }
    }
}