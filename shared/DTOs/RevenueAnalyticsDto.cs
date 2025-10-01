using System;
using System.Collections.Generic;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for revenue analytics data including earnings and commission tracking
    /// </summary>
    public class RevenueAnalyticsDto
    {
        public List<RevenueTrendDto> RevenueTrends { get; set; } = new List<RevenueTrendDto>();
        public List<RevenueByServiceDto> RevenueByService { get; set; } = new List<RevenueByServiceDto>();
        public RevenueStatisticsDto Statistics { get; set; } = new RevenueStatisticsDto();
    }
    
    /// <summary>
    /// DTO for revenue trends over time
    /// </summary>
    public class RevenueTrendDto
    {
        public DateTime Date { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal Commission { get; set; }
        public decimal NetRevenue { get; set; }
    }
    
    /// <summary>
    /// DTO for revenue grouped by service
    /// </summary>
    public class RevenueByServiceDto
    {
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public decimal Commission { get; set; }
        public decimal NetRevenue { get; set; }
    }
    
    /// <summary>
    /// DTO for revenue statistics
    /// </summary>
    public class RevenueStatisticsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalCommission { get; set; }
        public decimal NetRevenue { get; set; }
        public double AverageRevenuePerBooking { get; set; }
        public decimal PeakRevenueDay { get; set; }
    }
}