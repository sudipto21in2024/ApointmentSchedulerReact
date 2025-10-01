using System;

namespace Shared.DTOs
{
    /// <summary>
    /// Request model for updating a slot
    /// </summary>
    public class UpdateSlotRequest
    {
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public int? MaxBookings { get; set; }
        public bool? IsAvailable { get; set; }
    }
}