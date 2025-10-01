using System;

namespace Shared.DTOs
{
    public class TenantDashboardOverviewDto
    {
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ActiveStaff { get; set; }
        public int TotalServices { get; set; }
        public int NewCustomers { get; set; }
        public decimal AverageBookingValue { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}