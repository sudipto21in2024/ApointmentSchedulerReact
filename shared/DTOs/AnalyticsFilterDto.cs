using System;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for analytics filtering parameters
    /// </summary>
    public class AnalyticsFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string TimePeriod { get; set; } = "day"; // day, week, month
        public Guid? ServiceId { get; set; }
        public Guid? ProviderId { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}