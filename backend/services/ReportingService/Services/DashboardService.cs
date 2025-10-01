using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using Shared.Validators;

namespace ReportingService.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _dbContext;

        public DashboardService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Gets dashboard overview data for a service provider
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <param name="filter">Dashboard filter parameters</param>
        /// <returns>Dashboard overview data</returns>
        public async Task<DashboardOverviewDto> GetOverviewDataAsync(Guid providerId, Guid tenantId, DashboardFilterDto filter)
        {
            // Validate filter
            var validationResult = AnalyticsValidator.ValidateDashboardFilter(filter);
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            var overview = new DashboardOverviewDto();

            // Get date range for filtering
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddDays(-30);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            // Get total bookings
            var totalBookingsQuery = _dbContext.Bookings
                .Where(b => b.Service.ProviderId == providerId && b.TenantId == tenantId);

            if (filter.ServiceId.HasValue)
            {
                totalBookingsQuery = totalBookingsQuery.Where(b => b.ServiceId == filter.ServiceId.Value);
            }

            overview.TotalBookings = await totalBookingsQuery.CountAsync();

            // Get today's bookings
            var todayStart = DateTime.UtcNow.Date;
            var todayEnd = todayStart.AddDays(1);
            overview.TodayBookings = await totalBookingsQuery
                .Where(b => b.BookingDate >= todayStart && b.BookingDate < todayEnd)
                .CountAsync();

            // Get bookings by status
            var statusGroups = await totalBookingsQuery
                .GroupBy(b => b.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            overview.PendingBookings = statusGroups.FirstOrDefault(g => g.Status == "Pending")?.Count ?? 0;
            overview.ConfirmedBookings = statusGroups.FirstOrDefault(g => g.Status == "Confirmed")?.Count ?? 0;
            overview.CancelledBookings = statusGroups.FirstOrDefault(g => g.Status == "Cancelled")?.Count ?? 0;

            // Get revenue data
            var paymentsQuery = _dbContext.Payments
                .Where(p => p.Booking.Service.ProviderId == providerId && 
                           p.TenantId == tenantId &&
                           p.PaymentStatus == "Completed");

            if (filter.ServiceId.HasValue)
            {
                paymentsQuery = paymentsQuery.Where(p => p.Booking.ServiceId == filter.ServiceId.Value);
            }

            overview.TotalRevenue = await paymentsQuery.SumAsync(p => (decimal?)p.Amount) ?? 0;
            
            // Get today's revenue
            overview.TodayRevenue = await paymentsQuery
                .Where(p => p.PaidAt >= todayStart && p.PaidAt < todayEnd)
                .SumAsync(p => (decimal?)p.Amount) ?? 0;

            // Get pending revenue (from pending bookings)
            overview.PendingRevenue = await _dbContext.Payments
                .Where(p => p.Booking.Service.ProviderId == providerId &&
                           p.TenantId == tenantId &&
                           p.PaymentStatus == "Pending")
                .SumAsync(p => (decimal?)p.Amount) ?? 0;

            // Get commission deductions (assuming 10% commission)
            overview.CommissionDeductions = overview.TotalRevenue * 0.10m;

            // Get total customers
            overview.TotalCustomers = await _dbContext.Bookings
                .Where(b => b.Service.ProviderId == providerId && b.TenantId == tenantId)
                .Select(b => b.CustomerId)
                .Distinct()
                .CountAsync();

            // Get new customers this month
            var monthStart = DateTime.UtcNow.AddDays(-30);
            overview.NewCustomersThisMonth = await _dbContext.Bookings
                .Where(b => b.Service.ProviderId == providerId && 
                           b.TenantId == tenantId &&
                           b.CreatedAt >= monthStart)
                .Select(b => b.CustomerId)
                .Distinct()
                .CountAsync();

            // Get recent bookings
            overview.RecentBookings = await _dbContext.Bookings
                .Where(b => b.Service.ProviderId == providerId && b.TenantId == tenantId)
                .OrderByDescending(b => b.CreatedAt)
                .Take(filter.Limit)
                .Select(b => new RecentBookingDto
                {
                    BookingId = b.Id,
                    CustomerName = b.Customer.FirstName + " " + b.Customer.LastName,
                    ServiceName = b.Service.Name,
                    BookingDate = b.BookingDate,
                    Amount = b.Payments.FirstOrDefault(p => p.PaymentStatus == "Completed") != null ? 
                             b.Payments.FirstOrDefault(p => p.PaymentStatus == "Completed").Amount : 0,
                    Status = b.Status
                })
                .ToListAsync();

            // Get upcoming bookings
            overview.UpcomingBookings = await _dbContext.Bookings
                .Where(b => b.Service.ProviderId == providerId && 
                           b.TenantId == tenantId &&
                           b.Status == "Confirmed" &&
                           b.Slot.StartDateTime > DateTime.UtcNow)
                .OrderBy(b => b.Slot.StartDateTime)
                .Take(filter.Limit)
                .Select(b => new UpcomingBookingDto
                {
                    BookingId = b.Id,
                    CustomerName = b.Customer.FirstName + " " + b.Customer.LastName,
                    ServiceName = b.Service.Name,
                    SlotStartDateTime = b.Slot.StartDateTime,
                    SlotEndDateTime = b.Slot.EndDateTime
                })
                .ToListAsync();

            return overview;
        }

        /// <summary>
        /// Gets system health data for administrators
        /// </summary>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>System health data</returns>
        public async Task<SystemHealthDto> GetSystemHealthAsync(Guid tenantId)
        {
            var health = new SystemHealthDto();

            // In a real implementation, this would get actual system metrics
            // For now, we'll return mock data
            health.Performance = new SystemPerformanceDto
            {
                CpuUsage = 45.5,
                MemoryUsage = 62.3,
                DiskUsage = 38.7,
                NetworkLatency = 12.4,
                ActiveConnections = 142,
                AverageResponseTime = 45.2,
                RequestsPerSecond = 28
            };

            // Get error metrics from recent bookings
            var errorMetrics = await _dbContext.Bookings
                .Where(b => b.TenantId == tenantId && 
                           b.Status == "Failed" &&
                           b.UpdatedAt >= DateTime.UtcNow.AddDays(-7))
                .GroupBy(b => "BookingFailure")
                .Select(g => new ErrorMetricDto
                {
                    ErrorType = g.Key,
                    ErrorCount = g.Count(),
                    LastErrorTime = g.Max(b => b.UpdatedAt),
                    LastErrorMessage = "Booking processing failed"
                })
                .ToListAsync();

            health.ErrorMetrics = errorMetrics;

            // Get service statuses
            health.ServiceStatuses = new System.Collections.Generic.List<ServiceStatusDto>
            {
                new ServiceStatusDto { ServiceName = "BookingService", Status = "Healthy", LastCheckTime = DateTime.UtcNow, Details = "All systems operational" },
                new ServiceStatusDto { ServiceName = "PaymentService", Status = "Healthy", LastCheckTime = DateTime.UtcNow, Details = "All systems operational" },
                new ServiceStatusDto { ServiceName = "NotificationService", Status = "Degraded", LastCheckTime = DateTime.UtcNow, Details = "Delayed notifications" },
                new ServiceStatusDto { ServiceName = "UserService", Status = "Healthy", LastCheckTime = DateTime.UtcNow, Details = "All systems operational" }
            };

            return health;
        }
    }
}