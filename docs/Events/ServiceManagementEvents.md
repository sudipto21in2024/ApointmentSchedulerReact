# Service Management Events

## Overview

This document describes the events related to service management in the Multi-Tenant Appointment Booking System. These events are triggered when services are created, updated, deleted, or their publication status changes.

## Events

### ServiceCreatedEvent

**Description**: Triggered when a new service is created by a service provider.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- SearchService (to index the new service)
- NotificationService (to notify admin for approval)
- ReportingService (to update service analytics)

**Event Structure**:
```csharp
public class ServiceCreatedEvent : IEvent
{
    public Guid ServiceId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public Guid CategoryId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public int Duration { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Business Rules**:
1. This event is published after successful service creation
2. Contains all necessary service information for downstream services
3. Includes tenant information for multi-tenancy support
4. New services may require admin approval before being published

### ServiceUpdatedEvent

**Description**: Triggered when a service's information is updated.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- SearchService (to reindex the updated service)
- NotificationService (for audit purposes)
- ReportingService (to update service analytics)

**Event Structure**:
```csharp
public class ServiceUpdatedEvent : IEvent
{
    public Guid ServiceId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public int Duration { get; set; }
    public bool IsActive { get; set; }
    public Guid TenantId { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### ServiceDeletedEvent

**Description**: Triggered when a service is deleted from the system.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- SearchService (to remove the service from index)
- NotificationService (to notify affected users)
- ReportingService (to update service analytics)

**Event Structure**:
```csharp
public class ServiceDeletedEvent : IEvent
{
    public Guid ServiceId { get; set; }
    public string Name { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime DeletedAt { get; set; }
}
```

### ServicePublishedEvent

**Description**: Triggered when a service is published and made available for booking.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- SearchService (to make service discoverable)
- NotificationService (to notify provider and subscribers)
- ReportingService (to update service availability metrics)

**Event Structure**:
```csharp
public class ServicePublishedEvent : IEvent
{
    public Guid ServiceId { get; set; }
    public string Name { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime PublishedAt { get; set; }
}
```

### ServiceUnpublishedEvent

**Description**: Triggered when a service is unpublished and no longer available for booking.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- SearchService (to remove service from discoverable results)
- NotificationService (to notify affected users)
- BookingService (to prevent new bookings)

**Event Structure**:
```csharp
public class ServiceUnpublishedEvent : IEvent
{
    public Guid ServiceId { get; set; }
    public string Name { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime UnpublishedAt { get; set; }
}
```

## Implementation Guidelines for AI Coding Agents

1. **Event Publishing**: All service management events should be published using MassTransit's `IPublishEndpoint`
2. **Validation**: Validate service data before publishing events
3. **Consistency**: Ensure events contain consistent data with the service entity
4. **Timing**: Publish events after database transactions are committed
5. **Error Handling**: Implement proper error handling and logging for event publishing
6. **Idempotency**: Ensure event handlers are idempotent to handle duplicate messages
7. **Security**: Ensure sensitive information is not included in events

## Example Implementation

### Publishing an Event
```csharp
public class ServiceManagementService : IServiceManagementService
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task CreateServiceAsync(CreateServiceRequest request)
    {
        // Create service logic here
        
        // Publish event
        var serviceCreatedEvent = new ServiceCreatedEvent
        {
            ServiceId = service.Id,
            Name = service.Name,
            Description = service.Description,
            CategoryId = service.CategoryId,
            ProviderId = service.ProviderId,
            TenantId = service.TenantId,
            Price = service.Price,
            Currency = service.Currency,
            Duration = service.Duration,
            CreatedAt = DateTime.UtcNow
        };
        
        await _publishEndpoint.Publish(serviceCreatedEvent);
    }
}
```

### Consuming an Event
```csharp
public class ServiceCreatedConsumer : IConsumer<ServiceCreatedEvent>
{
    private readonly ILogger<ServiceCreatedConsumer> _logger;
    private readonly ISearchService _searchService;
    
    public async Task Consume(ConsumeContext<ServiceCreatedEvent> context)
    {
        var serviceEvent = context.Message;
        
        // Index the new service in search
        await _searchService.IndexServiceAsync(serviceEvent.ServiceId);
        
        _logger.LogInformation("Service created and indexed: {ServiceId}, Name: {Name}", 
            serviceEvent.ServiceId, serviceEvent.Name);
    }
}