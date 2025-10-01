# Payment Events

## Overview

This document describes the events related to payment processing in the Multi-Tenant Appointment Booking System. These events are triggered when payments are processed, refunded, or fail.

## Events

### PaymentProcessedEvent

**Description**: Triggered when a payment is successfully processed.

**Triggered By**: PaymentService

**Consumed By**: 
- BookingService (to confirm booking)
- NotificationService (to send payment confirmation)
- ReportingService (to update financial analytics)

**Event Structure**:
```csharp
public class PaymentProcessedEvent : IEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; }
    public string PaymentMethod { get; set; } // CreditCard, PayPal, etc.
    public string TransactionId { get; set; }
    public string PaymentGateway { get; set; } // Stripe, PayPal, etc.
    public DateTime ProcessedAt { get; set; }
}
```

**Business Rules**:
1. This event is published after successful payment processing
2. Contains all necessary payment information for downstream services
3. Includes tenant information for multi-tenancy support
4. Payment confirmation triggers booking confirmation

### PaymentRefundedEvent

**Description**: Triggered when a payment is refunded to the customer.

**Triggered By**: PaymentService

**Consumed By**: 
- BookingService (to update booking status)
- NotificationService (to send refund confirmation)
- ReportingService (to update financial analytics)

**Event Structure**:
```csharp
public class PaymentRefundedEvent : IEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public decimal RefundAmount { get; set; }
    public string Currency { get; set; }
    public string RefundReason { get; set; }
    public string TransactionId { get; set; }
    public DateTime RefundedAt { get; set; }
}
```

### PaymentFailedEvent

**Description**: Triggered when a payment processing attempt fails.

**Triggered By**: PaymentService

**Consumed By**: 
- BookingService (to handle failed booking)
- NotificationService (to notify customer)
- ReportingService (to track payment failures)

**Event Structure**:
```csharp
public class PaymentFailedEvent : IEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; }
    public string PaymentMethod { get; set; }
    public string FailureReason { get; set; }
    public DateTime FailedAt { get; set; }
}
```

## Implementation Guidelines for AI Coding Agents

1. **Event Publishing**: All payment events should be published using MassTransit's `IPublishEndpoint`
2. **Validation**: Validate payment data before publishing events
3. **Consistency**: Ensure events contain consistent data with the payment entity
4. **Timing**: Publish events after database transactions are committed
5. **Error Handling**: Implement proper error handling and logging for event publishing
6. **Idempotency**: Ensure event handlers are idempotent to handle duplicate messages
7. **Security**: Ensure sensitive payment information is not included in events
8. **Compensation**: Implement compensation logic for failed payments

## Example Implementation

### Publishing an Event
```csharp
public class PaymentService : IPaymentService
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task ProcessPaymentAsync(ProcessPaymentRequest request)
    {
        // Process payment logic here
        
        // Publish event
        var paymentProcessedEvent = new PaymentProcessedEvent
        {
            PaymentId = payment.Id,
            BookingId = payment.BookingId,
            CustomerId = payment.Booking.CustomerId,
            ProviderId = payment.Booking.Service.ProviderId,
            TenantId = payment.TenantId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentMethod = payment.PaymentMethod,
            TransactionId = payment.TransactionId,
            PaymentGateway = payment.PaymentGateway,
            ProcessedAt = DateTime.UtcNow
        };
        
        await _publishEndpoint.Publish(paymentProcessedEvent);
    }
}
```

### Consuming an Event
```csharp
public class PaymentProcessedConsumer : IConsumer<PaymentProcessedEvent>
{
    private readonly ILogger<PaymentProcessedConsumer> _logger;
    private readonly IBookingService _bookingService;
    
    public async Task Consume(ConsumeContext<PaymentProcessedEvent> context)
    {
        var paymentEvent = context.Message;
        
        // Confirm the booking since payment was successful
        await _bookingService.ConfirmBookingAsync(paymentEvent.BookingId);
        
        _logger.LogInformation("Booking confirmed after payment: {BookingId}", 
            paymentEvent.BookingId);
    }
}