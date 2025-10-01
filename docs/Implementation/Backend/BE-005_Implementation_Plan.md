# BE-005: Implement Core Booking and Appointment Business Logic - Implementation Plan

## Executive Summary

This document outlines a comprehensive plan for implementing the core booking and appointment business logic as specified in task BE-005. The current implementation has several gaps that need to be addressed to ensure a complete and robust booking system.

## Current State Analysis

### What's Already Implemented
1. Basic BookingController with create endpoint
2. BookingCreatedConsumer that logs events
3. PaymentController with process payment endpoint
4. NotificationController with send notification endpoint
5. Complete database schema with all required entities
6. Entity Framework models and DbContext configuration
7. Event definitions for all business processes

### Key Gaps Identified
1. Missing business logic implementation in services layer
2. Lack of proper validation and error handling
3. Incomplete event-driven workflow implementation
4. Missing slot availability checking
5. No proper booking status management
6. Absence of cancellation and rescheduling functionality
7. Limited test coverage
8. Missing proper transaction management

## Recommended Implementation Approach

### 1. Service Layer Architecture

Create a dedicated service layer to encapsulate business logic:

```
backend/services/BookingService/
├── Services/
│   ├── BookingService.cs
│   ├── SlotService.cs
│   └── ValidationService.cs
├── Processors/
│   ├── BookingProcessor.cs
│   ├── PaymentProcessor.cs
│   └── NotificationProcessor.cs
├── Validators/
│   ├── BookingValidator.cs
│   └── SlotValidator.cs
└── Extensions/
    └── ServiceCollectionExtensions.cs
```

### 2. Core Business Logic Components

#### Booking Service
- Create booking with slot availability validation
- Handle booking confirmation workflow
- Implement booking cancellation with policy enforcement
- Manage booking rescheduling
- Track booking status changes with audit trail

#### Slot Service
- Check slot availability
- Manage slot capacity
- Handle concurrent booking requests
- Update slot availability after bookings

#### Validation Service
- Validate booking requests
- Check business rule compliance
- Validate cancellation policies
- Ensure data integrity

### 3. Event-Driven Workflow Implementation

The system should follow this workflow:

1. **Booking Creation**
   - API receives booking request
   - Validate request and check slot availability
   - Create booking in database with "Pending" status
   - Publish BookingCreatedEvent

2. **Booking Processing**
   - BookingCreatedConsumer receives event
   - Initiate payment processing
   - Update booking status based on payment result
   - Send notifications to customer and provider

3. **Payment Processing**
   - PaymentProcessor handles payment
   - Publish PaymentProcessedEvent or PaymentFailedEvent

4. **Notification Processing**
   - NotificationProcessor sends notifications
   - Publish NotificationSentEvent or NotificationFailedEvent

### 4. Business Rules Implementation

#### Slot Availability
- Check if slot exists and is available
- Verify slot capacity hasn't been exceeded
- Handle concurrent requests with proper locking

#### Booking Status Management
- Pending: Initial state after creation
- Confirmed: After successful payment
- Cancelled: After cancellation request
- Completed: After service completion

#### Cancellation Policies
- Implement configurable cancellation policies
- Handle refunds according to policy
- Update slot availability when booking is cancelled

#### Time Zone Handling
- Store all dates in UTC
- Convert to user time zone for display
- Handle time zone conversions properly

### 5. Error Handling Strategy

#### Validation Errors
- Return 400 Bad Request for invalid input
- Provide detailed error messages
- Validate at both API and service layers

#### Business Rule Violations
- Return 409 Conflict for business rule violations
- Provide clear explanations of violations
- Log business rule violations for analytics

#### System Errors
- Return 500 Internal Server Error for unexpected issues
- Log detailed error information
- Implement proper retry mechanisms for transient failures

### 6. Transaction Management

- Use database transactions for multi-step operations
- Ensure data consistency across related entities
- Implement proper rollback mechanisms
- Handle partial failures gracefully

## Implementation Roadmap

### Phase 1: Foundation (8 hours)
1. Create service layer architecture
2. Implement SlotService with availability checking
3. Implement BookingService with basic CRUD operations
4. Add proper validation and error handling

### Phase 2: Core Booking Workflow (12 hours)
1. Implement complete booking creation workflow
2. Add slot availability validation
3. Implement booking status management
4. Create booking history tracking

### Phase 3: Payment Integration (8 hours)
1. Implement payment processing workflow
2. Add payment status management
3. Handle payment failures
4. Implement refund processing

### Phase 4: Notification System (6 hours)
1. Implement notification sending
2. Add notification status tracking
3. Handle notification failures
4. Implement different notification channels

### Phase 5: Advanced Features (10 hours)
1. Implement booking cancellation with policies
2. Add booking rescheduling functionality
3. Implement concurrent booking handling
4. Add time zone support

### Phase 6: Testing and Quality Assurance (6 hours)
1. Implement unit tests for all services
2. Add integration tests for workflows
3. Implement end-to-end tests
4. Add performance and load testing

## Technical Implementation Details

### 1. Database Access Pattern

Use Entity Framework Core with proper async/await patterns:

```csharp
public async Task<Booking> CreateBookingAsync(CreateBookingRequest request)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // Check slot availability
        var slot = await _context.Slots
            .FirstOrDefaultAsync(s => s.Id == request.SlotId && s.IsAvailable);
        
        if (slot == null || slot.AvailableBookings <= 0)
            throw new BusinessRuleViolationException("Slot is not available");
        
        // Create booking
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            ServiceId = request.ServiceId,
            SlotId = request.SlotId,
            TenantId = request.TenantId,
            Status = "Pending",
            BookingDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Notes = request.Notes
        };
        
        _context.Bookings.Add(booking);
        
        // Update slot availability
        slot.AvailableBookings--;
        if (slot.AvailableBookings == 0)
            slot.IsAvailable = false;
        
        slot.UpdatedAt = DateTime.UtcNow;
        
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

### 2. Event Handling Pattern

Use MassTransit consumers for event processing:

```csharp
public class BookingCreatedConsumer : IConsumer<BookingCreatedEvent>
{
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingCreatedConsumer> _logger;

    public async Task Consume(ConsumeContext<BookingCreatedEvent> context)
    {
        var bookingEvent = context.Message;
        
        try
        {
            // Process payment
            await _bookingService.ProcessPaymentAsync(bookingEvent);
            
            // Send notifications
            await _bookingService.SendBookingConfirmationAsync(bookingEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing booking {BookingId}", bookingEvent.BookingId);
            throw;
        }
    }
}
```

### 3. Validation Pattern

Implement fluent validation for request validation:

```csharp
public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.ServiceId).NotEmpty();
        RuleFor(x => x.SlotId).NotEmpty();
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.BookingDate).NotEmpty();
    }
}
```

## Testing Strategy

### Unit Tests
- Test each service method in isolation
- Mock database context and external dependencies
- Cover all business rules and edge cases
- Test validation logic

### Integration Tests
- Test complete workflows from API to database
- Test event publishing and consumption
- Test error scenarios
- Test concurrent access scenarios

### End-to-End Tests
- Test complete booking journey
- Test payment processing workflow
- Test notification delivery
- Test cancellation and rescheduling

## Performance Considerations

### Database Optimization
- Use proper indexing on frequently queried columns
- Implement query optimization for complex queries
- Use connection pooling
- Consider read replicas for read-heavy operations

### Concurrency Handling
- Use database-level locking for slot availability checks
- Implement optimistic concurrency control
- Use distributed locking for critical sections

### Caching
- Cache frequently accessed data like service information
- Use Redis for distributed caching
- Implement cache invalidation strategies

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Validate all input data

### Audit Trail
- Log all booking status changes
- Track who made changes and when
- Implement non-repudiation measures

## Monitoring and Observability

### Logging
- Implement structured logging
- Log important business events
- Include correlation IDs for request tracing
- Log performance metrics

### Metrics
- Track booking creation rates
- Monitor payment success/failure rates
- Track notification delivery rates
- Monitor system performance

### Health Checks
- Implement health checks for all services
- Monitor database connectivity
- Check external service dependencies

## Deployment Considerations

### Environment Configuration
- Use environment-specific configuration
- Implement feature flags for gradual rollout
- Use secrets management for sensitive data

### Scaling
- Design for horizontal scaling
- Use message queues for decoupling
- Implement circuit breakers for external dependencies

### Rollback Strategy
- Implement database migration rollback procedures
- Use blue-green deployment for zero-downtime deployments
- Implement feature toggles for quick rollback

## Risk Mitigation

### Data Consistency
- Use database transactions for multi-step operations
- Implement proper error handling and rollback
- Use idempotent operations where possible

### Performance
- Implement proper caching strategies
- Use connection pooling
- Monitor and optimize database queries

### Availability
- Implement retry mechanisms for transient failures
- Use circuit breakers for external dependencies
- Implement proper health checks and monitoring

## Success Criteria

1. All acceptance criteria from the task are met
2. Unit test coverage > 80%
3. Integration test coverage > 70%
4. All business rules are properly implemented
5. Performance benchmarks are met
6. Security requirements are satisfied
7. System is deployable and monitorable

## Next Steps

1. Create the service layer architecture
2. Implement SlotService with availability checking
3. Implement BookingService with basic CRUD operations
4. Add proper validation and error handling
5. Begin unit testing

This implementation plan provides a comprehensive approach to implementing the booking business logic while addressing all the gaps identified in the current implementation.