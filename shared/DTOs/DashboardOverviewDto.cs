using System;
using System.Collections.Generic;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for dashboard overview data including real-time booking and revenue information
    /// </summary>
    public class DashboardOverviewDto
    {
        public int TotalBookings { get; set; }
        public int TodayBookings { get; set; }
        public int PendingBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int CancelledBookings { get; set; }
        
        public decimal TotalRevenue { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal PendingRevenue { get; set; }
        public decimal CommissionDeductions { get; set; }
        
        public int TotalCustomers { get; set; }
        public int NewCustomersThisMonth { get; set; }
        
        public List<RecentBookingDto> RecentBookings { get; set; } = new List<RecentBookingDto>();
        public List<UpcomingBookingDto> UpcomingBookings { get; set; } = new List<UpcomingBookingDto>();
    }
    
    /// <summary>
    /// DTO for recent booking information in dashboard overview
    /// </summary>
    public class RecentBookingDto
    {
        public Guid BookingId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// DTO for upcoming booking information in dashboard overview
    /// </summary>
    public class UpcomingBookingDto
    {
        public Guid BookingId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public DateTime SlotStartDateTime { get; set; }
        public DateTime SlotEndDateTime { get; set; }
    }
}