using MassTransit;
using Microsoft.Extensions.Logging;
using Shared.Events;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using BookingService.Consumers;
using Shared.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace BookingService.Consumers
{
    /// <summary>
    /// Consumer for PaymentProcessedEvent
    /// This consumer handles the PaymentProcessedEvent by updating booking status and sending notifications
    /// </summary>
    public class PaymentProcessedConsumer : IConsumer<PaymentProcessedEvent>
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("BookingService.PaymentProcessedConsumer");
        private readonly ILogger<PaymentProcessedConsumer> _logger;
        private readonly ApplicationDbContext _context;
        private readonly HashSet<Guid> _processedEvents = new HashSet<Guid>();

        /// <summary>
        /// Initializes a new instance of the PaymentProcessedConsumer class
        /// </summary>
        /// <param name="logger">The logger</param>
        /// <param name="context">The database context</param>
        public PaymentProcessedConsumer(ILogger<PaymentProcessedConsumer> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Consumes a PaymentProcessedEvent and updates booking status accordingly
        /// </summary>
        /// <param name="context">The consume context containing the PaymentProcessedEvent</param>
        /// <returns>A task representing the asynchronous operation</returns>
        /// <exception cref="EventValidationException">Thrown when event data is invalid</exception>
        /// <exception cref="BookingUpdateException">Thrown when booking status update fails</exception>
        /// <exception cref="NotificationSendingException">Thrown when notification sending fails</exception>
        public async Task Consume(ConsumeContext<PaymentProcessedEvent> context)
        {
            using var activity = ActivitySource.StartActivity("PaymentProcessedConsumer.Consume");
            
            var paymentEvent = context.Message;
            activity?.SetTag("payment.id", paymentEvent.PaymentId.ToString());
            activity?.SetTag("booking.id", paymentEvent.BookingId.ToString());
            activity?.SetTag("customer.id", paymentEvent.CustomerId.ToString());
            
            try
            {
                _logger.LogInformation("Processing PaymentProcessedEvent for payment {PaymentId}, Booking: {BookingId}",
                    paymentEvent.PaymentId, paymentEvent.BookingId);

                // Validate the event
                ValidateEvent(paymentEvent);
                
                // Check for duplicate events (idempotency)
                if (_processedEvents.Contains(paymentEvent.PaymentId))
                {
                    _logger.LogInformation("Duplicate PaymentProcessedEvent received for payment {PaymentId}, skipping processing",
                        paymentEvent.PaymentId);
                    activity?.SetStatus(ActivityStatusCode.Ok);
                    return;
                }

                // Update booking status to confirmed
                await UpdateBookingStatus(paymentEvent);
                
                // Send notifications to customer and provider
                await SendNotifications(paymentEvent, context);
                
                // Mark event as processed for idempotency
                _processedEvents.Add(paymentEvent.PaymentId);

                _logger.LogInformation("Completed processing PaymentProcessedEvent for payment {PaymentId}",
                    paymentEvent.PaymentId);
                activity?.SetStatus(ActivityStatusCode.Ok);
            }
            catch (EventValidationException ex)
            {
                _logger.LogError(ex, "Event validation failed for PaymentProcessedEvent for payment {PaymentId}",
                    paymentEvent.PaymentId);
                activity?.SetStatus(ActivityStatusCode.Error);
                // For validation errors, we don't want to retry as they indicate a problem with the event data
                // We'll acknowledge the message to prevent it from being retried
                return;
            }
            catch (BookingUpdateException ex)
            {
                _logger.LogError(ex, "Booking update failed for PaymentProcessedEvent for payment {PaymentId}",
                    paymentEvent.PaymentId);
                activity?.SetStatus(ActivityStatusCode.Error);
                // For booking update failures, we might want to retry
                throw;
            }
            catch (NotificationSendingException ex)
            {
                _logger.LogError(ex, "Notification sending failed for PaymentProcessedEvent for payment {PaymentId}",
                    paymentEvent.PaymentId);
                activity?.SetStatus(ActivityStatusCode.Error);
                // For notification failures, we might want to retry
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error processing PaymentProcessedEvent for payment {PaymentId}",
                    paymentEvent.PaymentId);
                activity?.SetStatus(ActivityStatusCode.Error);
                // For unexpected errors, we'll rethrow to let MassTransit handle retries
                throw;
            }
        }

        /// <summary>
        /// Validates the payment event data
        /// </summary>
        /// <param name="paymentEvent">The payment event to validate</param>
        /// <exception cref="EventValidationException">Thrown when event data is invalid</exception>
        private void ValidateEvent(PaymentProcessedEvent paymentEvent)
        {
            var errors = new List<string>();
            
            if (paymentEvent.PaymentId == Guid.Empty)
            {
                errors.Add("Payment ID is required");
            }
            
            if (paymentEvent.BookingId == Guid.Empty)
            {
                errors.Add("Booking ID is required");
            }
            
            if (paymentEvent.CustomerId == Guid.Empty)
            {
                errors.Add("Customer ID is required");
            }
            
            if (paymentEvent.ProviderId == Guid.Empty)
            {
                errors.Add("Provider ID is required");
            }
            
            if (paymentEvent.TenantId == Guid.Empty)
            {
                errors.Add("Tenant ID is required");
            }
            
            if (paymentEvent.Amount <= 0)
            {
                errors.Add("Amount must be greater than zero");
            }
            
            if (string.IsNullOrEmpty(paymentEvent.Currency))
            {
                errors.Add("Currency is required");
            }
            
            if (string.IsNullOrEmpty(paymentEvent.PaymentMethod))
            {
                errors.Add("Payment method is required");
            }
            
            if (string.IsNullOrEmpty(paymentEvent.TransactionId))
            {
                errors.Add("Transaction ID is required");
            }
            
            if (string.IsNullOrEmpty(paymentEvent.PaymentGateway))
            {
                errors.Add("Payment gateway is required");
            }
            
            if (paymentEvent.ProcessedAt == default(DateTime))
            {
                errors.Add("Processed at date is required");
            }
            
            if (errors.Count > 0)
            {
                throw new EventValidationException($"Event validation failed: {string.Join(", ", errors)}");
            }
            
            _logger.LogDebug("Event validation passed for payment {PaymentId}", paymentEvent.PaymentId);
        }

        /// <summary>
        /// Updates the booking status to confirmed after successful payment
        /// </summary>
        /// <param name="paymentEvent">The payment event</param>
        /// <returns>A task representing the asynchronous operation</returns>
        /// <exception cref="BookingUpdateException">Thrown when booking status update fails</exception>
        private async Task UpdateBookingStatus(PaymentProcessedEvent paymentEvent)
        {
            try
            {
                _logger.LogInformation("Updating booking status for booking {BookingId}", paymentEvent.BookingId);
                
                // Retrieve the booking from the database
                var booking = await _context.Bookings
                    .FirstOrDefaultAsync(b => b.Id == paymentEvent.BookingId && b.TenantId == paymentEvent.TenantId);
                
                if (booking == null)
                {
                    _logger.LogWarning("Booking {BookingId} not found for tenant {TenantId}", paymentEvent.BookingId, paymentEvent.TenantId);
                    throw new BookingUpdateException($"Booking {paymentEvent.BookingId} not found for tenant {paymentEvent.TenantId}");
                }
                
                // Update booking status to confirmed
                booking.Status = "Confirmed";
                booking.UpdatedAt = DateTime.UtcNow;
                
                // Save changes to the database
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Booking status updated to Confirmed for booking {BookingId}", paymentEvent.BookingId);
            }
            catch (Exception ex) when (!(ex is BookingUpdateException))
            {
                _logger.LogError(ex, "Failed to update booking status for booking {BookingId}", paymentEvent.BookingId);
                throw new BookingUpdateException($"Failed to update booking status for booking {paymentEvent.BookingId}", ex);
            }
        }

        /// <summary>
        /// Sends payment confirmation notifications to the customer and provider
        /// </summary>
        /// <param name="paymentEvent">The payment event</param>
        /// <param name="context">The consume context</param>
        /// <returns>A task representing the asynchronous operation</returns>
        /// <exception cref="NotificationSendingException">Thrown when notification sending fails</exception>
        private async Task SendNotifications(PaymentProcessedEvent paymentEvent, ConsumeContext<PaymentProcessedEvent> context)
        {
            try
            {
                _logger.LogInformation("Sending payment confirmation notifications for payment {PaymentId}", paymentEvent.PaymentId);
                
                // Send notification to customer
                var customerNotificationEvent = new NotificationSentEvent
                {
                    NotificationId = Guid.NewGuid(),
                    UserId = paymentEvent.CustomerId,
                    TenantId = paymentEvent.TenantId,
                    NotificationType = "Email",
                    Channel = "PaymentConfirmation",
                    Title = "Payment Confirmed",
                    Message = $"Your payment of {paymentEvent.Amount} {paymentEvent.Currency} has been confirmed for your booking.",
                    SentAt = DateTime.UtcNow,
                    Provider = "SendGrid"
                };
                
                await context.Publish(customerNotificationEvent);
                
                _logger.LogInformation("Customer notification sent for payment {PaymentId}, Notification ID: {NotificationId}",
                    paymentEvent.PaymentId, customerNotificationEvent.NotificationId);
                
                // Send notification to provider
                var providerNotificationEvent = new NotificationSentEvent
                {
                    NotificationId = Guid.NewGuid(),
                    UserId = paymentEvent.ProviderId,
                    TenantId = paymentEvent.TenantId,
                    NotificationType = "Email",
                    Channel = "PaymentConfirmation",
                    Title = "Payment Received",
                    Message = $"A payment of {paymentEvent.Amount} {paymentEvent.Currency} has been received for a booking.",
                    SentAt = DateTime.UtcNow,
                    Provider = "SendGrid"
                };
                
                await context.Publish(providerNotificationEvent);
                
                _logger.LogInformation("Provider notification sent for payment {PaymentId}, Notification ID: {NotificationId}",
                    paymentEvent.PaymentId, providerNotificationEvent.NotificationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notifications for payment {PaymentId}", paymentEvent.PaymentId);
                throw new NotificationSendingException($"Failed to send notifications for payment {paymentEvent.PaymentId}", ex);
            }
        }
    }
}