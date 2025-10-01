using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Shared.Events;
using Shared.Models;
using MassTransit;
using Microsoft.Extensions.Logging;
using ServiceManagementService.Services;
using ServiceManagementService.Validators;
using Shared.DTOs;

namespace ServiceManagementService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ServiceController : ControllerBase
    {
        private readonly ILogger<ServiceController> _logger;
        private readonly IServiceService _serviceService;
        private readonly IServiceValidator _validator;

        public ServiceController(
            ILogger<ServiceController> logger, 
            IServiceService serviceService,
            IServiceValidator validator)
        {
            _logger = logger;
            _serviceService = serviceService;
            _validator = validator;
        }

        /// <summary>
        /// Creates a new service
        /// </summary>
        /// <param name="request">Service creation request</param>
        /// <returns>Created service</returns>
        [HttpPost]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceRequest request)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var service = await _serviceService.CreateServiceAsync(request, userId, tenantId);
                
                _logger.LogInformation($"Service created with ID: {service.Id}");
                
                return Ok(new { ServiceId = service.Id, Message = "Service created successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating service");
                return StatusCode(500, new { Message = "An error occurred while creating the service" });
            }
        }

        /// <summary>
        /// Gets a service by ID
        /// </summary>
        /// <param name="id">Service ID</param>
        /// <returns>Service details</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetService(Guid id)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var service = await _serviceService.GetServiceByIdAsync(id, userId, tenantId);
                
                return Ok(service);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Service not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving service");
                return StatusCode(500, new { Message = "An error occurred while retrieving the service" });
            }
        }

        /// <summary>
        /// Updates an existing service
        /// </summary>
        /// <param name="id">Service ID</param>
        /// <param name="request">Service update request</param>
        /// <returns>Updated service</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(Guid id, [FromBody] UpdateServiceRequest request)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var service = await _serviceService.UpdateServiceAsync(id, request, userId, tenantId);
                
                _logger.LogInformation($"Service updated with ID: {service.Id}");
                
                return Ok(new { ServiceId = service.Id, Message = "Service updated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Service not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service");
                return StatusCode(500, new { Message = "An error occurred while updating the service" });
            }
        }

        /// <summary>
        /// Deletes a service
        /// </summary>
        /// <param name="id">Service ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                await _serviceService.DeleteServiceAsync(id, userId, tenantId);
                
                _logger.LogInformation($"Service deleted with ID: {id}");
                
                return Ok(new { ServiceId = id, Message = "Service deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Service not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting service");
                return StatusCode(500, new { Message = "An error occurred while deleting the service" });
            }
        }

        /// <summary>
        /// Lists services with optional filtering
        /// </summary>
        /// <param name="categoryId">Optional category filter</param>
        /// <param name="isActive">Optional active status filter</param>
        /// <returns>List of services</returns>
        [HttpGet]
        public async Task<IActionResult> GetServices([FromQuery] Guid? categoryId, [FromQuery] bool? isActive)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var services = await _serviceService.GetServicesAsync(userId, tenantId, categoryId, isActive);
                
                return Ok(services);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving services");
                return StatusCode(500, new { Message = "An error occurred while retrieving services" });
            }
        }

        /// <summary>
        /// Creates a new service category
        /// </summary>
        /// <param name="request">Category creation request</param>
        /// <returns>Created category</returns>
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var category = await _serviceService.CreateServiceCategoryAsync(request, userId, tenantId);
                
                _logger.LogInformation($"Category created with ID: {category.Id}");
                
                return Ok(new { CategoryId = category.Id, Message = "Category created successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, new { Message = "An error occurred while creating the category" });
            }
        }

        /// <summary>
        /// Updates an existing service category
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <param name="request">Category update request</param>
        /// <returns>Updated category</returns>
        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var category = await _serviceService.UpdateServiceCategoryAsync(id, request, userId, tenantId);
                
                _logger.LogInformation($"Category updated with ID: {category.Id}");
                
                return Ok(new { CategoryId = category.Id, Message = "Category updated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Category not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category");
                return StatusCode(500, new { Message = "An error occurred while updating the category" });
            }
        }

        /// <summary>
        /// Deletes a service category
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                await _serviceService.DeleteServiceCategoryAsync(id, userId, tenantId);
                
                _logger.LogInformation($"Category deleted with ID: {id}");
                
                return Ok(new { CategoryId = id, Message = "Category deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Category not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category");
                return StatusCode(500, new { Message = "An error occurred while deleting the category" });
            }
        }

        /// <summary>
        /// Lists service categories
        /// </summary>
        /// <returns>List of service categories</returns>
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                // Get tenant ID from claims (simplified for this example)
                var tenantId = GetTenantIdFromClaims();

                var categories = await _serviceService.GetServiceCategoriesAsync(tenantId);
                
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, new { Message = "An error occurred while retrieving categories" });
            }
        }

        #region Helper Methods

        /// <summary>
        /// Gets user ID from claims (simplified for this example)
        /// </summary>
        /// <returns>User ID</returns>
        private Guid GetUserIdFromClaims()
        {
            // In a real implementation, this would extract the user ID from the JWT claims
            // For this example, we'll return a dummy GUID
            return Guid.NewGuid();
        }

        /// <summary>
        /// Gets tenant ID from claims (simplified for this example)
        /// </summary>
        /// <returns>Tenant ID</returns>
        private Guid GetTenantIdFromClaims()
        {
            // In a real implementation, this would extract the tenant ID from the JWT claims
            // For this example, we'll return a dummy GUID
            return Guid.NewGuid();
        }

        #endregion

        /// <summary>
        /// Approves a service listing.
        /// </summary>
        /// <param name="id">Service ID to approve</param>
        /// <returns>Success message</returns>
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveService(Guid id)
        {
            try
            {
                var adminId = GetUserIdFromClaims(); // Assuming the user is an admin
                var tenantId = GetTenantIdFromClaims();

                await _serviceService.ApproveServiceAsync(id, adminId, tenantId);

                _logger.LogInformation($"Service with ID: {id} approved by admin: {adminId}");

                return Ok(new { Message = "Service approved successfully." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Service not found." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error approving service with ID: {id}");
                return StatusCode(500, new { Message = "An error occurred while approving the service." });
            }
        }

        /// <summary>
        /// Rejects a service listing.
        /// </summary>
        /// <param name="id">Service ID to reject</param>
        /// <param name="request">Rejection request containing an optional reason</param>
        /// <returns>Success message</returns>
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectService(Guid id, [FromBody] RejectServiceRequest request)
        {
            try
            {
                var adminId = GetUserIdFromClaims(); // Assuming the user is an admin
                var tenantId = GetTenantIdFromClaims();

                await _serviceService.RejectServiceAsync(id, adminId, tenantId, request.Reason);

                _logger.LogInformation($"Service with ID: {id} rejected by admin: {adminId}. Reason: {request.Reason}");

                return Ok(new { Message = "Service rejected successfully." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Service not found." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error rejecting service with ID: {id}");
                return StatusCode(500, new { Message = "An error occurred while rejecting the service." });
            }
        }
    }
}