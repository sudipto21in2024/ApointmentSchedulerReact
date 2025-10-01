using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.Models;
using Shared.Events;

namespace ServiceManagementService.Services
{
    public interface IServiceService
    {
        /// <summary>
        /// Creates a new service
        /// </summary>
        /// <param name="request">Service creation request</param>
        /// <param name="userId">ID of the user creating the service</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Created service</returns>
        Task<Service> CreateServiceAsync(Shared.DTOs.CreateServiceRequest request, Guid userId, Guid tenantId);

        /// <summary>
        /// Gets a service by ID
        /// </summary>
        /// <param name="serviceId">Service ID</param>
        /// <param name="userId">ID of the user requesting the service</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Service details</returns>
        Task<Service> GetServiceByIdAsync(Guid serviceId, Guid userId, Guid tenantId);

        /// <summary>
        /// Updates an existing service
        /// </summary>
        /// <param name="serviceId">Service ID</param>
        /// <param name="request">Service update request</param>
        /// <param name="userId">ID of the user updating the service</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Updated service</returns>
        Task<Service> UpdateServiceAsync(Guid serviceId, Shared.DTOs.UpdateServiceRequest request, Guid userId, Guid tenantId);

        /// <summary>
        /// Deletes a service (soft delete)
        /// </summary>
        /// <param name="serviceId">Service ID</param>
        /// <param name="userId">ID of the user deleting the service</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if successful</returns>
        Task<bool> DeleteServiceAsync(Guid serviceId, Guid userId, Guid tenantId);

        /// <summary>
        /// Gets all services with optional filtering
        /// </summary>
        /// <param name="userId">ID of the user requesting services</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <param name="categoryId">Optional category filter</param>
        /// <param name="isActive">Optional active status filter</param>
        /// <returns>List of services</returns>
        Task<IEnumerable<Service>> GetServicesAsync(Guid userId, Guid tenantId, Guid? categoryId = null, bool? isActive = null);

        /// <summary>
        /// Gets all service categories
        /// </summary>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>List of service categories</returns>
        Task<IEnumerable<ServiceCategory>> GetServiceCategoriesAsync(Guid tenantId);

        /// <summary>
        /// Creates a new service category
        /// </summary>
        /// <param name="request">Category creation request</param>
        /// <param name="userId">ID of the user creating the category</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Created category</returns>
        Task<ServiceCategory> CreateServiceCategoryAsync(Shared.DTOs.CreateCategoryRequest request, Guid userId, Guid tenantId);

        /// <summary>
        /// Updates an existing service category
        /// </summary>
        /// <param name="categoryId">Category ID</param>
        /// <param name="request">Category update request</param>
        /// <param name="userId">ID of the user updating the category</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Updated category</returns>
        Task<ServiceCategory> UpdateServiceCategoryAsync(Guid categoryId, Shared.DTOs.UpdateCategoryRequest request, Guid userId, Guid tenantId);

        /// <summary>
        /// Deletes a service category
        /// </summary>
        /// <param name="categoryId">Category ID</param>
        /// <param name="userId">ID of the user deleting the category</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if successful</returns>
        Task<bool> DeleteServiceCategoryAsync(Guid categoryId, Guid userId, Guid tenantId);

        /// <summary>
        /// Approves a service listing.
        /// </summary>
        /// <param name="serviceId">ID of the service to approve.</param>
        /// <param name="adminId">ID of the administrator approving the service.</param>
        /// <param name="tenantId">ID of the tenant.</param>
        /// <returns>True if the service was approved successfully, otherwise false.</returns>
        Task<bool> ApproveServiceAsync(Guid serviceId, Guid adminId, Guid tenantId);

        /// <summary>
        /// Rejects a service listing.
        /// </summary>
        /// <param name="serviceId">ID of the service to reject.</param>
        /// <param name="adminId">ID of the administrator rejecting the service.</param>
        /// <param name="tenantId">ID of the tenant.</param>
        /// <param name="reason">Optional reason for rejection.</param>
        /// <returns>True if the service was rejected successfully, otherwise false.</returns>
        Task<bool> RejectServiceAsync(Guid serviceId, Guid adminId, Guid tenantId, string? reason);
    }

}