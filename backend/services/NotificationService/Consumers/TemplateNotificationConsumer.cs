using MassTransit;
using Shared.Events;
using NotificationService.Services;
using Shared.Data; // For ApplicationDbContext
using Microsoft.EntityFrameworkCore; // For FirstOrDefaultAsync
using Shared.Models; // For User, Service, Booking
using Shared.DTOs.EmailTemplates; // For BookingConfirmationEmailDto
using Shared.DTOs; // For SendNotificationDto
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace NotificationService.Consumers
{
    public class TemplateNotificationConsumer : IConsumer<TemplateNotificationEvent>
    {
        private readonly ITemplateRendererService _templateRendererService;
        private readonly INotificationService _notificationService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<TemplateNotificationConsumer> _logger;

        public TemplateNotificationConsumer(
            ITemplateRendererService templateRendererService,
            INotificationService notificationService,
            ApplicationDbContext dbContext,
            ILogger<TemplateNotificationConsumer> logger)
        {
            _templateRendererService = templateRendererService;
            _notificationService = notificationService;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<TemplateNotificationEvent> context)
        {
            var eventMessage = context.Message;
            _logger.LogInformation("Received TemplateNotificationEvent for template: {TemplateName}, User: {UserId}",
                eventMessage.TemplateName, eventMessage.UserId);

            try
            {
                string renderedContent = string.Empty;

                // Example: Handling BookingConfirmation template
                if (eventMessage.TemplateName == "BookingConfirmation.html" && eventMessage.TemplateModel is Guid bookingId)
                {
                    var booking = await _dbContext.Bookings
                        .Include(b => b.Customer)
                        .Include(b => b.Service)
                        .Include(b => b.Slot)
                        .FirstOrDefaultAsync(b => b.Id == bookingId);

                    if (booking != null)
                    {
                        var model = new BookingConfirmationEmailDto
                        {
                            CustomerName = $"{booking.Customer?.FirstName} {booking.Customer?.LastName}",
                            ServiceName = booking.Service?.Name ?? "Unknown Service",
                            BookingDate = booking.BookingDate,
                            BookingTime = booking.BookingDate.ToShortTimeString(),
                            ProviderName = booking.Service?.Provider?.FirstName ?? "Unknown Provider"
                        };
                        renderedContent = await _templateRendererService.RenderTemplateAsync(eventMessage.TemplateName, model);
                    }
                    else
                    {
                        _logger.LogWarning("Booking not found for BookingConfirmation template, BookingId: {BookingId}", bookingId);
                        return; // Do not proceed if booking is not found
                    }
                }
                else
                {
                    _logger.LogWarning("Unsupported template name or invalid model type: {TemplateName}", eventMessage.TemplateName);
                    // For other templates, you might have different logic to cast TemplateModel
                    // or fetch data. For now, we'll just log and return.
                    return;
                }

                // Now, send the rendered content using the NotificationService
                var notificationDto = new SendNotificationDto
                {
                    UserId = eventMessage.UserId,
                    Title = $"Your {eventMessage.TemplateName.Replace(".html", "")} from Appointment Scheduler",
                    Message = renderedContent,
                    Type = "email", // Assuming email for HTML templates
                    RelatedEntityId = eventMessage.NotificationId
                };

                await _notificationService.SendNotificationAsync(notificationDto);
                _logger.LogInformation("Successfully processed TemplateNotificationEvent for template: {TemplateName}, User: {UserId}",
                    eventMessage.TemplateName, eventMessage.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing TemplateNotificationEvent for template: {TemplateName}, User: {UserId}",
                    eventMessage.TemplateName, eventMessage.UserId);
            }
        }
    }
}