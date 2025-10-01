using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReportingService.Services;
using Shared.DTOs;

namespace ReportingService.Controllers
{
    [ApiController]
    [Route("tenant-admin/dashboard")]
    [Authorize(Roles = "TenantAdmin")]
    public class TenantAdminDashboardController : ControllerBase
    {
        private readonly IDashboardAnalyticsService _dashboardService;

        public TenantAdminDashboardController(IDashboardAnalyticsService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Gets tenant-specific dashboard overview data
        /// </summary>
        /// <param name="startDate">Start date for filtering (optional)</param>
        /// <param name="endDate">End date for filtering (optional)</param>
        /// <returns>Tenant dashboard overview data</returns>
        [HttpGet("overview")]
        public async Task<ActionResult<TenantDashboardOverviewDto>> GetOverview(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var overview = await _dashboardService.GetTenantDashboardOverviewAsync(tenantId, startDate, endDate);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving dashboard data", Error = ex.Message });
            }
        }

        private Guid GetTenantId()
        {
            // Extract tenant ID from claims
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;
            return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : Guid.NewGuid();
        }
    }
}