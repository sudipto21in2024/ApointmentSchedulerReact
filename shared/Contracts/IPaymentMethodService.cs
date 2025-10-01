using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.DTOs;

namespace Shared.Contracts
{
    /// <summary>
    /// Interface for payment method management operations
    /// </summary>
    public interface IPaymentMethodService
    {
        /// <summary>
        /// Gets all payment methods for a user or tenant
        /// </summary>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <returns>List of payment methods</returns>
        Task<IEnumerable<PaymentMethodDto>> GetPaymentMethodsAsync(Guid? userId, Guid? tenantId);

        /// <summary>
        /// Adds a new payment method
        /// </summary>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <param name="request">Payment method creation request</param>
        /// <returns>Created payment method</returns>
        Task<PaymentMethodDto> AddPaymentMethodAsync(Guid? userId, Guid? tenantId, CreatePaymentMethodRequest request);

        /// <summary>
        /// Deletes a payment method
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        Task DeletePaymentMethodAsync(Guid id, Guid? userId, Guid? tenantId);

        /// <summary>
        /// Sets a payment method as default
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        Task SetDefaultPaymentMethodAsync(Guid id, Guid? userId, Guid? tenantId);

        /// <summary>
        /// Updates a payment method
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <param name="request">Update request</param>
        Task UpdatePaymentMethodAsync(Guid id, Guid? userId, Guid? tenantId, UpdatePaymentMethodRequest request);
    }
}