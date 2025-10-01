using System;

namespace Shared.Events
{
    public class ServiceRejectedEvent : IEvent
    {
        public Guid ServiceId { get; set; }
        public Guid TenantId { get; set; }
        public Guid RejectedBy { get; set; }
        public DateTime RejectedAt { get; set; }
        public string? Reason { get; set; }
    }
}