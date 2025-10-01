using System;

namespace Shared.Events
{
    /// <summary>
    /// Event triggered when a new user registers in the system
    /// </summary>
    public class UserRegisteredEvent : IEvent
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty; // Customer, Provider, Admin
        public Guid TenantId { get; set; }
        public DateTime RegisteredAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a user's profile information is updated
    /// </summary>
    public class UserUpdatedEvent : IEvent
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public bool IsActive { get; set; }
        public Guid TenantId { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a user is deleted from the system
    /// </summary>
    public class UserDeletedEvent : IEvent
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public DateTime DeletedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a user updates their profile information
    /// </summary>
    public class UserProfileUpdatedEvent : IEvent
    {
        public Guid UserId { get; set; }
        public string FieldName { get; set; } = string.Empty; // e.g., "PhoneNumber", "Address"
        public string OldValue { get; set; } = string.Empty;
        public string NewValue { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a user changes their password
    /// </summary>
    public class PasswordChangedEvent : IEvent
    {
        public Guid UserId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime ChangedAt { get; set; }
    }
}