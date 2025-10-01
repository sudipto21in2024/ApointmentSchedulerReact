# Notification Events

## Overview

This document describes the events related to notification management in the Multi-Tenant Appointment Booking System. It details the event-driven flow for generating and dispatching various types of notifications, now incorporating a template-based mail merge system and asynchronous processing via Hangfire.

## Events

### TemplateNotificationEvent

**Description**: Triggered when a notification needs to be generated and sent based on a template. This event carries the necessary data to render a specific template.

**Triggered By**: Services requiring notifications (e.g., BookingService, PaymentService, UserService).

**Consumed By**: NotificationService (specifically, the `TemplateNotificationConsumer`).

**Event Structure**:
```csharp
public class TemplateNotificationEvent : IEvent
{
    public Guid NotificationId { get; set; } // Unique ID for this notification instance
    public Guid UserId { get; set; } // Recipient user ID
    public string TemplateName { get; set; } = null!; // e.g., "BookingConfirmation.html", "PasswordReset.html"
    public string RecipientEmail { get; set; } = null!; // Primary recipient email
    public object TemplateModel { get; set; } = null!; // Anonymous or specific DTO for template data
    public DateTime Timestamp { get; set; } // Event creation timestamp
}
```

**Business Rules**:
1.  This event is published by source services when a notification is required.
2.  The `TemplateModel` object must contain all necessary data for the specified `TemplateName` to render correctly.
3.  The `NotificationId` should be unique for each notification instance.

### NotificationSentEvent

**Description**: Triggered when a notification has been successfully delivered to the user via an external provider (e.g., SendGrid, Twilio). This event is published *after* the Hangfire background job completes the delivery attempt.

**Triggered By**: NotificationService (specifically, the Hangfire background job after successful dispatch).

**Consumed By**:
*   ReportingService (to update notification analytics)
*   AuditService (for compliance tracking)

**Event Structure**:
```csharp
public class NotificationSentEvent : IEvent
{
    public Guid NotificationId { get; set; }
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string NotificationType { get; set; } // Email, SMS, Push
    public string Channel { get; set; } // Welcome, BookingConfirmation, Reminder, etc.
    public string Title { get; set; }
    public string Message { get; set; } // The final rendered message
    public DateTime SentAt { get; set; }
    public string Provider { get; set; } // SendGrid, Twilio, etc.
}
```

**Business Rules**:
1.  This event is published after successful notification delivery by the external provider.
2.  Contains all necessary notification information for analytics.
3.  Includes tenant information for multi-tenancy support.
4.  Different notification types have different priority levels.

### NotificationFailedEvent

**Description**: Triggered when a notification fails to be delivered to a user after all retry attempts (if any) have been exhausted.

**Triggered By**: NotificationService (specifically, the Hangfire background job after failed dispatch attempts).

**Consumed By**:
*   ReportingService (to track delivery failures)
*   AlertService (to notify system administrators)
*   RetryService (to attempt redelivery - if not handled by Hangfire's built-in retries)

**Event Structure**:
```csharp
public class NotificationFailedEvent : IEvent
{
    public Guid NotificationId { get; set; }
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string NotificationType { get; set; } // Email, SMS, Push
    public string Channel { get; set; } // Welcome, BookingConfirmation, Reminder, etc.
    public string Title { get; set; }
    public string Message { get; set; } // The final rendered message
    public string FailureReason { get; set; }
    public DateTime FailedAt { get; set; }
    public string Provider { get; set; } // SendGrid, Twilio, etc.
}
```

## Implementation Guidelines for AI Coding Agents

1.  **Event Publishing**: Source services should publish `TemplateNotificationEvent` for all template-based notifications. `NotificationSentEvent` and `NotificationFailedEvent` are published by the NotificationService's Hangfire jobs.
2.  **Template Data Preparation**: Ensure the `TemplateModel` in `TemplateNotificationEvent` contains all data required by the template. Avoid sending excessive data; only send what's necessary for rendering.
3.  **Consistency**: Ensure events contain consistent data with the notification entity.
4.  **Timing**: `TemplateNotificationEvent` is published immediately when a notification is required. `NotificationSentEvent`/`NotificationFailedEvent` are published after the actual delivery attempt (potentially delayed by Hangfire).
5.  **Error Handling**: Implement proper error handling and logging for event publishing and consumption.
6.  **Idempotency**: Ensure event handlers are idempotent to handle duplicate messages.
7.  **Retry Logic**: Hangfire provides built-in retry mechanisms for background jobs, which should be leveraged for notification delivery.
8.  **Security**: Ensure sensitive information is not included in events unnecessarily, and that data passed into templates is properly sanitized during rendering.

## Example Implementation

### Publishing a TemplateNotificationEvent (e.g., from BookingService)
```csharp
// Example in BookingService.Consumers.BookingCreatedConsumer
public async Task Consume(ConsumeContext<BookingCreatedEvent> context)
{
    var bookingEvent = context.Message;
    // ... fetch booking details ...

    var customerTemplateNotificationEvent = new TemplateNotificationEvent
    {
        NotificationId = Guid.NewGuid(),
        UserId = booking.CustomerId,
        TemplateName = "BookingConfirmation.html",
        RecipientEmail = booking.Customer.Email,
        TemplateModel = new BookingConfirmationEmailDto
        {
            CustomerName = $"{booking.Customer.FirstName} {booking.Customer.LastName}",
            ServiceName = booking.Service.Name,
            BookingDate = booking.BookingDate,
            BookingTime = booking.BookingDate.ToShortTimeString(),
            ProviderName = booking.Service.Provider.FirstName
        },
        Timestamp = DateTime.UtcNow
    };

    await _publishEndpoint.Publish(customerTemplateNotificationEvent);
}
```

### Consuming a TemplateNotificationEvent (in NotificationService)
```csharp
// Example in NotificationService.Consumers.TemplateNotificationConsumer
public async Task Consume(ConsumeContext<TemplateNotificationEvent> context)
{
    var eventMessage = context.Message;
    // ... logic to fetch additional data if needed ...

    // Render the template
    string renderedContent = await _templateRendererService.RenderTemplateAsync(eventMessage.TemplateName, eventMessage.TemplateModel);

    // Enqueue the job to send the notification
    BackgroundJob.Enqueue<NotificationService.Services.NotificationService>(x => 
        x.SendNotificationJob(eventMessage.NotificationId, eventMessage.UserId, eventMessage.RecipientEmail, renderedContent, eventMessage.TemplateName.Replace(".html", "")));
}
```

### SendNotificationJob (in NotificationService - Hangfire job)
```csharp
// Example in NotificationService.Services.NotificationService
public async Task SendNotificationJob(Guid notificationId, Guid userId, string recipientEmail, string renderedContent, string notificationType)
{
    // ... Actual integration with email/SMS/push providers ...
    // Update notification status in DB (e.g., Sent, Failed)
    // Publish NotificationSentEvent or NotificationFailedEvent
    var notification = await _context.Notifications.FindAsync(notificationId);
    if (notification != null)
    {
        notification.Status = "Sent"; // Or "Failed"
        await _context.SaveChangesAsync();
        
        // Publish NotificationSentEvent
        var notificationSentEvent = new NotificationSentEvent { /* populate from notification */ };
        // await _publishEndpoint.Publish(notificationSentEvent);
    }
}
```

## Change Log
### 2025-09-17
- **Change Description:** Introduced `TemplateNotificationEvent` to facilitate dynamic, template-based notifications. Updated the flow for `NotificationSentEvent` and `NotificationFailedEvent` to be published by Hangfire background jobs after delivery attempts.
- **Reason:** To enable personalized notification content, decouple content generation from core business logic, and leverage asynchronous processing for reliable delivery.
- **Affected Components:** Notification Service, Booking Service (as a publisher of `TemplateNotificationEvent`), Event Consumers in Notification Service.