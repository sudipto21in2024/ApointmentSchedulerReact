# BE-005: Service Layer Architecture Design

## Overview

This document details the service layer architecture for the Booking Service implementation. The architecture follows a clean, modular design that separates concerns and enables testability.

## Directory Structure

```
backend/services/BookingService/
├── Services/
│   ├── IBookingService.cs
│   ├── BookingService.cs
│   ├── ISlotService.cs
│   ├── SlotService.cs
│   ├── IPaymentService.cs
│   ├── PaymentService.cs
│   ├── INotificationService.cs
│   └── NotificationService.cs
├── Processors/
│   ├── IBookingProcessor.cs
│   ├── BookingProcessor.cs
│   ├── IPaymentProcessor.cs
│   ├── PaymentProcessor.cs
│   ├── INotificationProcessor.cs
│   └── NotificationProcessor.cs
├── Validators/
│   ├── IBookingValidator.cs
│   ├── BookingValidator.cs
│   ├── ISlotValidator.cs
│   └── SlotValidator.cs
├── Extensions/
│   └── ServiceCollectionExtensions.cs
└── Exceptions/
    ├── BusinessRuleViolationException.cs
    ├── SlotNotAvailableException.cs
    └── PaymentProcessingException.cs
```

## Service Layer Components

### 1. Services

Services contain the core business logic and interact directly with the data layer.

#### IBookingService
```csharp
public interface IBookingService
{
    Task<Booking> CreateBookingAsync(CreateBookingRequest request);
    Task<Booking> GetBookingByIdAsync(Guid bookingId);
    Task<Booking> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request);
    Task<Booking> CancelBookingAsync(Guid bookingId, CancelBookingRequest request);
    Task<Booking> ConfirmBookingAsync(Guid bookingId);
    Task<IEnumerable<Booking>> GetBookingsAsync(BookingFilter filter);
    Task<Booking> RescheduleBookingAsync(Guid bookingId, RescheduleBookingRequest request);
}
```

#### ISlotService
```csharp
public interface ISlotService
{
    Task<Slot> GetSlotByIdAsync(Guid slotId);
    Task<IEnumerable<Slot>> GetAvailableSlotsAsync(GetAvailableSlotsRequest request);
    Task<bool> IsSlotAvailableAsync(Guid slotId);
    Task<Slot> UpdateSlotAvailabilityAsync(Guid slotId, int bookingCount);
    Task<IEnumerable<Slot>> GetSlotsByServiceAsync(Guid serviceId, DateTime startDate, DateTime endDate);
}
```

#### IPaymentService
```csharp
public interface IPaymentService
{
    Task<Payment> ProcessPaymentAsync(ProcessPaymentRequest request);
    Task<Payment> GetPaymentByIdAsync(Guid paymentId);
    Task<Payment> RefundPaymentAsync(Guid paymentId, RefundPaymentRequest request);
    Task<IEnumerable<Payment>> GetPaymentsByBookingAsync(Guid bookingId);
}
```

#### INotificationService
```csharp
public interface INotificationService
{
    Task<Notification> SendNotificationAsync(SendNotificationRequest request);
    Task<Notification> GetNotificationByIdAsync(Guid notificationId);
    Task<IEnumerable<Notification>> GetNotificationsByUserAsync(Guid userId);
    Task MarkNotificationAsReadAsync(Guid notificationId);
}
```

### 2. Processors

Processors handle complex workflows and coordinate between services.

#### IBookingProcessor
```csharp
public interface IBookingProcessor
{
    Task<Booking> ProcessNewBookingAsync(CreateBookingRequest request);
    Task ProcessBookingCancellationAsync(Guid bookingId, CancelBookingRequest request);
    Task ProcessBookingConfirmationAsync(Guid bookingId);
    Task ProcessBookingReschedulingAsync(Guid bookingId, RescheduleBookingRequest request);
}
```

#### IPaymentProcessor
```csharp
public interface IPaymentProcessor
{
    Task<Payment> ProcessBookingPaymentAsync(Guid bookingId, ProcessPaymentRequest request);
    Task<Payment> ProcessBookingRefundAsync(Guid bookingId, RefundPaymentRequest request);
}
```

#### INotificationProcessor
```csharp
public interface INotificationProcessor
{
    Task SendBookingConfirmationAsync(Guid bookingId);
    Task SendBookingCancellationAsync(Guid bookingId);
    Task SendBookingReschedulingAsync(Guid bookingId);
    Task SendBookingReminderAsync(Guid bookingId);
}
```

### 3. Validators

Validators handle request validation and business rule validation.

#### IBookingValidator
```csharp
public interface IBookingValidator
{
    Task ValidateCreateBookingRequestAsync(CreateBookingRequest request);
    Task ValidateUpdateBookingRequestAsync(Guid bookingId, UpdateBookingRequest request);
    Task ValidateCancelBookingRequestAsync(Guid bookingId, CancelBookingRequest request);
    Task ValidateRescheduleBookingRequestAsync(Guid bookingId, RescheduleBookingRequest request);
}
```

#### ISlotValidator
```csharp
public interface ISlotValidator
{
    Task ValidateSlotAvailabilityAsync(Guid slotId);
    Task ValidateSlotCapacityAsync(Guid slotId, int requestedBookings);
}
```

### 4. Extensions

Extensions for dependency injection registration.

#### ServiceCollectionExtensions
```csharp
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBookingServices(this IServiceCollection services)
    {
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<ISlotService, SlotService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<INotificationService, NotificationService>();
        
        services.AddScoped<IBookingProcessor, BookingProcessor>();
        services.AddScoped<IPaymentProcessor, PaymentProcessor>();
        services.AddScoped<INotificationProcessor, NotificationProcessor>();
        
        services.AddScoped<IBookingValidator, BookingValidator>();
        services.AddScoped<ISlotValidator, SlotValidator>();
        
        return services;
    }
}
```

## Implementation Patterns

### 1. Dependency Injection

All services and processors will be registered with the DI container for loose coupling:

```csharp
// In Program.cs
builder.Services.AddBookingServices();
```

### 2. Async/Await Pattern

All service methods will be asynchronous to ensure non-blocking operations:

```csharp
public async Task<Booking> CreateBookingAsync(CreateBookingRequest request)
{
    // Implementation
}
```

### 3. Exception Handling

Custom exceptions for specific business scenarios:

```csharp
public class BusinessRuleViolationException : Exception
{
    public BusinessRuleViolationException(string message) : base(message) { }
}

public class SlotNotAvailableException : Exception
{
    public SlotNotAvailableException(string message) : base(message) { }
}

public class PaymentProcessingException : Exception
{
    public PaymentProcessingException(string message) : base(message) { }
}
```

### 4. Transaction Management

Use database transactions for multi-step operations:

```csharp
public async Task<Booking> CreateBookingAsync(CreateBookingRequest request)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // Multiple database operations
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return booking;
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## Data Flow

1. **API Controller** receives HTTP requests
2. **Validators** validate requests
3. **Processors** coordinate complex workflows
4. **Services** execute business logic
5. **Data Access** interacts with database
6. **Events** are published for async processing
7. **Consumers** handle events and trigger further processing

## Communication Patterns

### 1. Synchronous Communication
- API to Services
- Services to Data Access

### 2. Asynchronous Communication
- Services to Event Bus (MassTransit)
- Event Bus to Consumers
- Consumers to Services

## Testing Strategy

### 1. Unit Tests
- Mock all dependencies
- Test each method in isolation
- Cover all business rules
- Test edge cases and error conditions

### 2. Integration Tests
- Test service interactions with real database
- Test event publishing
- Test complex workflows

### 3. Mock Implementations
```csharp
public class MockBookingService : IBookingService
{
    // Mock implementation for testing
}
```

## Performance Considerations

### 1. Caching
- Cache frequently accessed data
- Use Redis for distributed caching
- Implement cache invalidation

### 2. Database Optimization
- Use proper indexing
- Optimize complex queries
- Use connection pooling

### 3. Concurrency
- Handle concurrent booking requests
- Use database locking for critical sections
- Implement retry mechanisms

## Security Considerations

### 1. Input Validation
- Validate all inputs
- Sanitize user data
- Prevent injection attacks

### 2. Authentication & Authorization
- Verify user permissions
- Implement role-based access control
- Secure sensitive operations

### 3. Data Protection
- Encrypt sensitive data
- Use parameterized queries
- Implement audit logging

## Monitoring & Observability

### 1. Logging
- Structured logging with correlation IDs
- Log business events
- Log performance metrics

### 2. Metrics
- Track booking creation rates
- Monitor payment success rates
- Measure notification delivery rates

### 3. Health Checks
- Database connectivity
- External service dependencies
- Service availability

This architecture provides a solid foundation for implementing the booking business logic while maintaining separation of concerns, testability, and scalability.