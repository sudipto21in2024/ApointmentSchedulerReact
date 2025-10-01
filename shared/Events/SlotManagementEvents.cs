using System;

namespace Shared.Events
{
    /// <summary>
    /// Event triggered when a new time slot is created for a service
    /// </summary>
    public class SlotCreatedEvent : IEvent
    {
        public Guid SlotId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int MaxBookings { get; set; }
        public bool IsRecurring { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a time slot's information is updated
    /// </summary>
    public class SlotUpdatedEvent : IEvent
    {
        public Guid SlotId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int MaxBookings { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a time slot is deleted
    /// </summary>
    public class SlotDeletedEvent : IEvent
    {
        public Guid SlotId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public DateTime DeletedAt { get; set; }
    }
}