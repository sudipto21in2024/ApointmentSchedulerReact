# Review Events

## Overview

This document describes the events related to review management in the Multi-Tenant Appointment Booking System. These events are triggered when reviews are created, updated, or deleted for services.

## Events

### ReviewCreatedEvent

**Description**: Triggered when a new review is created for a service.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- NotificationService (to notify service provider)
- ReportingService (to update service ratings and analytics)
- SearchService (to update service search rankings)

**Event Structure**:
```csharp
public class ReviewCreatedEvent : IEvent
{
    public Guid ReviewId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public int Rating { get; set; } // 1-5 stars
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Business Rules**:
1. This event is published after successful review creation
2. Contains all necessary review information for downstream services
3. Includes tenant information for multi-tenancy support
4. Verified reviews have higher weight in ratings calculations

### ReviewUpdatedEvent

**Description**: Triggered when a review is updated.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- NotificationService (to notify affected parties)
- ReportingService (to update service ratings and analytics)
- SearchService (to update service search rankings)

**Event Structure**:
```csharp
public class ReviewUpdatedEvent : IEvent
{
    public Guid ReviewId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsActive { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### ReviewDeletedEvent

**Description**: Triggered when a review is deleted.

**Triggered By**: ServiceManagementService

**Consumed By**: 
- NotificationService (to notify affected parties)
- ReportingService (to update service ratings and analytics)
- SearchService (to update service search rankings)

**Event Structure**:
```csharp
public class ReviewDeletedEvent : IEvent
{
    public Guid ReviewId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid TenantId { get; set; }
    public int Rating { get; set; }
    public DateTime DeletedAt { get; set; }
}
```

## Implementation Guidelines for AI Coding Agents

1. **Event Publishing**: All review events should be published using MassTransit's `IPublishEndpoint`
2. **Validation**: Validate review data before publishing events
3. **Consistency**: Ensure events contain consistent data with the review entity
4. **Timing**: Publish events after database transactions are committed
5. **Error Handling**: Implement proper error handling and logging for event publishing
6. **Idempotency**: Ensure event handlers are idempotent to handle duplicate messages
7. **Rating Calculations**: Implement proper rating calculation logic in consuming services
8. **Spam Detection**: Implement spam detection mechanisms for reviews

## Example Implementation

### Publishing an Event
```csharp
public class ReviewService : IReviewService
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task CreateReviewAsync(CreateReviewRequest request)
    {
        // Create review logic here
        
        // Publish event
        var reviewCreatedEvent = new ReviewCreatedEvent
        {
            ReviewId = review.Id,
            ServiceId = review.ServiceId,
            CustomerId = review.CustomerId,
            ProviderId = review.Service.ProviderId,
            TenantId = review.TenantId,
            Rating = review.Rating,
            Title = review.Title,
            Comment = review.Comment,
            IsVerified = review.IsVerified,
            CreatedAt = DateTime.UtcNow
        };
        
        await _publishEndpoint.Publish(reviewCreatedEvent);
    }
}
```

### Consuming an Event
```csharp
public class ReviewCreatedConsumer : IConsumer<ReviewCreatedEvent>
{
    private readonly ILogger<ReviewCreatedConsumer> _logger;
    private readonly IReportingService _reportingService;
    
    public async Task Consume(ConsumeContext<ReviewCreatedEvent> context)
    {
        var reviewEvent = context.Message;
        
        // Update service ratings and analytics
        await _reportingService.UpdateServiceRatingsAsync(reviewEvent.ServiceId, 
            reviewEvent.Rating);
        
        _logger.LogInformation("Review created for service: {ServiceId}, Rating: {Rating}", 
            reviewEvent.ServiceId, reviewEvent.Rating);
    }
}