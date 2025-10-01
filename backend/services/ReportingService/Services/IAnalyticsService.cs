using System;
using System.Threading.Tasks;
using Shared.DTOs;

namespace ReportingService.Services
{
    public interface IAnalyticsService
    {
        /// <summary>
        /// Gets booking analytics data aggregated by time periods
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Booking analytics data</returns>
        Task<BookingAnalyticsDto> GetBookingDataAsync(Guid providerId, Guid tenantId, AnalyticsFilterDto filter);

        /// <summary>
        /// Gets revenue analytics data including earnings and commission tracking
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Revenue analytics data</returns>
        Task<RevenueAnalyticsDto> GetRevenueDataAsync(Guid providerId, Guid tenantId, AnalyticsFilterDto filter);

        /// <summary>
        /// Gets customer insights including booking history and feedback
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Customer insights data</returns>
        Task<CustomerInsightsDto> GetCustomerDataAsync(Guid providerId, Guid tenantId, AnalyticsFilterDto filter);
    }
}