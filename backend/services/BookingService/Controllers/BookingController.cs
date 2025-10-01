using Microsoft.AspNetCore.Mvc;
using Shared.Events;
using MassTransit;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace BookingService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly ILogger<BookingController> _logger;
        private readonly IPublishEndpoint _publishEndpoint;

        public BookingController(ILogger<BookingController> logger, IPublishEndpoint publishEndpoint)
        {
            _logger = logger;
            _publishEndpoint = publishEndpoint;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            // In a real implementation, this would create a booking in the database
            // For now, we'll just simulate the creation and publish the event
            
            var bookingId = Guid.NewGuid();
            
            _logger.LogInformation($"Booking created with ID: {bookingId}");
            
            // Publish BookingCreatedEvent
            var bookingCreatedEvent = new BookingCreatedEvent
            {
                BookingId = bookingId,
                CustomerId = request.CustomerId,
                ServiceId = request.ServiceId,
                SlotId = request.SlotId,
                ProviderId = request.ProviderId,
                TenantId = request.TenantId,
                BookingDate = request.BookingDate,
                SlotStartDateTime = request.SlotStartDateTime,
                SlotEndDateTime = request.SlotEndDateTime,
                Price = request.Price,
                Currency = request.Currency,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            
            await _publishEndpoint.Publish(bookingCreatedEvent);
            
            _logger.LogInformation($"BookingCreatedEvent published for booking {bookingId}");
            
            return Ok(new { BookingId = bookingId, Message = "Booking created successfully" });
        }
    }
    
    public class CreateBookingRequest
    {
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
    }
}