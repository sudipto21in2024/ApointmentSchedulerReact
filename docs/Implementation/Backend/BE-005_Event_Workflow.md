# BE-005: Event-Driven Workflow Implementation

## Overview

This document details the event-driven workflow implementation for the booking system. The system uses MassTransit with RabbitMQ to implement asynchronous communication between services.

## Event Flow Diagram

```
[Booking API] --> [BookingCreatedEvent] --> [Booking Consumer]
                                           ↓
                                    [Payment Processing]
                                           ↓
                               [PaymentProcessedEvent / PaymentFailedEvent]
                                           ↓
                                 [Notification Processing]
                                           ↓
                            [NotificationSentEvent / NotificationFailedEvent]
```

## Core Events

### 1. Booking Events

#### BookingCreatedEvent
Triggered when a new booking is created.

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
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
}
```

#### BookingConfirmedEvent
Triggered when a booking is confirmed (after successful payment).

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

#### BookingCancelledEvent
Triggered when a booking is cancelled.

```csharp
public class BookingCancelledEvent : IEvent
{
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public string CancellationReason { get; set; } = string.Empty;
    public bool IsCustomerCancelled { get; set; }
    public decimal RefundAmount { get; set; }
    public DateTime CancelledAt { get; set; }
}
```

#### BookingRescheduledEvent
Triggered when a booking is rescheduled.

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

#### BookingReminderEvent
Triggered to send booking reminders.

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

### 2. Payment Events

#### PaymentProcessedEvent
Triggered when a payment is successfully processed.

```csharp
public class PaymentProcessedEvent : IEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string PaymentMethod { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public string PaymentGateway { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}
```

#### PaymentFailedEvent
Triggered when a payment processing attempt fails.

```csharp
public class PaymentFailedEvent : IEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string PaymentMethod { get; set; } = string.Empty;
    public string FailureReason { get; set; } = string.Empty;
    public DateTime FailedAt { get; set; }
}
```

#### PaymentRefundedEvent
Triggered when a payment is refunded.

```csharp
public class PaymentRefundedEvent : IEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public decimal RefundAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public string RefundReason { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public DateTime RefundedAt { get; set; }
}
```

### 3. Notification Events

#### NotificationSentEvent
Triggered when a notification is successfully sent.

```csharp
public class NotificationSentEvent : IEvent
{
    public Guid NotificationId { get; set; }
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public string Provider { get; set; } = string.Empty;
}
```

#### NotificationFailedEvent
Triggered when a notification fails to be delivered.

```csharp
public class NotificationFailedEvent : IEvent
{
    public Guid NotificationId { get; set; }
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string FailureReason { get; set; } = string.Empty;
    public DateTime FailedAt { get; set; }
    public string Provider { get; set; } = string.Empty;
}
```

## Workflow Implementation

### 1. Booking Creation Workflow

1. **API Request**: Client sends POST /bookings request
2. **Validation**: BookingController validates request
3. **Booking Creation**: BookingService creates booking with "Pending" status
4. **Event Publishing**: BookingController publishes BookingCreatedEvent
5. **Event Consumption**: BookingCreatedConsumer processes the event
6. **Payment Processing**: BookingCreatedConsumer initiates payment processing
7. **Payment Event**: PaymentProcessor publishes PaymentProcessedEvent or PaymentFailedEvent
8. **Notification**: Based on payment result, NotificationProcessor sends appropriate notifications
9. **Status Update**: Booking status is updated based on payment result

### 2. Booking Confirmation Workflow

1. **Payment Success**: PaymentProcessedEvent is received
2. **Booking Update**: Booking status is updated to "Confirmed"
3. **Confirmation Event**: BookingConfirmedEvent is published
4. **Notification**: Confirmation notifications are sent to customer and provider

### 3. Booking Cancellation Workflow

1. **API Request**: Client sends DELETE /bookings/{id} request
2. **Validation**: BookingController validates cancellation request
3. **Cancellation**: BookingService cancels booking and updates status to "Cancelled"
4. **Event Publishing**: BookingController publishes BookingCancelledEvent
5. **Refund Processing**: If applicable, refund is processed
6. **Notification**: Cancellation notifications are sent to customer and provider

### 4. Booking Rescheduling Workflow

1. **API Request**: Client sends PUT /bookings/{id}/reschedule request
2. **Validation**: BookingController validates rescheduling request
3. **Rescheduling**: BookingService updates booking with new slot
4. **Event Publishing**: BookingController publishes BookingRescheduledEvent
5. **Notification**: Rescheduling notifications are sent to customer and provider

### 5. Booking Reminder Workflow

1. **Scheduled Job**: Background job runs periodically to check upcoming bookings
2. **Event Publishing**: For each upcoming booking, BookingReminderEvent is published
3. **Notification**: Reminder notifications are sent to customer and provider

## Consumer Implementation

### BookingCreatedConsumer

```csharp
public class BookingCreatedConsumer : IConsumer<BookingCreatedEvent>
{
    private readonly IBookingProcessor _bookingProcessor;
    private readonly ILogger<BookingCreatedConsumer> _logger;

    public async Task Consume(ConsumeContext<BookingCreatedEvent> context)
    {
        var bookingEvent = context.Message;
        
        try
        {
            _logger.LogInformation("Processing BookingCreatedEvent for booking {BookingId}", bookingEvent.BookingId);
            
            // Process payment
            await _bookingProcessor.ProcessBookingPaymentAsync(bookingEvent);
            
            _logger.LogInformation("Completed processing BookingCreatedEvent for booking {BookingId}", bookingEvent.BookingId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing BookingCreatedEvent for booking {BookingId}", bookingEvent.BookingId);
            throw;
        }
    }
}
```

### PaymentProcessedConsumer

```csharp
public class PaymentProcessedConsumer : IConsumer<PaymentProcessedEvent>
{
    private readonly IBookingProcessor _bookingProcessor;
    private readonly ILogger<PaymentProcessedConsumer> _logger;

    public async Task Consume(ConsumeContext<PaymentProcessedEvent> context)
    {
        var paymentEvent = context.Message;
        
        try
        {
            _logger.LogInformation("Processing PaymentProcessedEvent for payment {PaymentId}", paymentEvent.PaymentId);
            
            // Confirm booking
            await _bookingProcessor.ConfirmBookingAsync(paymentEvent.BookingId);
            
            // Send confirmation notifications
            await _bookingProcessor.SendBookingConfirmationAsync(paymentEvent.BookingId);
            
            _logger.LogInformation("Completed processing PaymentProcessedEvent for payment {PaymentId}", paymentEvent.PaymentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PaymentProcessedEvent for payment {PaymentId}", paymentEvent.PaymentId);
            throw;
        }
    }
}
```

### PaymentFailedConsumer

```csharp
public class PaymentFailedConsumer : IConsumer<PaymentFailedEvent>
{
    private readonly IBookingProcessor _bookingProcessor;
    private readonly ILogger<PaymentFailedConsumer> _logger;

    public async Task Consume(ConsumeContext<PaymentFailedEvent> context)
    {
        var paymentEvent = context.Message;
        
        try
        {
            _logger.LogInformation("Processing PaymentFailedEvent for payment {PaymentId}", paymentEvent.PaymentId);
            
            // Cancel booking due to payment failure
            await _bookingProcessor.CancelBookingDueToPaymentFailureAsync(paymentEvent.BookingId);
            
            // Send failure notifications
            await _bookingProcessor.SendPaymentFailureNotificationAsync(paymentEvent);
            
            _logger.LogInformation("Completed processing PaymentFailedEvent for payment {PaymentId}", paymentEvent.PaymentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PaymentFailedEvent for payment {PaymentId}", paymentEvent.PaymentId);
            throw;
        }
    }
}
```

## Event Configuration

### MassTransit Configuration

```csharp
// In Program.cs
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<BookingCreatedConsumer>();
    x.AddConsumer<PaymentProcessedConsumer>();
    x.AddConsumer<PaymentFailedConsumer>();
    x.AddConsumer<BookingCancelledConsumer>();
    x.AddConsumer<BookingRescheduledConsumer>();
    
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
        
        cfg.ReceiveEndpoint("booking-events", e =>
        {
            e.ConfigureConsumer<BookingCreatedConsumer>(context);
        });
        
        cfg.ReceiveEndpoint("payment-processed-events", e =>
        {
            e.ConfigureConsumer<PaymentProcessedConsumer>(context);
        });
        
        cfg.ReceiveEndpoint("payment-failed-events", e =>
        {
            e.ConfigureConsumer<PaymentFailedConsumer>(context);
        });
    });
});
```

## Error Handling and Retry Policies

### Retry Configuration

```csharp
// In MassTransit configuration
cfg.ReceiveEndpoint("booking-events", e =>
{
    e.UseMessageRetry(r => r.Interval(3, TimeSpan.FromMinutes(1)));
    e.ConfigureConsumer<BookingCreatedConsumer>(context);
});
```

### Dead Letter Queue

```csharp
// In MassTransit configuration
cfg.ReceiveEndpoint("booking-events", e =>
{
    e.UseMessageRetry(r => r.Interval(3, TimeSpan.FromMinutes(1)));
    e.UseDeadLetterQueue();
    e.ConfigureConsumer<BookingCreatedConsumer>(context);
});
```

## Monitoring and Observability

### Event Tracking

1. **Event Publishing**: Log when events are published
2. **Event Consumption**: Log when events are consumed
3. **Processing Time**: Track event processing duration
4. **Error Tracking**: Log and track event processing failures

### Correlation IDs

```csharp
public class BookingCreatedEvent : IEvent
{
    public Guid CorrelationId { get; set; } = Guid.NewGuid();
    // ... other properties
}
```

## Performance Considerations

### 1. Batch Processing
- Process multiple events in batches when possible
- Use parallel processing for independent events

### 2. Event Ordering
- Ensure events are processed in the correct order
- Use message sequencing where necessary

### 3. Event Size
- Keep events small and focused
- Avoid sending large payloads in events

## Security Considerations

### 1. Event Validation
- Validate all incoming events
- Verify event integrity

### 2. Authentication
- Secure event endpoints
- Use authentication for event publishing

### 3. Authorization
- Verify permissions for event processing
- Implement role-based access control

## Testing Strategy

### 1. Unit Tests
- Test event creation and publishing
- Test consumer logic
- Mock external dependencies

### 2. Integration Tests
- Test end-to-end event flows
- Test event processing with real database
- Test error scenarios

### 3. Load Testing
- Test event processing under load
- Test system scalability
- Test failure recovery

This event-driven workflow implementation provides a robust, scalable, and maintainable approach to handling the booking business logic while ensuring proper separation of concerns and asynchronous processing.