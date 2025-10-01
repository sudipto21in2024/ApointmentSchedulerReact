using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReportingService.Services;
using Shared.DTOs;

namespace ReportingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly IDashboardAnalyticsService _dashboardAnalyticsService;

        public AnalyticsController(IAnalyticsService analyticsService, IDashboardAnalyticsService dashboardAnalyticsService)
        {
            _analyticsService = analyticsService;
            _dashboardAnalyticsService = dashboardAnalyticsService;
        }

        /// <summary>
        /// Gets booking analytics data aggregated by time periods
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Booking analytics data</returns>
        [HttpGet("bookings")]
        public async Task<ActionResult<BookingAnalyticsDto>> GetBookingAnalytics(
            [FromQuery] Guid providerId,
            [FromQuery] AnalyticsFilterDto filter)
        {
            try
            {
                // Get tenant ID from claims (in a real implementation)
                var tenantId = GetTenantId();

                var analytics = await _analyticsService.GetBookingDataAsync(providerId, tenantId, filter);
                return Ok(analytics);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving booking analytics data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gets revenue analytics data including earnings and commission tracking
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Revenue analytics data</returns>
        [HttpGet("revenue")]
        public async Task<ActionResult<RevenueAnalyticsDto>> GetRevenueAnalytics(
            [FromQuery] Guid providerId,
            [FromQuery] AnalyticsFilterDto filter)
        {
            try
            {
                // Get tenant ID from claims (in a real implementation)
                var tenantId = GetTenantId();

                var analytics = await _analyticsService.GetRevenueDataAsync(providerId, tenantId, filter);
                return Ok(analytics);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving revenue analytics data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gets customer insights including booking history and feedback
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Customer insights data</returns>
        [HttpGet("customers")]
        public async Task<ActionResult<CustomerInsightsDto>> GetCustomerInsights(
            [FromQuery] Guid providerId,
            [FromQuery] AnalyticsFilterDto filter)
        {
            try
            {
                // Get tenant ID from claims (in a real implementation)
                var tenantId = GetTenantId();

                var insights = await _analyticsService.GetCustomerDataAsync(providerId, tenantId, filter);
                return Ok(insights);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving customer insights data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gets tenant-specific booking analytics data
        /// </summary>
        /// <param name="startDate">Start date for filtering (optional)</param>
        /// <param name="endDate">End date for filtering (optional)</param>
        /// <returns>Tenant booking analytics data</returns>
        [HttpGet("tenant/bookings")]
        [Authorize(Roles = "TenantAdmin")]
        public async Task<ActionResult<BookingAnalyticsDto>> GetTenantBookingAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var analytics = await _dashboardAnalyticsService.GetTenantBookingAnalyticsAsync(tenantId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving tenant booking analytics data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gets tenant-specific revenue analytics data
        /// </summary>
        /// <param name="startDate">Start date for filtering (optional)</param>
        /// <param name="endDate">End date for filtering (optional)</param>
        /// <returns>Tenant revenue analytics data</returns>
        [HttpGet("tenant/revenue")]
        [Authorize(Roles = "TenantAdmin")]
        public async Task<ActionResult<RevenueAnalyticsDto>> GetTenantRevenueAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var analytics = await _dashboardAnalyticsService.GetTenantRevenueAnalyticsAsync(tenantId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving tenant revenue analytics data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gets global booking analytics data
        /// </summary>
        /// <param name="startDate">Start date for filtering (optional)</param>
        /// <param name="endDate">End date for filtering (optional)</param>
        /// <returns>Global booking analytics data</returns>
        [HttpGet("global/bookings")]
        [Authorize(Roles = "SystemAdmin")]
        public async Task<ActionResult<BookingAnalyticsDto>> GetGlobalBookingAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var analytics = await _dashboardAnalyticsService.GetGlobalBookingAnalyticsAsync(startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving global booking analytics data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Gets global revenue analytics data
        /// </summary>
        /// <param name="startDate">Start date for filtering (optional)</param>
        /// <param name="endDate">End date for filtering (optional)</param>
        /// <returns>Global revenue analytics data</returns>
        [HttpGet("global/revenue")]
        [Authorize(Roles = "SystemAdmin")]
        public async Task<ActionResult<RevenueAnalyticsDto>> GetGlobalRevenueAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var analytics = await _dashboardAnalyticsService.GetGlobalRevenueAnalyticsAsync(startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving global revenue analytics data", Error = ex.Message });
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