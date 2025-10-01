using MassTransit;
using Microsoft.Extensions.Logging;
using Shared.Events;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using BookingService.Consumers;
using Shared.DTOs.EmailTemplates; // Add for BookingConfirmationEmailDto
using Shared.Models; // Add for User, Service, Slot
using Shared.Data; // Add for ApplicationDbContext
using Microsoft.EntityFrameworkCore; // Add for Include, FirstOrDefaultAsync

namespace BookingService.Consumers
{
    /// <summary>
    /// Consumer for BookingCreatedEvent
    /// This consumer handles the BookingCreatedEvent by initiating payment processing and sending notifications
    /// </summary>
    public class BookingCreatedConsumer : IConsumer<BookingCreatedEvent>
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("BookingService.BookingCreatedConsumer");
        private readonly ILogger<BookingCreatedConsumer> _logger;
        private readonly HashSet<Guid> _processedEvents = new HashSet<Guid>();
        private readonly IPublishEndpoint _publishEndpoint; // Add IPublishEndpoint
        private readonly ApplicationDbContext _dbContext; // Add DbContext

        public BookingCreatedConsumer(ILogger<BookingCreatedConsumer> logger, IPublishEndpoint publishEndpoint, ApplicationDbContext dbContext)
        {
            _logger = logger;
            _publishEndpoint = publishEndpoint;
            _dbContext = dbContext;
        }

        public async Task Consume(ConsumeContext<BookingCreatedEvent> context)
        {
            using var activity = ActivitySource.StartActivity("BookingCreatedConsumer.Consume");
            
            var bookingEvent = context.Message;
            activity?.SetTag("booking.id", bookingEvent.BookingId.ToString());
            activity?.SetTag("customer.id", bookingEvent.CustomerId.ToString());
            activity?.SetTag("service.id", bookingEvent.ServiceId.ToString());
            
            try
            {
                _logger.LogInformation("Processing BookingCreatedEvent for booking {BookingId}, Customer: {CustomerId}",
                    bookingEvent.BookingId, bookingEvent.CustomerId);

                // Validate the event
                ValidateEvent(bookingEvent);
                
                // Check for duplicate events (idempotency)
                if (_processedEvents.Contains(bookingEvent.BookingId))
                {
                    _logger.LogInformation("Duplicate BookingCreatedEvent received for booking {BookingId}, skipping processing",
                        bookingEvent.BookingId);
                    activity?.SetStatus(ActivityStatusCode.Ok);
                    return;
                }

                // Process payment for the booking
                await ProcessPayment(bookingEvent, context);
                
                // Send notifications to customer and provider
                await SendNotifications(bookingEvent, context);
                
                // Mark event as processed for idempotency
                _processedEvents.Add(bookingEvent.BookingId);

                _logger.LogInformation("Completed processing BookingCreatedEvent for booking {BookingId}",
                    bookingEvent.BookingId);
                activity?.SetStatus(ActivityStatusCode.Ok);
            }
            catch (EventValidationException ex)
            {
                _logger.LogError(ex, "Event validation failed for BookingCreatedEvent for booking {BookingId}",
                    bookingEvent.BookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                // For validation errors, we don't want to retry as they indicate a problem with the event data
                // We'll acknowledge the message to prevent it from being retried
                return;
            }
            catch (PaymentProcessingException ex)
            {
                _logger.LogError(ex, "Payment processing failed for BookingCreatedEvent for booking {BookingId}",
                    bookingEvent.BookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                // For payment processing failures, we might want to retry
                throw;
            }
            catch (NotificationSendingException ex)
            {
                _logger.LogError(ex, "Notification sending failed for BookingCreatedEvent for booking {BookingId}",
                    bookingEvent.BookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                // For notification failures, we might want to retry
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error processing BookingCreatedEvent for booking {BookingId}",
                    bookingEvent.BookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                // For unexpected errors, we'll rethrow to let MassTransit handle retries
                throw;
            }
        }

        /// <summary>
        /// Validates the booking event data
        /// </summary>
        /// <param name="bookingEvent">The booking event to validate</param>
        /// <exception cref="EventValidationException">Thrown when event data is invalid</exception>
        private void ValidateEvent(BookingCreatedEvent bookingEvent)
        {
            var errors = new List<string>();
            
            if (bookingEvent.BookingId == Guid.Empty)
            {
                errors.Add("Booking ID is required");
            }
            
            if (bookingEvent.CustomerId == Guid.Empty)
            {
                errors.Add("Customer ID is required");
            }
            
            if (bookingEvent.ServiceId == Guid.Empty)
            {
                errors.Add("Service ID is required");
            }
            
            if (bookingEvent.SlotId == Guid.Empty)
            {
                errors.Add("Slot ID is required");
            }
            
            if (bookingEvent.ProviderId == Guid.Empty)
            {
                errors.Add("Provider ID is required");
            }
            
            if (bookingEvent.TenantId == Guid.Empty)
            {
                errors.Add("Tenant ID is required");
            }
            
            if (bookingEvent.BookingDate == default(DateTime))
            {
                errors.Add("Booking date is required");
            }
            
            if (bookingEvent.SlotStartDateTime == default(DateTime))
            {
                errors.Add("Slot start date time is required");
            }
            
            if (bookingEvent.SlotEndDateTime == default(DateTime))
            {
                errors.Add("Slot end date time is required");
            }
            
            if (bookingEvent.SlotEndDateTime <= bookingEvent.SlotStartDateTime)
            {
                errors.Add("Slot end date time must be after slot start date time");
            }
            
            if (bookingEvent.Price <= 0)
            {
                errors.Add("Price must be greater than zero");
            }
            
            if (string.IsNullOrEmpty(bookingEvent.Currency))
            {
                errors.Add("Currency is required");
            }
            
            if (bookingEvent.CreatedAt == default(DateTime))
            {
                errors.Add("Created at date is required");
            }
            
            if (errors.Count > 0)
            {
                throw new EventValidationException($"Event validation failed: {string.Join(", ", errors)}");
            }
            
            _logger.LogDebug("Event validation passed for booking {BookingId}", bookingEvent.BookingId);
        }

        /// <summary>
        /// Processes payment for the booking
        /// </summary>
        /// <param name="bookingEvent">The booking event</param>
        /// <param name="context">The consume context</param>
        /// <exception cref="PaymentProcessingException">Thrown when payment processing fails</exception>
        private async Task ProcessPayment(BookingCreatedEvent bookingEvent, ConsumeContext<BookingCreatedEvent> context)
        {
            try
            {
                _logger.LogInformation("Initiating payment processing for booking {BookingId}", bookingEvent.BookingId);
                
                // In a real implementation, this would call the PaymentService to process the payment
                // For now, we'll simulate the payment processing by publishing a PaymentProcessedEvent
                
                var paymentProcessedEvent = new PaymentProcessedEvent
                {
                    PaymentId = Guid.NewGuid(),
                    BookingId = bookingEvent.BookingId,
                    CustomerId = bookingEvent.CustomerId,
                    ProviderId = bookingEvent.ProviderId,
                    TenantId = bookingEvent.TenantId,
                    Amount = bookingEvent.Price,
                    Currency = bookingEvent.Currency,
                    PaymentMethod = "CreditCard", // This would be determined by the customer's payment method
                    TransactionId = $"txn_{Guid.NewGuid():N}",
                    PaymentGateway = "Stripe", // This would be determined by the payment gateway being used
                    ProcessedAt = DateTime.UtcNow
                };
                
                await context.Publish(paymentProcessedEvent);
                
                _logger.LogInformation("Payment processing initiated for booking {BookingId}, Payment ID: {PaymentId}",
                    bookingEvent.BookingId, paymentProcessedEvent.PaymentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initiate payment processing for booking {BookingId}", bookingEvent.BookingId);
                throw new PaymentProcessingException($"Failed to process payment for booking {bookingEvent.BookingId}", ex);
            }
        }

        /// <summary>
        /// Sends notifications to the customer and provider
        /// </summary>
        /// <param name="bookingEvent">The booking event</param>
        /// <param name="context">The consume context</param>
        /// <exception cref="NotificationSendingException">Thrown when notification sending fails</exception>
        private async Task SendNotifications(BookingCreatedEvent bookingEvent, ConsumeContext<BookingCreatedEvent> context)
        {
            try
            {
                _logger.LogInformation("Sending booking confirmation notifications for booking {BookingId}", bookingEvent.BookingId);

                // Fetch full booking details for templating
                var booking = await _dbContext.Bookings
                    .Include(b => b.Customer)
                    .Include(b => b.Service)
                        .ThenInclude(s => s.Provider) // Include provider for service
                    .Include(b => b.Slot)
                    .FirstOrDefaultAsync(b => b.Id == bookingEvent.BookingId);

                if (booking == null)
                {
                    _logger.LogWarning("Booking {BookingId} not found for notification sending.", bookingEvent.BookingId);
                    return;
                }

                // Publish TemplateNotificationEvent for customer
                var customerTemplateNotificationEvent = new TemplateNotificationEvent
                {
                    NotificationId = Guid.NewGuid(),
                    UserId = booking.CustomerId,
                    TemplateName = "BookingConfirmation.html",
                    RecipientEmail = booking.Customer?.Email ?? string.Empty, // Ensure RecipientEmail is not null
                    TemplateModel = new BookingConfirmationEmailDto
                    {
                        CustomerName = $"{booking.Customer?.FirstName} {booking.Customer?.LastName}",
                        ServiceName = booking.Service?.Name ?? "Unknown Service",
                        BookingDate = booking.BookingDate,
                        BookingTime = booking.BookingDate.ToShortTimeString(),
                        ProviderName = booking.Service?.Provider?.FirstName ?? "Unknown Provider"
                    },
                    Timestamp = DateTime.UtcNow
                };

                await _publishEndpoint.Publish(customerTemplateNotificationEvent);

                _logger.LogInformation("Customer template notification event published for booking {BookingId}, Notification ID: {NotificationId}",
                    bookingEvent.BookingId, customerTemplateNotificationEvent.NotificationId);

                // Publish TemplateNotificationEvent for provider
                var providerTemplateNotificationEvent = new TemplateNotificationEvent
                {
                    NotificationId = Guid.NewGuid(),
                    UserId = booking.Service?.ProviderId ?? Guid.Empty, // Handle null Service or Provider
                    TemplateName = "BookingConfirmation.html", // Re-use template for provider, content will differ based on model
                    RecipientEmail = booking.Service?.Provider?.Email ?? string.Empty, // Ensure RecipientEmail is not null
                    TemplateModel = new BookingConfirmationEmailDto // Use the same DTO, but might populate differently for provider view
                    {
                        CustomerName = $"{booking.Customer?.FirstName} {booking.Customer?.LastName}",
                        ServiceName = booking.Service?.Name ?? "Unknown Service",
                        BookingDate = booking.BookingDate,
                        BookingTime = booking.BookingDate.ToShortTimeString(),
                        ProviderName = booking.Service?.Provider?.FirstName ?? "Unknown Provider"
                    },
                    Timestamp = DateTime.UtcNow
                };

                await _publishEndpoint.Publish(providerTemplateNotificationEvent);

                _logger.LogInformation("Provider template notification event published for booking {BookingId}, Notification ID: {NotificationId}",
                    bookingEvent.BookingId, providerTemplateNotificationEvent.NotificationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notifications for booking {BookingId}", bookingEvent.BookingId);
                throw new NotificationSendingException($"Failed to send notifications for booking {bookingEvent.BookingId}", ex);
            }
        }
    }
}