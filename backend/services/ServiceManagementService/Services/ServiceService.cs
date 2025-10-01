using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shared.Data;
using Shared.Models;
using Shared.Events;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using ServiceManagementService.Validators;
using Shared.Models.Enums;
using static Shared.Models.Enums.ServiceStatus;
using Shared.DTOs;

namespace ServiceManagementService.Services
{
    public class ServiceService : IServiceService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IServiceValidator _validator;
        private readonly IPublishEndpoint _publishEndpoint;

        public ServiceService(ApplicationDbContext dbContext, IServiceValidator validator, IPublishEndpoint publishEndpoint)
        {
            _dbContext = dbContext;
            _validator = validator;
            _publishEndpoint = publishEndpoint;
        }

        /// <summary>
        /// Creates a new service
        /// </summary>
        /// <param name="request">Service creation request</param>
        /// <param name="userId">ID of the user creating the service</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Created service</returns>
        public async Task<Service> CreateServiceAsync(Shared.DTOs.CreateServiceRequest request, Guid userId, Guid tenantId)
        {
            // Validate the request
            var validationResult = await _validator.ValidateCreateServiceRequestAsync(request, tenantId) as Shared.DTOs.ValidationResult;
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            // Check if user is a provider
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            if (user == null || user.UserType != UserRole.Provider)
            {
                throw new UnauthorizedAccessException("Only service providers can create services");
            }

            // Create the service
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                CategoryId = request.CategoryId,
                ProviderId = userId,
                TenantId = tenantId,
                Duration = request.Duration,
                Price = request.Price,
                Currency = request.Currency,
                IsActive = request.IsActive,
                IsFeatured = request.IsFeatured,
                MaxBookingsPerDay = request.MaxBookingsPerDay,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            // Publish ServiceCreatedEvent
            var serviceCreatedEvent = new ServiceCreatedEvent
            {
                ServiceId = service.Id,
                Name = service.Name,
                Description = service.Description,
                CategoryId = service.CategoryId,
                ProviderId = service.ProviderId,
                TenantId = service.TenantId,
                Price = service.Price,
                Currency = service.Currency,
                Duration = service.Duration,
                CreatedAt = service.CreatedAt
            };

            await _publishEndpoint.Publish(serviceCreatedEvent);

            return service;
        }

        /// <summary>
        /// Gets a service by ID
        /// </summary>
        /// <param name="serviceId">Service ID</param>
        /// <param name="userId">ID of the user requesting the service</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Service details</returns>
        public async Task<Service> GetServiceByIdAsync(Guid serviceId, Guid userId, Guid tenantId)
        {
            var service = await _dbContext.Services
                .Include(s => s.Category)
                .Include(s => s.Provider)
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.TenantId == tenantId);

            if (service == null)
            {
                throw new KeyNotFoundException("Service not found");
            }

            // Check if user is authorized to access this service
            // Providers can access their own services, everyone can access active services
            if (service.ProviderId != userId && !service.IsActive)
            {
                throw new UnauthorizedAccessException("You are not authorized to access this service");
            }

            return service;
        }

        /// <summary>
        /// Updates an existing service
        /// </summary>
        /// <param name="serviceId">Service ID</param>
        /// <param name="request">Service update request</param>
        /// <param name="userId">ID of the user updating the service</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Updated service</returns>
        public async Task<Service> UpdateServiceAsync(Guid serviceId, Shared.DTOs.UpdateServiceRequest request, Guid userId, Guid tenantId)
        {
            // Validate the request
            var validationResult = await _validator.ValidateUpdateServiceRequestAsync(request, tenantId) as Shared.DTOs.ValidationResult;
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            // Get the existing service
            var service = await _dbContext.Services
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.TenantId == tenantId);

            if (service == null)
            {
                throw new KeyNotFoundException("Service not found");
            }

            // Check if user is authorized to update this service
            if (service.ProviderId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to update this service");
            }

            // Update service properties if provided
            if (!string.IsNullOrEmpty(request.Name))
            {
                // Check if name is unique within tenant (excluding current service)
                var nameExists = await _dbContext.Services
                    .AnyAsync(s => s.Name == request.Name && s.TenantId == tenantId && s.Id != serviceId);
                
                if (nameExists)
                {
                    throw new ArgumentException("Service name must be unique within tenant");
                }
                
                service.Name = request.Name;
            }

            if (!string.IsNullOrEmpty(request.Description))
            {
                service.Description = request.Description;
            }

            if (request.CategoryId.HasValue)
            {
                service.CategoryId = request.CategoryId.Value;
            }

            if (request.Duration.HasValue)
            {
                service.Duration = request.Duration.Value;
            }

            if (request.Price.HasValue)
            {
                service.Price = request.Price.Value;
            }

            if (!string.IsNullOrEmpty(request.Currency))
            {
                service.Currency = request.Currency;
            }

            if (request.IsActive.HasValue)
            {
                service.IsActive = request.IsActive.Value;
            }

            if (request.IsFeatured.HasValue)
            {
                service.IsFeatured = request.IsFeatured.Value;
            }

            if (request.MaxBookingsPerDay.HasValue)
            {
                service.MaxBookingsPerDay = request.MaxBookingsPerDay.Value;
            }

            service.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            // Publish ServiceUpdatedEvent
            var serviceUpdatedEvent = new ServiceUpdatedEvent
            {
                ServiceId = service.Id,
                Name = service.Name,
                Description = service.Description,
                CategoryId = service.CategoryId,
                Price = service.Price,
                Currency = service.Currency,
                Duration = service.Duration,
                IsActive = service.IsActive,
                TenantId = service.TenantId,
                UpdatedAt = service.UpdatedAt
            };

            await _publishEndpoint.Publish(serviceUpdatedEvent);

            return service;
        }

        /// <summary>
        /// Deletes a service (soft delete)
        /// </summary>
        /// <param name="serviceId">Service ID</param>
        /// <param name="userId">ID of the user deleting the service</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if successful</returns>
        public async Task<bool> DeleteServiceAsync(Guid serviceId, Guid userId, Guid tenantId)
        {
            var service = await _dbContext.Services
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.TenantId == tenantId);

            if (service == null)
            {
                throw new KeyNotFoundException("Service not found");
            }

            // Check if user is authorized to delete this service
            if (service.ProviderId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to delete this service");
            }

            // Check if service has existing bookings
            var hasBookings = await _dbContext.Bookings
                .AnyAsync(b => b.ServiceId == serviceId);

            if (hasBookings)
            {
                // Soft delete the service instead of hard delete
                service.IsActive = false;
                service.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Hard delete if no bookings exist
                _dbContext.Services.Remove(service);
            }

            await _dbContext.SaveChangesAsync();

            // Publish ServiceDeletedEvent
            var serviceDeletedEvent = new ServiceDeletedEvent
            {
                ServiceId = service.Id,
                Name = service.Name,
                ProviderId = service.ProviderId,
                TenantId = service.TenantId,
                DeletedAt = DateTime.UtcNow
            };

            await _publishEndpoint.Publish(serviceDeletedEvent);

            return true;
        }

        /// <summary>
        /// Gets all services with optional filtering
        /// </summary>
        /// <param name="userId">ID of the user requesting services</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <param name="categoryId">Optional category filter</param>
        /// <param name="isActive">Optional active status filter</param>
        /// <returns>List of services</returns>
        public async Task<IEnumerable<Service>> GetServicesAsync(Guid userId, Guid tenantId, Guid? categoryId = null, bool? isActive = null)
        {
            var query = _dbContext.Services
                .Include(s => s.Category)
                .Include(s => s.Provider)
                .AsQueryable();

            // Apply tenant filter
            query = query.Where(s => s.TenantId == tenantId);

            // Apply category filter if provided
            if (categoryId.HasValue)
            {
                query = query.Where(s => s.CategoryId == categoryId.Value);
            }

            // Apply active status filter if provided
            if (isActive.HasValue)
            {
                query = query.Where(s => s.IsActive == isActive.Value);
            }

            // If user is not a provider, only show active services
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            if (user == null || user.UserType != UserRole.Provider)
            {
                query = query.Where(s => s.IsActive);
            }

            return await query.ToListAsync();
        }

        /// <summary>
        /// Gets all service categories
        /// </summary>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>List of service categories</returns>
        public async Task<IEnumerable<ServiceCategory>> GetServiceCategoriesAsync(Guid tenantId)
        {
            return await _dbContext.ServiceCategories
                .Where(c => c.TenantId == tenantId && c.IsActive)
                .Include(c => c.ParentCategory)
                .ToListAsync();
        }

        /// <summary>
        /// Creates a new service category
        /// </summary>
        /// <param name="request">Category creation request</param>
        /// <param name="userId">ID of the user creating the category</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Created category</returns>
        public async Task<ServiceCategory> CreateServiceCategoryAsync(Shared.DTOs.CreateCategoryRequest request, Guid userId, Guid tenantId)
        {
            // Validate the request
            var validationResult = await _validator.ValidateCreateCategoryRequestAsync(request, tenantId) as Shared.DTOs.ValidationResult;
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            // Check if user is an admin (only admins can create categories)
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            if (user == null || user.UserType != UserRole.Admin)
            {
                throw new UnauthorizedAccessException("Only administrators can create service categories");
            }

            // Create the category
            var category = new ServiceCategory
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                ParentCategoryId = request.ParentCategoryId,
                IconUrl = request.IconUrl,
                SortOrder = request.SortOrder,
                IsActive = request.IsActive,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.ServiceCategories.Add(category);
            await _dbContext.SaveChangesAsync();

            return category;
        }

        /// <summary>
        /// Updates an existing service category
        /// </summary>
        /// <param name="categoryId">Category ID</param>
        /// <param name="request">Category update request</param>
        /// <param name="userId">ID of the user updating the category</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Updated category</returns>
        public async Task<ServiceCategory> UpdateServiceCategoryAsync(Guid categoryId, Shared.DTOs.UpdateCategoryRequest request, Guid userId, Guid tenantId)
        {
            // Validate the request
            var validationResult = await _validator.ValidateUpdateCategoryRequestAsync(request, tenantId) as Shared.DTOs.ValidationResult;
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            // Get the existing category
            var category = await _dbContext.ServiceCategories
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.TenantId == tenantId);

            if (category == null)
            {
                throw new KeyNotFoundException("Category not found");
            }

            // Check if user is an admin (only admins can update categories)
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            if (user == null || user.UserType != UserRole.Admin)
            {
                throw new UnauthorizedAccessException("Only administrators can update service categories");
            }

            // Update category properties if provided
            if (!string.IsNullOrEmpty(request.Name))
            {
                // Check if name is unique within tenant (excluding current category)
                var nameExists = await _dbContext.ServiceCategories
                    .AnyAsync(c => c.Name == request.Name && c.TenantId == tenantId && c.Id != categoryId);
                
                if (nameExists)
                {
                    throw new ArgumentException("Category name must be unique within tenant");
                }
                
                category.Name = request.Name;
            }

            if (!string.IsNullOrEmpty(request.Description))
            {
                category.Description = request.Description;
            }

            if (request.ParentCategoryId.HasValue)
            {
                category.ParentCategoryId = request.ParentCategoryId.Value;
            }

            if (!string.IsNullOrEmpty(request.IconUrl))
            {
                category.IconUrl = request.IconUrl;
            }

            if (request.SortOrder.HasValue)
            {
                category.SortOrder = request.SortOrder.Value;
            }

            if (request.IsActive.HasValue)
            {
                category.IsActive = request.IsActive.Value;
            }

            category.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return category;
        }

        /// <summary>
        /// Deletes a service category
        /// </summary>
        /// <param name="categoryId">Category ID</param>
        /// <param name="userId">ID of the user deleting the category</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if successful</returns>
        public async Task<bool> DeleteServiceCategoryAsync(Guid categoryId, Guid userId, Guid tenantId)
        {
            var category = await _dbContext.ServiceCategories
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.TenantId == tenantId);

            if (category == null)
            {
                throw new KeyNotFoundException("Category not found");
            }

            // Check if user is an admin (only admins can delete categories)
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            if (user == null || user.UserType != UserRole.Admin)
            {
                throw new UnauthorizedAccessException("Only administrators can delete service categories");
            }

            // Check if category has services
            var hasServices = await _dbContext.Services
                .AnyAsync(s => s.CategoryId == categoryId);

            if (hasServices)
            {
                throw new InvalidOperationException("Cannot delete category that has associated services");
            }

            _dbContext.ServiceCategories.Remove(category);
            await _dbContext.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Approves a service listing.
        /// </summary>
        /// <param name="serviceId">ID of the service to approve.</param>
        /// <param name="adminId">ID of the administrator approving the service.</param>
        /// <param name="tenantId">ID of the tenant.</param>
        /// <returns>True if the service was approved successfully, otherwise false.</returns>
        public async Task<bool> ApproveServiceAsync(Guid serviceId, Guid adminId, Guid tenantId)
        {
            var service = await _dbContext.Services
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.TenantId == tenantId);

            if (service == null)
            {
                throw new KeyNotFoundException("Service not found.");
            }

            // Check if user is an admin (only admins can approve services)
            var adminUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == adminId && u.TenantId == tenantId);
            if (adminUser == null || adminUser.UserType != UserRole.Admin)
            {
                throw new UnauthorizedAccessException("Only administrators can approve services.");
            }

            // Check if the service is already approved or rejected
            if (service.Status == Approved || service.Status == Rejected)
            {
                throw new InvalidOperationException($"Service is already {service.Status} and cannot be approved.");
            }

            // Ensure service is in a pending state before approval
            if (service.Status != Pending)
            {
                throw new InvalidOperationException("Service is not in a pending state and cannot be approved.");
            }

            service.Status = Approved; // Set to approved
            service.IsActive = true; // Also set IsActive to true for approved services
            service.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            // Publish ServiceApprovedEvent
            var serviceApprovedEvent = new ServiceApprovedEvent
            {
                ServiceId = service.Id,
                TenantId = service.TenantId,
                ApprovedBy = adminId,
                ApprovedAt = DateTime.UtcNow
            };
            await _publishEndpoint.Publish(serviceApprovedEvent);

            return true;
        }

        /// <summary>
        /// Rejects a service listing.
        /// </summary>
        /// <param name="serviceId">ID of the service to reject.</param>
        /// <param name="adminId">ID of the administrator rejecting the service.</param>
        /// <param name="tenantId">ID of the tenant.</param>
        /// <param name="reason">Optional reason for rejection.</param>
        /// <returns>True if the service was rejected successfully, otherwise false.</returns>
        public async Task<bool> RejectServiceAsync(Guid serviceId, Guid adminId, Guid tenantId, string? reason)
        {
            var service = await _dbContext.Services
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.TenantId == tenantId);

            if (service == null)
            {
                throw new KeyNotFoundException("Service not found.");
            }

            // Check if user is an admin (only admins can reject services)
            var adminUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == adminId && u.TenantId == tenantId);
            if (adminUser == null || adminUser.UserType != UserRole.Admin)
            {
                throw new UnauthorizedAccessException("Only administrators can reject services.");
            }

            // Check if the service is already approved or rejected
            if (service.Status == Approved || service.Status == Rejected)
            {
                throw new InvalidOperationException($"Service is already {service.Status} and cannot be rejected.");
            }

            // Ensure service is in a pending state before rejection
            if (service.Status != Pending)
            {
                throw new InvalidOperationException("Service is not in a pending state and cannot be rejected.");
            }

            service.Status = Rejected; // Set to rejected
            service.IsActive = false; // Also set IsActive to false for rejected services
            service.RejectionReason = reason; // Store rejection reason
            service.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            // Publish ServiceRejectedEvent
            var serviceRejectedEvent = new ServiceRejectedEvent
            {
                ServiceId = service.Id,
                TenantId = service.TenantId,
                RejectedBy = adminId,
                RejectedAt = DateTime.UtcNow,
                Reason = reason
            };
            await _publishEndpoint.Publish(serviceRejectedEvent);

            return true;
        }
    }
}