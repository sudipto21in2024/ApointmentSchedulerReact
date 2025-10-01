# Slot Management Events

## Overview

This document describes the events related to slot management in the Multi-Tenant Appointment Booking System. These events are triggered when time slots are created, updated, or deleted for services.

## Events

### SlotCreatedEvent

**Description**: Triggered when a new time slot is created for a service.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- BookingService (to make slot available for booking)
- NotificationService (to notify provider of new availability)
- ReportingService (to update slot analytics)

**Event Structure**:
```csharp
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
```

**Business Rules**:
1. This event is published after successful slot creation
2. Contains all necessary slot information for downstream services
3. Includes tenant information for multi-tenancy support
4. Recurring slots may generate multiple events

### SlotUpdatedEvent

**Description**: Triggered when a time slot's information is updated.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- BookingService (to update slot availability)
- NotificationService (to notify affected parties)
- ReportingService (to update slot analytics)

**Event Structure**:
```csharp
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
```

### SlotDeletedEvent

**Description**: Triggered when a time slot is deleted.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- BookingService (to remove slot from availability)
- NotificationService (to notify affected parties)
- ReportingService (to update slot analytics)

**Event Structure**:
```csharp
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
```

## Implementation Guidelines for AI Coding Agents

1. **Event Publishing**: All slot management events should be published using MassTransit's `IPublishEndpoint`
2. **Validation**: Validate slot data before publishing events
3. **Consistency**: Ensure events contain consistent data with the slot entity
4. **Timing**: Publish events after database transactions are committed
5. **Error Handling**: Implement proper error handling and logging for event publishing
6. **Idempotency**: Ensure event handlers are idempotent to handle duplicate messages
7. **Conflict Detection**: Implement logic to detect and handle slot conflicts
8. **Recurring Slots**: Handle recurring slot events with special consideration

## Example Implementation

### Publishing an Event
```csharp
public class SlotManagementService : ISlotManagementService
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task CreateSlotAsync(CreateSlotRequest request)
    {
        // Create slot logic here
        
        // Publish event
        var slotCreatedEvent = new SlotCreatedEvent
        {
            SlotId = slot.Id,
            ServiceId = slot.ServiceId,
            ProviderId = slot.Service.ProviderId,
            TenantId = slot.TenantId,
            StartDateTime = slot.StartDateTime,
            EndDateTime = slot.EndDateTime,
            MaxBookings = slot.MaxBookings,
            IsRecurring = slot.IsRecurring,
            CreatedAt = DateTime.UtcNow
        };
        
        await _publishEndpoint.Publish(slotCreatedEvent);
    }
}
```

### Consuming an Event
```csharp
public class SlotCreatedConsumer : IConsumer<SlotCreatedEvent>
{
    private readonly ILogger<SlotCreatedConsumer> _logger;
    private readonly IBookingService _bookingService;
    
    public async Task Consume(ConsumeContext<SlotCreatedEvent> context)
    {
        var slotEvent = context.Message;
        
        // Make the slot available for booking
        await _bookingService.AddAvailableSlotAsync(slotEvent.SlotId);
        
        _logger.LogInformation("Slot created and made available: {SlotId}", 
            slotEvent.SlotId);
    }
}