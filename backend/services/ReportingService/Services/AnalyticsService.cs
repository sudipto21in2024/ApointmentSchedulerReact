using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using Shared.Validators;

namespace ReportingService.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _dbContext;

        public AnalyticsService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Gets booking analytics data aggregated by time periods
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Booking analytics data</returns>
        public async Task<BookingAnalyticsDto> GetBookingDataAsync(Guid providerId, Guid tenantId, AnalyticsFilterDto filter)
        {
            // Validate filter
            var validationResult = AnalyticsValidator.ValidateAnalyticsFilter(filter);
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            var analytics = new BookingAnalyticsDto();

            // Get date range for filtering
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddDays(-30);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            // Get bookings query
            var bookingsQuery = _dbContext.Bookings
                .Where(b => b.Service.ProviderId == providerId && 
                           b.TenantId == tenantId &&
                           b.CreatedAt >= startDate && 
                           b.CreatedAt <= endDate);

            if (filter.ServiceId.HasValue)
            {
                bookingsQuery = bookingsQuery.Where(b => b.ServiceId == filter.ServiceId.Value);
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                bookingsQuery = bookingsQuery.Where(b => b.Status == filter.Status);
            }

            // Get booking trends by time period
            switch (filter.TimePeriod.ToLower())
            {
                case "day":
                    analytics.BookingTrends = await bookingsQuery
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
                    break;

                case "week":
                    analytics.BookingTrends = await bookingsQuery
                        .GroupBy(b => new { Year = b.CreatedAt.Year, Week = CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(b.CreatedAt, CalendarWeekRule.FirstDay, DayOfWeek.Sunday) })
                        .Select(g => new BookingTrendDto
                        {
                            Date = new DateTime(g.Key.Year, 1, 1).AddDays((g.Key.Week - 1) * 7),
                            TotalBookings = g.Count(),
                            ConfirmedBookings = g.Count(b => b.Status == "Confirmed"),
                            CancelledBookings = g.Count(b => b.Status == "Cancelled"),
                            PendingBookings = g.Count(b => b.Status == "Pending")
                        })
                        .OrderBy(t => t.Date)
                        .ToListAsync();
                    break;

                case "month":
                    analytics.BookingTrends = await bookingsQuery
                        .GroupBy(b => new { Year = b.CreatedAt.Year, Month = b.CreatedAt.Month })
                        .Select(g => new BookingTrendDto
                        {
                            Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                            TotalBookings = g.Count(),
                            ConfirmedBookings = g.Count(b => b.Status == "Confirmed"),
                            CancelledBookings = g.Count(b => b.Status == "Cancelled"),
                            PendingBookings = g.Count(b => b.Status == "Pending")
                        })
                        .OrderBy(t => t.Date)
                        .ToListAsync();
                    break;
            }

            // Get bookings by service
            analytics.BookingsByService = await bookingsQuery
                .GroupBy(b => new { b.ServiceId, b.Service.Name })
                .Select(g => new BookingByServiceDto
                {
                    ServiceId = g.Key.ServiceId,
                    ServiceName = g.Key.Name,
                    TotalBookings = g.Count(),
                    TotalRevenue = g.SelectMany(b => b.Payments.Where(p => p.PaymentStatus == "Completed"))
                                    .Sum(p => (decimal?)p.Amount) ?? 0
                })
                .OrderByDescending(b => b.TotalBookings)
                .ToListAsync();

            // Get bookings by status
            analytics.BookingsByStatus = await bookingsQuery
                .GroupBy(b => b.Status)
                .Select(g => new BookingByStatusDto
                {
                    Status = g.Key,
                    Count = g.Count(),
                    Revenue = g.SelectMany(b => b.Payments.Where(p => p.PaymentStatus == "Completed"))
                               .Sum(p => (decimal?)p.Amount) ?? 0
                })
                .OrderByDescending(b => b.Count)
                .ToListAsync();

            // Calculate statistics
            var totalBookings = await bookingsQuery.CountAsync();
            var totalRevenue = await bookingsQuery
                .SelectMany(b => b.Payments.Where(p => p.PaymentStatus == "Completed"))
                .SumAsync(p => (decimal?)p.Amount) ?? 0;

            analytics.Statistics = new BookingStatisticsDto
            {
                TotalBookings = totalBookings,
                AverageBookingsPerDay = totalBookings / Math.Max(1, (endDate - startDate).TotalDays),
                PeakBookingDay = analytics.BookingTrends.Any() ? 
                                analytics.BookingTrends.Max(t => t.TotalBookings) : 0,
                CancellationRate = totalBookings > 0 ? 
                                 (double)(analytics.BookingsByStatus.FirstOrDefault(s => s.Status == "Cancelled")?.Count ?? 0) / totalBookings : 0
            };

            return analytics;
        }

        /// <summary>
        /// Gets revenue analytics data including earnings and commission tracking
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Revenue analytics data</returns>
        public async Task<RevenueAnalyticsDto> GetRevenueDataAsync(Guid providerId, Guid tenantId, AnalyticsFilterDto filter)
        {
            // Validate filter
            var validationResult = AnalyticsValidator.ValidateAnalyticsFilter(filter);
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            var analytics = new RevenueAnalyticsDto();

            // Get date range for filtering
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddDays(-30);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            // Get payments query
            var paymentsQuery = _dbContext.Payments
                .Where(p => p.Booking.Service.ProviderId == providerId && 
                           p.TenantId == tenantId &&
                           p.PaymentStatus == "Completed" &&
                           p.PaidAt >= startDate && 
                           p.PaidAt <= endDate);

            if (filter.ServiceId.HasValue)
            {
                paymentsQuery = paymentsQuery.Where(p => p.Booking.ServiceId == filter.ServiceId.Value);
            }

            // Get revenue trends by time period
            switch (filter.TimePeriod.ToLower())
            {
                case "day":
                    analytics.RevenueTrends = await paymentsQuery
                        .GroupBy(p => p.PaidAt.Value.Date)
                        .Select(g => new RevenueTrendDto
                        {
                            Date = g.Key,
                            TotalRevenue = g.Sum(p => p.Amount),
                            Commission = g.Sum(p => p.Amount * 0.10m), // Assuming 10% commission
                            NetRevenue = g.Sum(p => p.Amount * 0.90m) // Net revenue after commission
                        })
                        .OrderBy(t => t.Date)
                        .ToListAsync();
                    break;

                case "week":
                    analytics.RevenueTrends = await paymentsQuery
                        .GroupBy(p => new { Year = p.PaidAt.Value.Year, Week = CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(p.PaidAt.Value, CalendarWeekRule.FirstDay, DayOfWeek.Sunday) })
                        .Select(g => new RevenueTrendDto
                        {
                            Date = new DateTime(g.Key.Year, 1, 1).AddDays((g.Key.Week - 1) * 7),
                            TotalRevenue = g.Sum(p => p.Amount),
                            Commission = g.Sum(p => p.Amount * 0.10m), // Assuming 10% commission
                            NetRevenue = g.Sum(p => p.Amount * 0.90m)  // Net revenue after commission
                        })
                        .OrderBy(t => t.Date)
                        .ToListAsync();
                    break;

                case "month":
                    analytics.RevenueTrends = await paymentsQuery
                        .GroupBy(p => new { Year = p.PaidAt.Value.Year, Month = p.PaidAt.Value.Month })
                        .Select(g => new RevenueTrendDto
                        {
                            Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                            TotalRevenue = g.Sum(p => p.Amount),
                            Commission = g.Sum(p => p.Amount * 0.10m), // Assuming 10% commission
                            NetRevenue = g.Sum(p => p.Amount * 0.90m)  // Net revenue after commission
                        })
                        .OrderBy(t => t.Date)
                        .ToListAsync();
                    break;
            }

            // Get revenue by service
            analytics.RevenueByService = await paymentsQuery
                .GroupBy(p => new { p.Booking.ServiceId, p.Booking.Service.Name })
                .Select(g => new RevenueByServiceDto
                {
                    ServiceId = g.Key.ServiceId,
                    ServiceName = g.Key.Name,
                    TotalRevenue = g.Sum(p => p.Amount),
                    Commission = g.Sum(p => p.Amount * 0.10m), // Assuming 10% commission
                    NetRevenue = g.Sum(p => p.Amount * 0.90m)  // Net revenue after commission
                })
                .OrderByDescending(r => r.TotalRevenue)
                .ToListAsync();

            // Calculate statistics
            var totalRevenue = await paymentsQuery.SumAsync(p => (decimal?)p.Amount) ?? 0;
            var totalCommission = totalRevenue * 0.10m; // Assuming 10% commission
            var netRevenue = totalRevenue * 0.90m;      // Net revenue after commission

            var bookingCount = await _dbContext.Bookings
                .Where(b => b.Service.ProviderId == providerId && 
                           b.TenantId == tenantId &&
                           b.CreatedAt >= startDate && 
                           b.CreatedAt <= endDate)
                .CountAsync();

            analytics.Statistics = new RevenueStatisticsDto
            {
                TotalRevenue = totalRevenue,
                TotalCommission = totalCommission,
                NetRevenue = netRevenue,
                AverageRevenuePerBooking = bookingCount > 0 ? (double)(totalRevenue / bookingCount) : 0,
                PeakRevenueDay = analytics.RevenueTrends.Any() ? 
                                analytics.RevenueTrends.Max(t => t.TotalRevenue) : 0
            };

            return analytics;
        }

        /// <summary>
        /// Gets customer insights including booking history and feedback
        /// </summary>
        /// <param name="providerId">Service provider ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <param name="filter">Analytics filter parameters</param>
        /// <returns>Customer insights data</returns>
        public async Task<CustomerInsightsDto> GetCustomerDataAsync(Guid providerId, Guid tenantId, AnalyticsFilterDto filter)
        {
            // Validate filter
            var validationResult = AnalyticsValidator.ValidateAnalyticsFilter(filter);
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            var insights = new CustomerInsightsDto();

            // Get date range for filtering
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddDays(-30);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            // Get bookings query
            var bookingsQuery = _dbContext.Bookings
                .Include(b => b.Service) // Eagerly load Service for Service.Name
                .Include(b => b.Payments) // Eagerly load Payments for Amount calculation
                .Where(b => b.Service.ProviderId == providerId &&
                           b.TenantId == tenantId &&
                           b.CreatedAt >= startDate &&
                           b.CreatedAt <= endDate);

            if (filter.ServiceId.HasValue)
            {
                bookingsQuery = bookingsQuery.Where(b => b.ServiceId == filter.ServiceId.Value);
            }

            // Get customer booking history
            var customerBookingHistory = await bookingsQuery
                .Include(b => b.Service)
                .Include(b => b.Payments)
                .ToListAsync(); // Bring data into memory

            insights.CustomerBookingHistory = customerBookingHistory
                .GroupBy(b => new { b.CustomerId, b.Customer.FirstName, b.Customer.LastName, b.Customer.Email })
                .Select(g => new CustomerBookingHistoryDto
                {
                    CustomerId = g.Key.CustomerId,
                    CustomerName = g.Key.FirstName + " " + g.Key.LastName,
                    CustomerEmail = g.Key.Email,
                    TotalBookings = g.Count(),
                    TotalSpent = g.SelectMany(b => b.Payments.Where(p => p.PaymentStatus == "Completed"))
                                  .Sum(p => (decimal?)p.Amount) ?? 0,
                    LastBookingDate = g.Max(b => b.CreatedAt),
                    RecentBookings = g.OrderByDescending(b => b.CreatedAt)
                                      .Take(5)
                                      .Select(b => new BookingDetailDto
                                      {
                                          BookingId = b.Id,
                                          ServiceName = b.Service.Name,
                                          BookingDate = b.BookingDate,
                                          Status = b.Status,
                                          Amount = b.Payments.Where(p => p.PaymentStatus == "Completed").Sum(p => (decimal?)p.Amount) ?? 0
                                      })
                                      .ToList()
                })
                .OrderByDescending(c => c.TotalBookings)
                .ToList(); // Convert to list

            // Get customer feedback
            insights.CustomerFeedback = await _dbContext.Reviews
                .Where(r => r.Service.ProviderId == providerId && 
                           r.TenantId == tenantId &&
                           r.CreatedAt >= startDate && 
                           r.CreatedAt <= endDate)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new CustomerFeedbackDto
                {
                    CustomerId = r.CustomerId,
                    CustomerName = r.Customer.FirstName + " " + r.Customer.LastName,
                    Rating = r.Rating,
                    ReviewTitle = r.Title ?? "",
                    ReviewComment = r.Comment ?? "",
                    ReviewDate = r.CreatedAt,
                    ServiceId = r.ServiceId,
                    ServiceName = r.Service.Name
                })
                .ToListAsync();

            // Calculate statistics
            var totalCustomers = insights.CustomerBookingHistory.Count;
            var newCustomers = await _dbContext.Bookings
                .Where(b => b.Service.ProviderId == providerId && 
                           b.TenantId == tenantId &&
                           b.CreatedAt >= DateTime.UtcNow.AddDays(-30))
                .Select(b => b.CustomerId)
                .Distinct()
                .CountAsync();

            var mostActiveCustomer = insights.CustomerBookingHistory
                .OrderByDescending(c => c.TotalBookings)
                .FirstOrDefault();

            insights.Statistics = new CustomerStatisticsDto
            {
                TotalCustomers = totalCustomers,
                NewCustomersThisMonth = newCustomers,
                AverageBookingsPerCustomer = totalCustomers > 0 ? 
                                           (double)insights.CustomerBookingHistory.Sum(c => c.TotalBookings) / totalCustomers : 0,
                MostActiveCustomerBookings = mostActiveCustomer?.TotalBookings ?? 0,
                MostActiveCustomerName = mostActiveCustomer?.CustomerName ?? ""
            };

            return insights;
        }
    }
}