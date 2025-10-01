using System;

namespace Shared.Events
{
    /// <summary>
    /// Event triggered when a new review is created for a service
    /// </summary>
    public class ReviewCreatedEvent : IEvent
    {
        public Guid ReviewId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public int Rating { get; set; } // 1-5 stars
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a review is updated
    /// </summary>
    public class ReviewUpdatedEvent : IEvent
    {
        public Guid ReviewId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public bool IsActive { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a review is deleted
    /// </summary>
    public class ReviewDeletedEvent : IEvent
    {
        public Guid ReviewId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public int Rating { get; set; }
        public DateTime DeletedAt { get; set; }
    }
}