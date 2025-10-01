using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.Models;
using Shared.DTOs;
using ServiceManagementService.Services;

namespace ServiceManagementService.Validators
{
    public interface IServiceValidator
    {
        /// <summary>
        /// Validates a service creation request
        /// </summary>
        /// <param name="request">Service creation request</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Validation result</returns>
        Task<Shared.DTOs.ValidationResult> ValidateCreateServiceRequestAsync(Shared.DTOs.CreateServiceRequest request, Guid tenantId);

        /// <summary>
        /// Validates a service update request
        /// </summary>
        /// <param name="request">Service update request</param>
        /// <returns>Validation result</returns>
        Task<Shared.DTOs.ValidationResult> ValidateUpdateServiceRequestAsync(Shared.DTOs.UpdateServiceRequest request, Guid tenantId);

        /// <summary>
        /// Validates a category creation request
        /// </summary>
        /// <param name="request">Category creation request</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Validation result</returns>
        Task<Shared.DTOs.ValidationResult> ValidateCreateCategoryRequestAsync(Shared.DTOs.CreateCategoryRequest request, Guid tenantId);

        /// <summary>
        /// Validates a category update request
        /// </summary>
        /// <param name="request">Category update request</param>
        /// <returns>Validation result</returns>
        Task<Shared.DTOs.ValidationResult> ValidateUpdateCategoryRequestAsync(Shared.DTOs.UpdateCategoryRequest request, Guid tenantId);
    }
}