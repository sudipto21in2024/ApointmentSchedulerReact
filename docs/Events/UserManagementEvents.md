# User Management Events

## Overview

This document describes the events related to user management in the Multi-Tenant Appointment Booking System. These events are triggered when users are created, updated, or deleted in the system.

## Events

### UserRegisteredEvent

**Description**: Triggered when a new user registers in the system.

**Triggered By**: UserService

**Consumed By**: 
- NotificationService (to send welcome email)
- ReportingService (to update user analytics)

**Event Structure**:
```csharp
public class UserRegisteredEvent : IEvent
{
    public Guid UserId { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserType { get; set; } // Customer, Provider, Admin
    public Guid TenantId { get; set; }
    public DateTime RegisteredAt { get; set; }
}
```

**Business Rules**:
1. This event is published after successful user registration
2. Contains all necessary user information for downstream services
3. Includes tenant information for multi-tenancy support

### UserUpdatedEvent

**Description**: Triggered when a user's profile information is updated.

**Triggered By**: UserService

**Consumed By**: 
- ReportingService (to update user analytics)
- NotificationService (for audit purposes)

**Event Structure**:
```csharp
public class UserUpdatedEvent : IEvent
{
    public Guid UserId { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public Guid TenantId { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### UserDeletedEvent

**Description**: Triggered when a user is deleted from the system.

**Triggered By**: UserService

**Consumed By**: 
- ReportingService (to update user analytics)
- NotificationService (for audit purposes)

**Event Structure**:
```csharp
public class UserDeletedEvent : IEvent
{
    public Guid UserId { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserType { get; set; }
    public Guid TenantId { get; set; }
    public DateTime DeletedAt { get; set; }
}
```

### UserProfileUpdatedEvent

**Description**: Triggered when a user updates their profile information.

**Triggered By**: UserService

**Consumed By**: 
- NotificationService (to send confirmation)
- ReportingService (to update user engagement metrics)

**Event Structure**:
```csharp
public class UserProfileUpdatedEvent : IEvent
{
    public Guid UserId { get; set; }
    public string FieldName { get; set; } // e.g., "PhoneNumber", "Address"
    public string OldValue { get; set; }
    public string NewValue { get; set; }
    public Guid TenantId { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

## Implementation Guidelines for AI Coding Agents

1. **Event Publishing**: All user management events should be published using MassTransit's `IPublishEndpoint`
2. **Error Handling**: Implement proper error handling and logging for event publishing
3. **Idempotency**: Ensure event handlers are idempotent to handle duplicate messages
4. **Validation**: Validate all event data before publishing
5. **Security**: Ensure sensitive information is not included in events
6. **Serialization**: Use JSON serialization for event data
7. **Versioning**: Include version information in events for backward compatibility

## Example Implementation

### Publishing an Event
```csharp
public class UserService : IUserService
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task RegisterUserAsync(RegisterUserRequest request)
    {
        // Create user logic here
        
        // Publish event
        var userRegisteredEvent = new UserRegisteredEvent
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            UserType = user.UserType.ToString(),
            TenantId = user.TenantId,
            RegisteredAt = DateTime.UtcNow
        };
        
        await _publishEndpoint.Publish(userRegisteredEvent);
    }
}
```

### Consuming an Event
```csharp
public class UserRegisteredConsumer : IConsumer<UserRegisteredEvent>
{
    private readonly ILogger<UserRegisteredConsumer> _logger;
    
    public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        var userEvent = context.Message;
        
        // Process the event
        _logger.LogInformation("User registered: {UserId}, Email: {Email}", 
            userEvent.UserId, userEvent.Email);
        
        // Send welcome email, update analytics, etc.
    }
}