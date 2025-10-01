using System;

namespace Shared.DTOs
{
    /// <summary>
    /// Request model for creating a slot
    /// </summary>
    public class CreateSlotRequest
    {
        public Guid ServiceId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int MaxBookings { get; set; } = 1;
        public bool IsAvailable { get; set; } = true;
        public bool IsRecurring { get; set; } = false;
    }
}