using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.Data;
using Shared.Models;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs;
using ServiceManagementService.Services;

namespace ServiceManagementService.Validators
{
    public class ServiceValidator : IServiceValidator
    {
        private readonly ApplicationDbContext _dbContext;

        public ServiceValidator(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Validates a service creation request
        /// </summary>
        /// <param name="request">Service creation request</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Validation result</returns>
        public async Task<Shared.DTOs.ValidationResult> ValidateCreateServiceRequestAsync(Shared.DTOs.CreateServiceRequest request, Guid tenantId)
        {
            var result = new Shared.DTOs.ValidationResult { IsValid = true };

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                result.IsValid = false;
                result.Errors.Add("Service name is required");
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                result.IsValid = false;
                result.Errors.Add("Service description is required");
            }

            if (request.Duration <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Service duration must be greater than 0");
            }

            if (request.Price < 0)
            {
                result.IsValid = false;
                result.Errors.Add("Service price cannot be negative");
            }

            if (request.MaxBookingsPerDay <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Max bookings per day must be greater than 0");
            }

            // Validate category exists
            if (request.CategoryId != Guid.Empty)
            {
                var categoryExists = await _dbContext.ServiceCategories
                    .AnyAsync(c => c.Id == request.CategoryId && c.TenantId == tenantId);
                
                if (!categoryExists)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid category ID");
                }
            }

            // Validate service name is unique within tenant
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                var serviceExists = await _dbContext.Services
                    .AnyAsync(s => s.Name == request.Name && s.TenantId == tenantId);
                
                if (serviceExists)
                {
                    result.IsValid = false;
                    result.Errors.Add("Service name must be unique within tenant");
                }
            }

            return result;
        }

        /// <summary>
        /// Validates a service update request
        /// </summary>
        /// <param name="request">Service update request</param>
        /// <returns>Validation result</returns>
        public async Task<Shared.DTOs.ValidationResult> ValidateUpdateServiceRequestAsync(Shared.DTOs.UpdateServiceRequest request, Guid tenantId)
        {
            var result = new Shared.DTOs.ValidationResult { IsValid = true };

            // Validate fields if provided
            if (request.Duration.HasValue && request.Duration.Value <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Service duration must be greater than 0");
            }

            if (request.Price.HasValue && request.Price.Value < 0)
            {
                result.IsValid = false;
                result.Errors.Add("Service price cannot be negative");
            }

            if (request.MaxBookingsPerDay.HasValue && request.MaxBookingsPerDay.Value <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Max bookings per day must be greater than 0");
            }

            // Validate category exists if provided
            if (request.CategoryId.HasValue && request.CategoryId.Value != Guid.Empty)
            {
                var categoryExists = await _dbContext.ServiceCategories
                    .AnyAsync(c => c.Id == request.CategoryId.Value && c.TenantId == tenantId);
                
                if (!categoryExists)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid category ID");
                }
            }

            return result;
        }

        /// <summary>
        /// Validates a category creation request
        /// </summary>
        /// <param name="request">Category creation request</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Validation result</returns>
        public async Task<Shared.DTOs.ValidationResult> ValidateCreateCategoryRequestAsync(Shared.DTOs.CreateCategoryRequest request, Guid tenantId)
        {
            var result = new Shared.DTOs.ValidationResult { IsValid = true };

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                result.IsValid = false;
                result.Errors.Add("Category name is required");
            }

            // Validate parent category exists if provided
            if (request.ParentCategoryId.HasValue && request.ParentCategoryId.Value != Guid.Empty)
            {
                var parentCategoryExists = await _dbContext.ServiceCategories
                    .AnyAsync(c => c.Id == request.ParentCategoryId.Value && c.TenantId == tenantId);
                
                if (!parentCategoryExists)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid parent category ID");
                }
            }

            // Validate category name is unique within tenant
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                var categoryExists = await _dbContext.ServiceCategories
                    .AnyAsync(c => c.Name == request.Name && c.TenantId == tenantId);
                
                if (categoryExists)
                {
                    result.IsValid = false;
                    result.Errors.Add("Category name must be unique within tenant");
                }
            }

            return result;
        }

        /// <summary>
        /// Validates a category update request
        /// </summary>
        /// <param name="request">Category update request</param>
        /// <returns>Validation result</returns>
        public async Task<Shared.DTOs.ValidationResult> ValidateUpdateCategoryRequestAsync(Shared.DTOs.UpdateCategoryRequest request, Guid tenantId)
        {
            var result = new Shared.DTOs.ValidationResult { IsValid = true };

            // Validate parent category exists if provided
            if (request.ParentCategoryId.HasValue && request.ParentCategoryId.Value != Guid.Empty)
            {
                var parentCategoryExists = await _dbContext.ServiceCategories
                    .AnyAsync(c => c.Id == request.ParentCategoryId.Value && c.TenantId == tenantId);
                
                if (!parentCategoryExists)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid parent category ID");
                }
            }

            return result;
        }
    }
}