using System;
using System.Threading.Tasks;
using Shared.DTOs;

namespace ReportingService.Services
{
    public interface IDashboardService
    {
        /// <summary>
        /// Gets dashboard overview data for a service provider
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <param name="filter">Dashboard filter parameters</param>
        /// <returns>Dashboard overview data</returns>
        Task<DashboardOverviewDto> GetOverviewDataAsync(Guid providerId, Guid tenantId, DashboardFilterDto filter);

        /// <summary>
        /// Gets system health data for administrators
        /// </summary>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>System health data</returns>
        Task<SystemHealthDto> GetSystemHealthAsync(Guid tenantId);
    }
}