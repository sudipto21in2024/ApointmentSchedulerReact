using System;

namespace Shared.DTOs
{
    /// <summary>
    /// Request model for creating recurring slots
    /// </summary>
    public class CreateRecurringSlotsRequest
    {
        public Guid ServiceId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int MaxBookings { get; set; } = 1;
        public RecurrencePattern Pattern { get; set; } = RecurrencePattern.Daily;
        public int Interval { get; set; } = 1;
        public int Occurrences { get; set; } = 10;
        public DateTime? EndDate { get; set; }
    }
}