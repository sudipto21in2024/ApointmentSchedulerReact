using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReportingService.Services;
using Shared.DTOs;

namespace ReportingService.Controllers
{
    [ApiController]
    [Route("system-admin/dashboard")]
    [Authorize(Roles = "SystemAdmin")]
    public class SystemAdminDashboardController : ControllerBase
    {
        private readonly IDashboardAnalyticsService _dashboardService;

        public SystemAdminDashboardController(IDashboardAnalyticsService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Gets global platform dashboard overview data
        /// </summary>
        /// <param name="startDate">Start date for filtering (optional)</param>
        /// <param name="endDate">End date for filtering (optional)</param>
        /// <returns>System dashboard overview data</returns>
        [HttpGet("overview")]
        public async Task<ActionResult<SystemDashboardOverviewDto>> GetOverview(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var overview = await _dashboardService.GetSystemDashboardOverviewAsync(startDate, endDate);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving dashboard data", Error = ex.Message });
            }
        }
    }
}