using System;
using System.Collections.Generic;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for booking analytics data aggregated by time periods
    /// </summary>
    public class BookingAnalyticsDto
    {
        public List<BookingTrendDto> BookingTrends { get; set; } = new List<BookingTrendDto>();
        public List<BookingByServiceDto> BookingsByService { get; set; } = new List<BookingByServiceDto>();
        public List<BookingByStatusDto> BookingsByStatus { get; set; } = new List<BookingByStatusDto>();
        public BookingStatisticsDto Statistics { get; set; } = new BookingStatisticsDto();
    }
    
    /// <summary>
    /// DTO for booking trends over time
    /// </summary>
    public class BookingTrendDto
    {
        public DateTime Date { get; set; }
        public int TotalBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public int PendingBookings { get; set; }
    }
    
    /// <summary>
    /// DTO for bookings grouped by service
    /// </summary>
    public class BookingByServiceDto
    {
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
    }
    
    /// <summary>
    /// DTO for bookings grouped by status
    /// </summary>
    public class BookingByStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }
    
    /// <summary>
    /// DTO for booking statistics
    /// </summary>
    public class BookingStatisticsDto
    {
        public int TotalBookings { get; set; }
        public double AverageBookingsPerDay { get; set; }
        public int PeakBookingDay { get; set; }
        public double CancellationRate { get; set; }
    }
}