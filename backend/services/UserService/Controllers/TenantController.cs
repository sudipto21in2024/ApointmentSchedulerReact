using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shared.Models;
using UserService.DTO;
using UserService.Services;
using System.Security.Claims;
using Shared.Contracts;


namespace UserService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize(Roles = "SuperAdmin")] // Restrict access to SuperAdmin only
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;
        private readonly ILogger<TenantController> _logger;

        public TenantController(ITenantService tenantService, ILogger<TenantController> logger)
        {
            _tenantService = tenantService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTenant([FromBody] CreateTenantRequest request)
        {
            _logger.LogInformation("Attempting to create a new tenant with name: {TenantName}", request.Name);
            try
            {
                var tenant = await _tenantService.CreateTenantAsync(request);
                _logger.LogInformation("Tenant created successfully with ID: {TenantId}", tenant.Id);
                return CreatedAtAction(nameof(GetTenantById), new { id = tenant.Id }, new TenantResponse(tenant));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tenant with name: {TenantName}", request.Name);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTenantById(Guid id)
        {
            _logger.LogInformation("Attempting to retrieve tenant with ID: {TenantId}", id);
            try
            {
                var tenant = await _tenantService.GetTenantByIdAsync(id);
                if (tenant == null)
                {
                    _logger.LogWarning("Tenant with ID: {TenantId} not found.", id);
                    return NotFound();
                }
                _logger.LogInformation("Tenant with ID: {TenantId} retrieved successfully.", id);
                return Ok(new TenantResponse(tenant));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenant with ID: {TenantId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTenants()
        {
            _logger.LogInformation("Attempting to retrieve all tenants.");
            try
            {
                var tenants = await _tenantService.GetAllTenantsAsync();
                _logger.LogInformation("Retrieved {Count} tenants successfully.", tenants.Count());
                return Ok(tenants.Select(t => new TenantResponse(t)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all tenants.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTenant(Guid id, [FromBody] UpdateTenantRequest request)
        {
            _logger.LogInformation("Attempting to update tenant with ID: {TenantId}", id);
            try
            {
                var tenant = await _tenantService.UpdateTenantAsync(id, request);
                if (tenant == null)
                {
                    _logger.LogWarning("Tenant with ID: {TenantId} not found for update.", id);
                    return NotFound();
                }
                _logger.LogInformation("Tenant with ID: {TenantId} updated successfully.", id);
                return Ok(new TenantResponse(tenant));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tenant with ID: {TenantId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTenant(Guid id)
        {
            _logger.LogInformation("Attempting to delete tenant with ID: {TenantId}", id);
            try
            {
                var result = await _tenantService.DeleteTenantAsync(id);
                if (!result)
                {
                    _logger.LogWarning("Tenant with ID: {TenantId} not found for deletion.", id);
                    return NotFound();
                }
                _logger.LogInformation("Tenant with ID: {TenantId} deleted successfully.", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting tenant with ID: {TenantId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}