using System;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for dashboard filtering parameters
    /// </summary>
    public class DashboardFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? ServiceId { get; set; }
        public Guid? ProviderId { get; set; }
        public int Limit { get; set; } = 10;
    }
}