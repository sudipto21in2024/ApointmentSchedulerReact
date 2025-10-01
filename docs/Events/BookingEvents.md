# Booking Events

## Overview

This document describes the events related to booking management in the Multi-Tenant Appointment Booking System. These events are triggered when bookings are created, confirmed, cancelled, or rescheduled.

## Events

### BookingCreatedEvent

**Description**: Triggered when a new booking is created by a customer.

**Triggered By**: BookingService

**Consumed By**: 
- PaymentService (to process payment)
- NotificationService (to send confirmation to customer and provider)
- ReportingService (to update booking analytics)
- ServiceManagementService (to update slot availability)

**Event Structure**:
```csharp
public class BookingCreatedEvent : IEvent
{
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid SlotId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime BookingDate { get; set; }
    public DateTime SlotStartDateTime { get; set; }
    public DateTime SlotEndDateTime { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public string Status { get; set; } // Pending, Confirmed, Cancelled
    public DateTime CreatedAt { get; set; }
}
```

**Business Rules**:
1. This event is published after successful booking creation
2. Contains all necessary booking information for downstream services
3. Includes tenant information for multi-tenancy support
4. New bookings may require payment processing
5. Providers may need to approve bookings before confirmation

### BookingConfirmedEvent

**Description**: Triggered when a booking is confirmed by the service provider.

**Triggered By**: BookingService

**Consumed By**: 
- NotificationService (to send confirmation to customer)
- ReportingService (to update booking analytics)
- ServiceManagementService (to finalize slot reservation)

**Event Structure**:
```csharp
public class BookingConfirmedEvent : IEvent
{
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime BookingDate { get; set; }
    public DateTime SlotStartDateTime { get; set; }
    public DateTime SlotEndDateTime { get; set; }
    public DateTime ConfirmedAt { get; set; }
}
```

### BookingCancelledEvent

**Description**: Triggered when a booking is cancelled by either the customer or provider.

**Triggered By**: BookingService

**Consumed By**: 
- PaymentService (to process refund if applicable)
- NotificationService (to notify affected parties)
- ReportingService (to update booking analytics)
- ServiceManagementService (to free up slot)

**Event Structure**:
```csharp
public class BookingCancelledEvent : IEvent
{
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public string CancellationReason { get; set; }
    public bool IsCustomerCancelled { get; set; }
    public decimal RefundAmount { get; set; }
    public DateTime CancelledAt { get; set; }
}
```

### BookingRescheduledEvent

**Description**: Triggered when a booking is rescheduled to a new time slot.

**Triggered By**: BookingService

**Consumed By**: 
- NotificationService (to notify affected parties)
- ReportingService (to update booking analytics)
- ServiceManagementService (to update slot availability)

**Event Structure**:
```csharp
public class BookingRescheduledEvent : IEvent
{
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime OldSlotStartDateTime { get; set; }
    public DateTime OldSlotEndDateTime { get; set; }
    public DateTime NewSlotStartDateTime { get; set; }
    public DateTime NewSlotEndDateTime { get; set; }
    public DateTime RescheduledAt { get; set; }
}
```

### BookingReminderEvent

**Description**: Triggered to send reminders for upcoming bookings.

**Triggered By**: BookingService (via scheduled jobs)

**Consumed By**: 
- NotificationService (to send reminder notifications)

**Event Structure**:
```csharp
public class BookingReminderEvent : IEvent
{
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime SlotStartDateTime { get; set; }
    public DateTime SlotEndDateTime { get; set; }
    public int ReminderType { get; set; } // 1 = 24 hours, 2 = 1 hour, etc.
    public DateTime ReminderAt { get; set; }
}
```

## Implementation Guidelines for AI Coding Agents

1. **Event Publishing**: All booking events should be published using MassTransit's `IPublishEndpoint`
2. **Validation**: Validate booking data before publishing events
3. **Consistency**: Ensure events contain consistent data with the booking entity
4. **Timing**: Publish events after database transactions are committed
5. **Error Handling**: Implement proper error handling and logging for event publishing
6. **Idempotency**: Ensure event handlers are idempotent to handle duplicate messages
7. **Security**: Ensure sensitive information is not included in events
8. **Saga Pattern**: For complex booking workflows involving multiple services, implement sagas

## Example Implementation

### Publishing an Event
```csharp
public class BookingService : IBookingService
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task CreateBookingAsync(CreateBookingRequest request)
    {
        // Create booking logic here
        
        // Publish event
        var bookingCreatedEvent = new BookingCreatedEvent
        {
            BookingId = booking.Id,
            CustomerId = booking.CustomerId,
            ServiceId = booking.ServiceId,
            SlotId = booking.SlotId,
            ProviderId = booking.Service.ProviderId,
            TenantId = booking.TenantId,
            BookingDate = booking.BookingDate,
            SlotStartDateTime = booking.Slot.StartDateTime,
            SlotEndDateTime = booking.Slot.EndDateTime,
            Price = booking.Service.Price,
            Currency = booking.Service.Currency,
            Status = booking.Status,
            CreatedAt = DateTime.UtcNow
        };
        
        await _publishEndpoint.Publish(bookingCreatedEvent);
    }
}
```

### Consuming an Event
```csharp
public class BookingCreatedConsumer : IConsumer<BookingCreatedEvent>
{
    private readonly ILogger<BookingCreatedConsumer> _logger;
    private readonly IPaymentService _paymentService;
    
    public async Task Consume(ConsumeContext<BookingCreatedEvent> context)
    {
        var bookingEvent = context.Message;
        
        // Process payment for the booking
        await _paymentService.ProcessPaymentAsync(new PaymentRequest
        {
            BookingId = bookingEvent.BookingId,
            Amount = bookingEvent.Price,
            Currency = bookingEvent.Currency
        });
        
        _logger.LogInformation("Payment processed for booking: {BookingId}", 
            bookingEvent.BookingId);
    }
}