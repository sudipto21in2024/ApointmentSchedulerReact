using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.DTOs;

namespace ReportingService.Services
{
    public class DashboardAnalyticsService : IDashboardAnalyticsService
    {
        private readonly ApplicationDbContext _dbContext;

        public DashboardAnalyticsService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TenantDashboardOverviewDto> GetTenantDashboardOverviewAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null)
        {
            // var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            // var end = endDate ?? DateTime.UtcNow;
            // More explicit date handling
    DateTime start, end;
    
    if (startDate.HasValue && endDate.HasValue)
    {
        start = startDate.Value.Date; // Start of start date
        end = endDate.Value.Date.AddDays(1).AddTicks(-1); // End of end date
    }
    else if (startDate.HasValue)
    {
        start = startDate.Value.Date;
        end = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
    }
    else
    {
        // Default to last 30 days
        start = DateTime.UtcNow.AddDays(-30).Date;
        end = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
    }


            var bookings = await _dbContext.Bookings
                .Where(b => b.TenantId == tenantId && b.CreatedAt >= start && b.CreatedAt <= end)
                .ToListAsync();

            var payments = await _dbContext.Payments
                .Where(p => p.TenantId == tenantId && p.PaidAt.HasValue && p.PaidAt.Value >= start && p.PaidAt.Value <= end && p.PaymentStatus == "Completed")
                .ToListAsync();

            var services = await _dbContext.Services
                .Where(s => s.TenantId == tenantId)
                .CountAsync();

            // var users = await _dbContext.Users
            //     .Where(u => u.TenantId == tenantId)
            //     .CountAsync();

            var newCustomers = await _dbContext.Bookings
                .Where(b => b.TenantId == tenantId && b.CreatedAt >= start && b.CreatedAt <= end)
                .Select(b => b.CustomerId)
                .Distinct()
                .CountAsync();

            return new TenantDashboardOverviewDto
            {
                TotalBookings = bookings.Count,
                TotalRevenue = payments.Sum(p => p.Amount),
                // ActiveStaff = users, // Assuming all users are staff for simplicity
                TotalServices = services,
                NewCustomers = newCustomers,
                AverageBookingValue = bookings.Any() ? payments.Sum(p => p.Amount) / bookings.Count : 0,
                LastUpdated = DateTime.UtcNow
            };
        }

        // public async Task<SystemDashboardOverviewDto> GetSystemDashboardOverviewAsync(DateTime? startDate = null, DateTime? endDate = null)
        // {
        //     var start = startDate.Value ?? DateTime.UtcNow.AddDays(-30);
        //     var end = endDate.Value.AddDays(1).AddTicks(-1) ?? DateTime.UtcNow.AddDays(1).AddTicks(-1);;

        //     // For system admin, ignore tenant filters to get global data
        //     var totalTenants = await _dbContext.Tenants.IgnoreQueryFilters().CountAsync();
        //     var totalUsers = await _dbContext.Users.IgnoreQueryFilters().CountAsync();
        //     var totalBookings = await _dbContext.Bookings.IgnoreQueryFilters()
        //         .Where(b => b.CreatedAt >= start && b.CreatedAt <= end)
        //         .CountAsync();
        //     var totalRevenue = await _dbContext.Payments.IgnoreQueryFilters()
        //         .Where(p => p.PaidAt.HasValue && p.PaidAt.Value >= start && p.PaidAt.Value <= end && p.PaymentStatus == "Completed")
        //         .SumAsync(p => p.Amount);
        //     var activeServices = await _dbContext.Services.IgnoreQueryFilters().CountAsync();

        //     return new SystemDashboardOverviewDto
        //     {
        //         TotalTenants = totalTenants,
        //         TotalUsers = totalUsers,
        //         TotalBookings = totalBookings,
        //         TotalRevenue = totalRevenue,
        //         ActiveServices = activeServices,
        //         SystemHealthScore = 95.0m, // Placeholder
        //         LastUpdated = DateTime.UtcNow
        //     };
        // }
        public async Task<SystemDashboardOverviewDto> GetSystemDashboardOverviewAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            // More explicit date handling
            DateTime start, end;

            if (startDate.HasValue && endDate.HasValue)
            {
                start = startDate.Value.Date; // Start of start date
                end = endDate.Value.Date.AddDays(1).AddTicks(-1); // End of end date
            }
            else if (startDate.HasValue)
            {
                start = startDate.Value.Date;
                end = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
            }
            else
            {
                // Default to last 30 days
                start = DateTime.UtcNow.AddDays(-30).Date;
                end = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
            }

            // System admin filters are automatically bypassed via claims
            var totalTenants = await _dbContext.Tenants.CountAsync();
            var totalUsers = await _dbContext.Users.CountAsync();

            var totalBookings = await _dbContext.Bookings
                .Where(b => b.CreatedAt >= start && b.CreatedAt <= end)
                .CountAsync();

            var totalRevenue = await _dbContext.Payments
                .Where(p => p.PaidAt.HasValue &&
                            p.PaidAt.Value >= start &&
                            p.PaidAt.Value <= end &&
                            p.PaymentStatus == "Completed")
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            var activeServices = await _dbContext.Services.CountAsync();

            return new SystemDashboardOverviewDto
            {
                TotalTenants = totalTenants,
                TotalUsers = totalUsers,
                TotalBookings = totalBookings,
                TotalRevenue = totalRevenue,
                ActiveServices = activeServices,
                SystemHealthScore = 95.0m,
                LastUpdated = DateTime.UtcNow
            };
        }

        public async Task<BookingAnalyticsDto> GetTenantBookingAnalyticsAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var filter = new AnalyticsFilterDto
            {
                StartDate = startDate,
                EndDate = endDate,
                TimePeriod = "day" // Default to daily
            };

            // Reuse existing AnalyticsService logic, but filter by tenant
            var analyticsService = new AnalyticsService(_dbContext);
            // Since existing service requires providerId, but for tenant analytics, we need to aggregate across providers
            // For simplicity, assume we call it for each provider or modify

            // Placeholder implementation
            var analytics = new BookingAnalyticsDto();
            analytics.BookingTrends = await _dbContext.Bookings
                .Where(b => b.TenantId == tenantId && b.CreatedAt >= (startDate ?? DateTime.UtcNow.AddDays(-30)) && b.CreatedAt <= (endDate ?? DateTime.UtcNow))
                .GroupBy(b => b.CreatedAt.Date)
                .Select(g => new BookingTrendDto
                {
                    Date = g.Key,
                    TotalBookings = g.Count(),
                    ConfirmedBookings = g.Count(b => b.Status == "Confirmed"),
                    CancelledBookings = g.Count(b => b.Status == "Cancelled"),
                    PendingBookings = g.Count(b => b.Status == "Pending")
                })
                .OrderBy(t => t.Date)
                .ToListAsync();

            return analytics;
        }

        public async Task<RevenueAnalyticsDto> GetTenantRevenueAnalyticsAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var analytics = new RevenueAnalyticsDto();
            analytics.RevenueTrends = await _dbContext.Payments
                .Where(p => p.TenantId == tenantId && p.PaidAt.HasValue && p.PaidAt.Value >= (startDate ?? DateTime.UtcNow.AddDays(-30)) && p.PaidAt.Value <= (endDate ?? DateTime.UtcNow) && p.PaymentStatus == "Completed")
                .GroupBy(p => p.PaidAt.Value.Date)
                .Select(g => new RevenueTrendDto
                {
                    Date = g.Key,
                    TotalRevenue = g.Sum(p => p.Amount),
                    Commission = g.Sum(p => p.Amount * 0.10m),
                    NetRevenue = g.Sum(p => p.Amount * 0.90m)
                })
                .OrderBy(t => t.Date)
                .ToListAsync();

            return analytics;
        }

        public async Task<BookingAnalyticsDto> GetGlobalBookingAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            // System admin filters are automatically bypassed via claims
            var analytics = new BookingAnalyticsDto();
            analytics.BookingTrends = await _dbContext.Bookings
                .Where(b => b.CreatedAt >= (startDate ?? DateTime.UtcNow.AddDays(-30)) && b.CreatedAt <= (endDate ?? DateTime.UtcNow))
                .GroupBy(b => b.CreatedAt.Date)
                .Select(g => new BookingTrendDto
                {
                    Date = g.Key,
                    TotalBookings = g.Count(),
                    ConfirmedBookings = g.Count(b => b.Status == "Confirmed"),
                    CancelledBookings = g.Count(b => b.Status == "Cancelled"),
                    PendingBookings = g.Count(b => b.Status == "Pending")
                })
                .OrderBy(t => t.Date)
                .ToListAsync();

            return analytics;
        }

        public async Task<RevenueAnalyticsDto> GetGlobalRevenueAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            // System admin filters are automatically bypassed via claims
            var analytics = new RevenueAnalyticsDto();
            analytics.RevenueTrends = await _dbContext.Payments
                .Where(p => p.PaidAt.HasValue && p.PaidAt.Value >= (startDate ?? DateTime.UtcNow.AddDays(-30)) && p.PaidAt.Value <= (endDate ?? DateTime.UtcNow) && p.PaymentStatus == "Completed")
                .GroupBy(p => p.PaidAt.Value.Date)
                .Select(g => new RevenueTrendDto
                {
                    Date = g.Key,
                    TotalRevenue = g.Sum(p => p.Amount),
                    Commission = g.Sum(p => p.Amount * 0.10m),
                    NetRevenue = g.Sum(p => p.Amount * 0.90m)
                })
                .OrderBy(t => t.Date)
                .ToListAsync();

            return analytics;
        }
    }
}