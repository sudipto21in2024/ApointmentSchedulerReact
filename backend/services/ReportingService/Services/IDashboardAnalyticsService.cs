using System;
using System.Threading.Tasks;
using Shared.DTOs;

namespace ReportingService.Services
{
    public interface IDashboardAnalyticsService
    {
        Task<TenantDashboardOverviewDto> GetTenantDashboardOverviewAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null);
        Task<SystemDashboardOverviewDto> GetSystemDashboardOverviewAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<BookingAnalyticsDto> GetTenantBookingAnalyticsAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null);
        Task<RevenueAnalyticsDto> GetTenantRevenueAnalyticsAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null);
        Task<BookingAnalyticsDto> GetGlobalBookingAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<RevenueAnalyticsDto> GetGlobalRevenueAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
    }
}