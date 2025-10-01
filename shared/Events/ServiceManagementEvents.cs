using System;

namespace Shared.Events
{
    /// <summary>
    /// Event triggered when a new service is created by a service provider
    /// </summary>
    public class ServiceCreatedEvent : IEvent
    {
        public Guid ServiceId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public int Duration { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a service's information is updated
    /// </summary>
    public class ServiceUpdatedEvent : IEvent
    {
        public Guid ServiceId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public int Duration { get; set; }
        public bool IsActive { get; set; }
        public Guid TenantId { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a service is deleted from the system
    /// </summary>
    public class ServiceDeletedEvent : IEvent
    {
        public Guid ServiceId { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime DeletedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a service is published and made available for booking
    /// </summary>
    public class ServicePublishedEvent : IEvent
    {
        public Guid ServiceId { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime PublishedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a service is unpublished and no longer available for booking
    /// </summary>
    public class ServiceUnpublishedEvent : IEvent
    {
        public Guid ServiceId { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime UnpublishedAt { get; set; }
    }
}