using System;

namespace Shared.DTOs
{
    public class SubscriptionUsageDto
    {
        public Guid SubscriptionId { get; set; }
        public int CurrentAppointments { get; set; }
        public int CurrentUsers { get; set; }
        public int MaxAppointments { get; set; }
        public int MaxUsers { get; set; }
    }
}