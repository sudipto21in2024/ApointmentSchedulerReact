# AI Coding Implementation Guidelines for Events

## Overview

This document provides implementation guidelines for AI coding agents to ensure consistent and reliable implementation of event-driven communication between microservices in the Multi-Tenant Appointment Booking System.

## Event Implementation Standards

### 1. Event Interface Implementation

All events must implement the `IEvent` interface from `Shared.Contracts`:

```csharp
public interface IEvent : INotification
{
}
```

### 2. Event Naming Convention

- Use PascalCase for event names
- Suffix event names with "Event" (e.g., `UserRegisteredEvent`)
- Use present tense for state changes (e.g., `UserUpdatedEvent`)
- Use past tense for completed actions (e.g., `BookingConfirmedEvent`)

### 3. Event Structure Guidelines

#### Required Properties
- All events must include `TenantId` for multi-tenancy support
- Include timestamp properties (e.g., `CreatedAt`, `ProcessedAt`)
- Include relevant entity IDs for traceability

#### Property Naming
- Use descriptive property names
- Follow C# naming conventions
- Include units in property names when applicable (e.g., `DurationInMinutes`)

### 4. MassTransit Configuration

#### Service Configuration
```csharp
// In Program.cs or Startup.cs
services.AddMassTransit(x =>
{
    x.AddConsumer<UserRegisteredConsumer>();
    x.AddConsumer<UserUpdatedConsumer>();
    
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
        
        cfg.ReceiveEndpoint("user-events", e =>
        {
            e.ConfigureConsumer<UserRegisteredConsumer>(context);
            e.ConfigureConsumer<UserUpdatedConsumer>(context);
        });
    });
});
```

#### Event Publishing
```csharp
public class UserService : IUserService
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task RegisterUserAsync(RegisterUserRequest request)
    {
        // Business logic here
        
        // Publish event
        var userRegisteredEvent = new UserRegisteredEvent
        {
            UserId = user.Id,
            Email = user.Email,
            // ... other properties
        };
        
        await _publishEndpoint.Publish(userRegisteredEvent);
    }
}
```

### 5. Event Consumption

#### Consumer Implementation
```csharp
public class UserRegisteredConsumer : IConsumer<UserRegisteredEvent>
{
    private readonly ILogger<UserRegisteredConsumer> _logger;
    
    public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        var userEvent = context.Message;
        
        try
        {
            // Process the event
            // Implement business logic here
            
            _logger.LogInformation("Processed UserRegisteredEvent for user {UserId}", 
                userEvent.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing UserRegisteredEvent for user {UserId}", 
                userEvent.UserId);
            
            // Handle exception appropriately
            // Consider dead letter queue for persistent failures
            throw;
        }
    }
}
```

### 6. Error Handling and Retry Logic

#### Retry Configuration
```csharp
x.UsingRabbitMq((context, cfg) =>
{
    cfg.Host("localhost", "/", h =>
    {
        h.Username("guest");
        h.Password("guest");
    });
    
    cfg.ReceiveEndpoint("user-events", e =>
    {
        e.UseMessageRetry(r => r.Interval(3, TimeSpan.FromMinutes(1)));
        e.ConfigureConsumer<UserRegisteredConsumer>(context);
    });
});
```

#### Exception Handling
- Implement try-catch blocks in consumer methods
- Log exceptions with appropriate context
- Use dead letter queues for messages that fail repeatedly
- Implement circuit breaker pattern for external dependencies

### 7. Idempotency

#### Event Deduplication
```csharp
public class UserRegisteredConsumer : IConsumer<UserRegisteredEvent>
{
    private readonly IEventStore _eventStore;
    
    public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        var userEvent = context.Message;
        
        // Check if event has already been processed
        if (await _eventStore.IsEventProcessedAsync(userEvent.UserId, context.MessageId))
        {
            _logger.LogInformation("Event {MessageId} already processed for user {UserId}", 
                context.MessageId, userEvent.UserId);
            return;
        }
        
        // Process event
        // ...
        
        // Mark event as processed
        await _eventStore.MarkEventAsProcessedAsync(userEvent.UserId, context.MessageId);
    }
}
```

### 8. Security Considerations

#### Data Protection
- Do not include sensitive information (passwords, credit card numbers) in events
- Encrypt sensitive data if it must be included
- Validate event data before processing

#### Authentication
- Configure RabbitMQ with appropriate authentication
- Use TLS for message encryption in transit
- Implement message signing for integrity verification

### 9. Monitoring and Observability

#### Logging
```csharp
public class UserRegisteredConsumer : IConsumer<UserRegisteredEvent>
{
    private readonly ILogger<UserRegisteredConsumer> _logger;
    
    public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        using (LogContext.PushProperty("MessageId", context.MessageId))
        using (LogContext.PushProperty("CorrelationId", context.CorrelationId))
        {
            _logger.LogInformation("Processing UserRegisteredEvent for user {UserId}", 
                context.Message.UserId);
            
            // Process event
            
            _logger.LogInformation("Completed processing UserRegisteredEvent for user {UserId}", 
                context.Message.UserId);
        }
    }
}
```

#### Metrics
- Track event processing time
- Monitor event queue depths
- Track successful/failed event processing rates
- Implement health checks for event processing

### 10. Testing Guidelines

#### Unit Testing Events
```csharp
[Fact]
public async Task UserRegisteredEvent_ShouldBePublished_WhenUserIsCreated()
{
    // Arrange
    var publishEndpoint = new Mock<IPublishEndpoint>();
    var userService = new UserService(publishEndpoint.Object);
    
    // Act
    await userService.RegisterUserAsync(new RegisterUserRequest { /* ... */ });
    
    // Assert
    publishEndpoint.Verify(x => x.Publish<UserRegisteredEvent>(It.IsAny<UserRegisteredEvent>(), 
        CancellationToken.None), Times.Once);
}
```

#### Integration Testing
- Test event publishing and consumption
- Verify data consistency across services
- Test error scenarios and retry logic
- Validate idempotency

## Service-Specific Implementation Patterns

### 1. UserService Events
- Publish user lifecycle events
- Include tenant and user type information
- Handle user profile updates

### 2. BookingService Events
- Implement saga pattern for complex booking workflows
- Handle booking state transitions
- Coordinate with PaymentService for payment processing

### 3. PaymentService Events
- Handle payment processing results
- Implement compensation logic for failed payments
- Coordinate with external payment gateways

### 4. NotificationService Events
- Handle multiple notification channels
- Implement retry logic for failed deliveries
- Track delivery status and metrics

## Performance Optimization

### 1. Batch Processing
- Group related events for batch processing when appropriate
- Implement bulk operations for high-volume scenarios

### 2. Caching
- Cache frequently accessed data in event handlers
- Implement cache invalidation strategies

### 3. Asynchronous Processing
- Use async/await for I/O operations
- Avoid blocking calls in event handlers

## Deployment Considerations

### 1. Environment Configuration
- Use environment-specific RabbitMQ configurations
- Configure appropriate queue settings for each environment

### 2. Scaling
- Configure multiple consumer instances for high-volume events
- Use competing consumers pattern for load distribution

### 3. Monitoring
- Implement health checks for event processing
- Monitor RabbitMQ cluster health
- Set up alerts for processing delays

## Versioning Strategy

### 1. Event Versioning
- Include version information in events
- Maintain backward compatibility
- Implement version-specific consumers when needed

### 2. Migration Strategy
- Plan for event schema changes
- Implement event transformation logic when needed
- Test version compatibility thoroughly

## Common Pitfalls to Avoid

1. **Circular Dependencies**: Avoid creating circular event chains
2. **Event Storms**: Implement rate limiting for high-volume events
3. **Data Inconsistency**: Use distributed transactions or sagas for consistency
4. **Blocking Operations**: Keep event handlers lightweight and non-blocking
5. **Error Suppression**: Handle errors appropriately without suppressing them
6. **Memory Leaks**: Dispose of resources properly in event handlers

## Best Practices Summary

1. Keep events small and focused
2. Ensure events are immutable
3. Include sufficient context for consumers
4. Implement proper error handling
5. Design for idempotency
6. Monitor event processing metrics
7. Test event flows thoroughly
8. Document event schemas and contracts
9. Version events appropriately
10. Secure event communication channels