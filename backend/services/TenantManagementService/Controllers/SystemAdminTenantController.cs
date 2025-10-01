using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shared.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TenantManagementService.Services;

namespace TenantManagementService.Controllers
{
    [ApiController]
    [Route("system-admin/tenants")]
    [Authorize(Roles = "SuperAdmin")]
    public class SystemAdminTenantController : ControllerBase
    {
        private readonly ISystemAdminTenantService _tenantService;
        private readonly ILogger<SystemAdminTenantController> _logger;

        public SystemAdminTenantController(
            ISystemAdminTenantService tenantService,
            ILogger<SystemAdminTenantController> logger)
        {
            _tenantService = tenantService;
            _logger = logger;
        }

        /// <summary>
        /// Get all tenants
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(TenantListDto), 200)]
        public async Task<IActionResult> GetAllTenants(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sort = null,
            [FromQuery] string? order = "desc")
        {
            try
            {
                var result = await _tenantService.GetAllTenantsAsync(page, pageSize, sort, order);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenants");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get tenant by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(TenantDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetTenantById(Guid id)
        {
            try
            {
                var tenant = await _tenantService.GetTenantByIdAsync(id);
                return Ok(tenant);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Tenant not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenant {TenantId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new tenant
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(TenantDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> CreateTenant([FromBody] CreateTenantRequest request)
        {
            try
            {
                var tenant = await _tenantService.CreateTenantAsync(request);
                return CreatedAtAction(nameof(GetTenantById), new { id = tenant.Id }, tenant);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tenant");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update tenant details
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(TenantDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> UpdateTenant(Guid id, [FromBody] UpdateTenantRequest request)
        {
            try
            {
                var tenant = await _tenantService.UpdateTenantAsync(id, request);
                return Ok(tenant);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Tenant not found");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tenant {TenantId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Soft delete a tenant
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteTenant(Guid id)
        {
            try
            {
                await _tenantService.DeleteTenantAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Tenant not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting tenant {TenantId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update tenant status
        /// </summary>
        [HttpPut("{id}/status")]
        [ProducesResponseType(typeof(TenantDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateTenantStatus(Guid id, [FromBody] UpdateTenantStatusRequest request)
        {
            try
            {
                var tenant = await _tenantService.UpdateTenantStatusAsync(id, request);
                return Ok(tenant);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Tenant not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tenant status {TenantId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}