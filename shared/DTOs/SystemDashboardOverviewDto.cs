using System;

namespace Shared.DTOs
{
    public class SystemDashboardOverviewDto
    {
        public int TotalTenants { get; set; }
        public int TotalUsers { get; set; }
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ActiveServices { get; set; }
        public decimal SystemHealthScore { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}