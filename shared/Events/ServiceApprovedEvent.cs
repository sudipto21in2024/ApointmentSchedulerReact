using System;

namespace Shared.Events
{
    public class ServiceApprovedEvent : IEvent
    {
        public Guid ServiceId { get; set; }
        public Guid TenantId { get; set; }
        public Guid ApprovedBy { get; set; }
        public DateTime ApprovedAt { get; set; }
    }
}