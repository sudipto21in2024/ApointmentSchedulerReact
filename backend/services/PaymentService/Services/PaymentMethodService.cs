using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Shared.Models;
using Shared.DTOs;
using Shared.Contracts;

namespace PaymentService.Services
{
    /// <summary>
    /// Implementation of payment method management operations
    /// </summary>
    public class PaymentMethodService : Shared.Contracts.IPaymentMethodService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<PaymentMethodService> _logger;

        /// <summary>
        /// Constructor for PaymentMethodService
        /// </summary>
        /// <param name="dbContext">Database context</param>
        /// <param name="logger">Logger</param>
        public PaymentMethodService(ApplicationDbContext dbContext, ILogger<PaymentMethodService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        /// <summary>
        /// Gets all payment methods for a user or tenant
        /// </summary>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <returns>List of payment methods</returns>
        public async Task<IEnumerable<PaymentMethodDto>> GetPaymentMethodsAsync(Guid? userId, Guid? tenantId)
        {
            _logger.LogInformation("Retrieving payment methods for user {UserId} or tenant {TenantId}", userId, tenantId);

            var query = _dbContext.PaymentMethods.AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(pm => pm.UserId == userId);
            }

            if (tenantId.HasValue)
            {
                query = query.Where(pm => pm.TenantId == tenantId);
            }

            var paymentMethods = await query
                .OrderByDescending(pm => pm.IsDefault)
                .ThenBy(pm => pm.CreatedAt)
                .ToListAsync();

            return paymentMethods.Select(MapToDto);
        }

        /// <summary>
        /// Adds a new payment method
        /// </summary>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <param name="request">Payment method creation request</param>
        /// <returns>Created payment method</returns>
        public async Task<PaymentMethodDto> AddPaymentMethodAsync(Guid? userId, Guid? tenantId, CreatePaymentMethodRequest request)
        {
            _logger.LogInformation("Adding payment method for user {UserId} or tenant {TenantId}", userId, tenantId);

            // Validate that either userId or tenantId is provided
            if (!userId.HasValue && !tenantId.HasValue)
            {
                throw new ArgumentException("Either userId or tenantId must be provided");
            }

            // Simulate tokenization with payment gateway
            var token = await TokenizePaymentMethodAsync(request);

            // Get existing payment methods to determine if this should be default
            var existingCount = await _dbContext.PaymentMethods
                .Where(pm => (userId.HasValue && pm.UserId == userId) || (tenantId.HasValue && pm.TenantId == tenantId))
                .CountAsync();

            var paymentMethod = new PaymentMethod
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TenantId = tenantId,
                Token = token,
                Type = request.Type,
                LastFourDigits = request.CardNumber[^4..],
                ExpiryMonth = request.ExpiryMonth,
                ExpiryYear = request.ExpiryYear,
                IsDefault = existingCount == 0, // Set as default if it's the first one
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.PaymentMethods.Add(paymentMethod);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Payment method added successfully with ID {Id}", paymentMethod.Id);

            return MapToDto(paymentMethod);
        }

        /// <summary>
        /// Deletes a payment method
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        public async Task DeletePaymentMethodAsync(Guid id, Guid? userId, Guid? tenantId)
        {
            _logger.LogInformation("Deleting payment method {Id} for user {UserId} or tenant {TenantId}", id, userId, tenantId);

            var paymentMethod = await _dbContext.PaymentMethods.FindAsync(id);
            if (paymentMethod == null)
            {
                throw new ArgumentException($"Payment method with ID {id} not found");
            }

            // Check ownership
            if ((userId.HasValue && paymentMethod.UserId != userId) ||
                (tenantId.HasValue && paymentMethod.TenantId != tenantId))
            {
                throw new UnauthorizedAccessException("Payment method does not belong to the specified user or tenant");
            }

            // If this is the default method, set another one as default
            if (paymentMethod.IsDefault)
            {
                var otherMethods = await _dbContext.PaymentMethods
                    .Where(pm => pm.Id != id &&
                                ((userId.HasValue && pm.UserId == userId) || (tenantId.HasValue && pm.TenantId == tenantId)))
                    .ToListAsync();

                if (otherMethods.Any())
                {
                    var newDefault = otherMethods.First();
                    newDefault.IsDefault = true;
                    newDefault.UpdatedAt = DateTime.UtcNow;
                    _dbContext.PaymentMethods.Update(newDefault);
                }
            }

            _dbContext.PaymentMethods.Remove(paymentMethod);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Payment method {Id} deleted successfully", id);
        }

        /// <summary>
        /// Sets a payment method as default
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        public async Task SetDefaultPaymentMethodAsync(Guid id, Guid? userId, Guid? tenantId)
        {
            _logger.LogInformation("Setting payment method {Id} as default for user {UserId} or tenant {TenantId}", id, userId, tenantId);

            var paymentMethod = await _dbContext.PaymentMethods.FindAsync(id);
            if (paymentMethod == null)
            {
                throw new ArgumentException($"Payment method with ID {id} not found");
            }

            // Check ownership
            if ((userId.HasValue && paymentMethod.UserId != userId) ||
                (tenantId.HasValue && paymentMethod.TenantId != tenantId))
            {
                throw new UnauthorizedAccessException("Payment method does not belong to the specified user or tenant");
            }

            // Unset other defaults
            var otherDefaults = await _dbContext.PaymentMethods
                .Where(pm => pm.Id != id &&
                            pm.IsDefault &&
                            ((userId.HasValue && pm.UserId == userId) || (tenantId.HasValue && pm.TenantId == tenantId)))
                .ToListAsync();

            foreach (var method in otherDefaults)
            {
                method.IsDefault = false;
                method.UpdatedAt = DateTime.UtcNow;
                _dbContext.PaymentMethods.Update(method);
            }

            // Set this as default
            paymentMethod.IsDefault = true;
            paymentMethod.UpdatedAt = DateTime.UtcNow;
            _dbContext.PaymentMethods.Update(paymentMethod);

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Payment method {Id} set as default successfully", id);
        }

        /// <summary>
        /// Updates a payment method
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <param name="request">Update request</param>
        public async Task UpdatePaymentMethodAsync(Guid id, Guid? userId, Guid? tenantId, UpdatePaymentMethodRequest request)
        {
            _logger.LogInformation("Updating payment method {Id} for user {UserId} or tenant {TenantId}", id, userId, tenantId);

            var paymentMethod = await _dbContext.PaymentMethods.FindAsync(id);
            if (paymentMethod == null)
            {
                throw new ArgumentException($"Payment method with ID {id} not found");
            }

            // Check ownership
            if ((userId.HasValue && paymentMethod.UserId != userId) ||
                (tenantId.HasValue && paymentMethod.TenantId != tenantId))
            {
                throw new UnauthorizedAccessException("Payment method does not belong to the specified user or tenant");
            }

            // Update fields
            if (request.ExpiryMonth.HasValue)
                paymentMethod.ExpiryMonth = request.ExpiryMonth.Value;

            if (request.ExpiryYear.HasValue)
                paymentMethod.ExpiryYear = request.ExpiryYear.Value;

            paymentMethod.UpdatedAt = DateTime.UtcNow;

            _dbContext.PaymentMethods.Update(paymentMethod);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Payment method {Id} updated successfully", id);
        }

        private async Task<string> TokenizePaymentMethodAsync(CreatePaymentMethodRequest request)
        {
            // Simulate payment gateway tokenization
            // In a real implementation, this would call Stripe, PayPal, etc.
            await Task.Delay(100); // Simulate network call

            // Generate a fake token
            return $"tok_{Guid.NewGuid().ToString().Replace("-", "")}";
        }

        private PaymentMethodDto MapToDto(PaymentMethod paymentMethod)
        {
            return new PaymentMethodDto
            {
                Id = paymentMethod.Id,
                Type = paymentMethod.Type,
                LastFourDigits = paymentMethod.LastFourDigits,
                ExpiryMonth = paymentMethod.ExpiryMonth,
                ExpiryYear = paymentMethod.ExpiryYear,
                IsDefault = paymentMethod.IsDefault,
                CreatedAt = paymentMethod.CreatedAt
            };
        }
    }
}