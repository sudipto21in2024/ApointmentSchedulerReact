using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ReportingService.Services;
using Shared.DTOs;

namespace ReportingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Gets dashboard overview data for a service provider
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="filter">Dashboard filter parameters</param>
        /// <returns>Dashboard overview data</returns>
        [HttpGet("overview")]
        public async Task<ActionResult<DashboardOverviewDto>> GetOverview(
            [FromQuery] Guid providerId,
            [FromQuery] DashboardFilterDto filter)
        {
            try
            {
                // Get tenant ID from claims (in a real implementation)
                var tenantId = GetTenantId();

                var overview = await _dashboardService.GetOverviewDataAsync(providerId, tenantId, filter);
                return Ok(overview);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving dashboard data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gets system health data for administrators
        /// </summary>
        /// <returns>System health data</returns>
        [HttpGet("health")]
        public async Task<ActionResult<SystemHealthDto>> GetSystemHealth()
        {
            try
            {
                // Get tenant ID from claims (in a real implementation)
                var tenantId = GetTenantId();

                var health = await _dashboardService.GetSystemHealthAsync(tenantId);
                return Ok(health);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving system health data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gets tenant ID from claims (placeholder implementation)
        /// </summary>
        /// <returns>Tenant ID</returns>
        private Guid GetTenantId()
        {
            // In a real implementation, this would extract the tenant ID from the user's claims
            // For now, we'll return a default GUID
            return Guid.NewGuid();
        }
    }
}