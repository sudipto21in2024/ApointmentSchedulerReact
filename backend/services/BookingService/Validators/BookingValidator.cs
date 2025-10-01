using FluentValidation;
using FluentValidation.Results;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Shared.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using BookingService.Services;

namespace BookingService.Validators
{
    /// <summary>
    /// Validator for booking operations
    /// </summary>
    public class BookingValidator : IBookingValidator
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BookingValidator> _logger;

        /// <summary>
        /// Initializes a new instance of the BookingValidator class
        /// </summary>
        /// <param name="context">The database context</param>
        /// <param name="logger">The logger</param>
        public BookingValidator(ApplicationDbContext context, ILogger<BookingValidator> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Validates a booking creation request
        /// </summary>
        /// <param name="request">The booking creation request to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the request is null</exception>
        public async Task<ValidationResult> ValidateCreateBookingAsync(CreateBookingRequest request)
        {
            if (request == null)
            {
                _logger.LogWarning("ValidateCreateBookingAsync called with null request");
                throw new ArgumentNullException(nameof(request));
            }

            var validator = new InlineValidator<CreateBookingRequest>();
            
            validator.RuleFor(x => x.CustomerId)
                .NotEmpty().WithMessage("Customer ID is required.");
                
            validator.RuleFor(x => x.ServiceId)
                .NotEmpty().WithMessage("Service ID is required.");
                
            validator.RuleFor(x => x.SlotId)
                .NotEmpty().WithMessage("Slot ID is required.");
                
            validator.RuleFor(x => x.TenantId)
                .NotEmpty().WithMessage("Tenant ID is required.");
                
            validator.RuleFor(x => x.BookingDate)
                .NotEmpty().WithMessage("Booking date is required.")
                .Must(date => date != default(DateTime)).WithMessage("Booking date must be a valid date.");
                
            validator.RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notes must be less than 1000 characters.");

            var result = await validator.ValidateAsync(request);
            
            // Additional business rule validations
            if (result.IsValid)
            {
                // Check if customer exists
                var customerExists = _context.Users.Any(u => u.Id == request.CustomerId && u.TenantId == request.TenantId);
                if (!customerExists)
                {
                    result.Errors.Add(new ValidationFailure("CustomerId", "Customer not found."));
                }
                
                // Check if service exists
                var serviceExists = _context.Services.Any(s => s.Id == request.ServiceId && s.TenantId == request.TenantId);
                if (!serviceExists)
                {
                    result.Errors.Add(new ValidationFailure("ServiceId", "Service not found."));
                }
                
                // Check if slot exists
                var slotExists = _context.Slots.Any(s => s.Id == request.SlotId && s.TenantId == request.TenantId);
                if (!slotExists)
                {
                    result.Errors.Add(new ValidationFailure("SlotId", "Slot not found."));
                }
                
                // Check if slot is available
                if (slotExists)
                {
                    var slot = _context.Slots.FirstOrDefault(s => s.Id == request.SlotId);
                    if (slot != null && !slot.IsAvailable)
                    {
                        result.Errors.Add(new ValidationFailure("SlotId", "Slot is not available."));
                    }
                    
                    if (slot != null && slot.AvailableBookings <= 0)
                    {
                        result.Errors.Add(new ValidationFailure("SlotId", "Slot has no available bookings."));
                    }
                }
                
                // Check if customer already has a booking for this slot
                var existingBooking = _context.Bookings
                    .Any(b => b.CustomerId == request.CustomerId && 
                              b.SlotId == request.SlotId && 
                              b.TenantId == request.TenantId &&
                              b.Status != "Cancelled");
                if (existingBooking)
                {
                    result.Errors.Add(new ValidationFailure("SlotId", "Customer already has a booking for this slot."));
                }
            }
            
            return result;
        }

        /// <summary>
        /// Validates a booking update request
        /// </summary>
        /// <param name="bookingId">The ID of the booking to update</param>
        /// <param name="request">The booking update request to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the request is null</exception>
        /// <exception cref="ArgumentException">Thrown when the bookingId is empty</exception>
        public async Task<ValidationResult> ValidateUpdateBookingAsync(Guid bookingId, UpdateBookingRequest request)
        {
            if (request == null)
            {
                _logger.LogWarning("ValidateUpdateBookingAsync called with null request");
                throw new ArgumentNullException(nameof(request));
            }
            
            if (bookingId == Guid.Empty)
            {
                _logger.LogWarning("ValidateUpdateBookingAsync called with empty bookingId");
                throw new ArgumentException("Booking ID cannot be empty.", nameof(bookingId));
            }

            var validator = new InlineValidator<UpdateBookingRequest>();
            
            validator.RuleFor(x => x.Status)
                .MaximumLength(50).WithMessage("Status must be less than 50 characters.")
                .When(x => x.Status != null);
                
            validator.RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notes must be less than 1000 characters.")
                .When(x => x.Notes != null);

            var result = await validator.ValidateAsync(request);
            
            // Additional business rule validations
            if (result.IsValid)
            {
                // Check if booking exists
                var booking = _context.Bookings
                    .FirstOrDefault(b => b.Id == bookingId);
                    
                if (booking == null)
                {
                    result.Errors.Add(new ValidationFailure("BookingId", "Booking not found."));
                }
                else
                {
                    // Check if booking status allows updates
                    if (booking.Status == "Cancelled" || booking.Status == "Completed")
                    {
                        result.Errors.Add(new ValidationFailure("BookingId", $"Cannot update booking with status {booking.Status}."));
                    }
                }
            }
            
            return result;
        }

        /// <summary>
        /// Validates a booking cancellation request
        /// </summary>
        /// <param name="bookingId">The ID of the booking to cancel</param>
        /// <param name="request">The cancellation request to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the request is null</exception>
        /// <exception cref="ArgumentException">Thrown when the bookingId is empty</exception>
        public async Task<ValidationResult> ValidateCancelBookingAsync(Guid bookingId, CancelBookingRequest request)
        {
            if (request == null)
            {
                _logger.LogWarning("ValidateCancelBookingAsync called with null request");
                throw new ArgumentNullException(nameof(request));
            }
            
            if (bookingId == Guid.Empty)
            {
                _logger.LogWarning("ValidateCancelBookingAsync called with empty bookingId");
                throw new ArgumentException("Booking ID cannot be empty.", nameof(bookingId));
            }

            var validator = new InlineValidator<CancelBookingRequest>();
            
            validator.RuleFor(x => x.CancellationReason)
                .NotEmpty().WithMessage("Cancellation reason is required.")
                .MaximumLength(500).WithMessage("Cancellation reason must be less than 500 characters.");
                
            validator.RuleFor(x => x.CancelledBy)
                .NotEmpty().WithMessage("Cancelled by user ID is required.");

            var result = await validator.ValidateAsync(request);
            
            // Additional business rule validations
            if (result.IsValid)
            {
                // Check if booking exists
                var booking = _context.Bookings
                    .FirstOrDefault(b => b.Id == bookingId);
                    
                if (booking == null)
                {
                    result.Errors.Add(new ValidationFailure("BookingId", "Booking not found."));
                }
                else
                {
                    // Check if booking status allows cancellation
                    if (booking.Status == "Cancelled" || booking.Status == "Completed")
                    {
                        result.Errors.Add(new ValidationFailure("BookingId", $"Cannot cancel booking with status {booking.Status}."));
                    }
                    
                    // Check if slot is in the past
                    var slot = _context.Slots.FirstOrDefault(s => s.Id == booking.SlotId);
                    if (slot != null && slot.StartDateTime < DateTime.UtcNow)
                    {
                        result.Errors.Add(new ValidationFailure("BookingId", "Cannot cancel booking for past slot."));
                    }
                }
            }
            
            return result;
        }

        /// <summary>
        /// Validates a booking rescheduling request
        /// </summary>
        /// <param name="bookingId">The ID of the booking to reschedule</param>
        /// <param name="request">The rescheduling request to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the request is null</exception>
        /// <exception cref="ArgumentException">Thrown when the bookingId is empty</exception>
        public async Task<ValidationResult> ValidateRescheduleBookingAsync(Guid bookingId, RescheduleBookingRequest request)
        {
            if (request == null)
            {
                _logger.LogWarning("ValidateRescheduleBookingAsync called with null request");
                throw new ArgumentNullException(nameof(request));
            }
            
            if (bookingId == Guid.Empty)
            {
                _logger.LogWarning("ValidateRescheduleBookingAsync called with empty bookingId");
                throw new ArgumentException("Booking ID cannot be empty.", nameof(bookingId));
            }

            var validator = new InlineValidator<RescheduleBookingRequest>();
            
            validator.RuleFor(x => x.NewSlotId)
                .NotEmpty().WithMessage("New slot ID is required.");
                
            validator.RuleFor(x => x.RescheduleReason)
                .NotEmpty().WithMessage("Reschedule reason is required.")
                .MaximumLength(50).WithMessage("Reschedule reason must be less than 500 characters.");

            var result = await validator.ValidateAsync(request);
            
            // Additional business rule validations
            if (result.IsValid)
            {
                // Check if booking exists
                var booking = _context.Bookings
                    .FirstOrDefault(b => b.Id == bookingId);
                    
                if (booking == null)
                {
                    result.Errors.Add(new ValidationFailure("BookingId", "Booking not found."));
                }
                else
                {
                    // Check if booking status allows rescheduling
                    if (booking.Status == "Cancelled" || booking.Status == "Completed")
                    {
                        result.Errors.Add(new ValidationFailure("BookingId", $"Cannot reschedule booking with status {booking.Status}."));
                    }
                    
                    // Check if new slot exists
                    var newSlot = _context.Slots.FirstOrDefault(s => s.Id == request.NewSlotId);
                    if (newSlot == null)
                    {
                        result.Errors.Add(new ValidationFailure("NewSlotId", "New slot not found."));
                    }
                    else
                    {
                        // Check if new slot is available
                        if (!newSlot.IsAvailable)
                        {
                            result.Errors.Add(new ValidationFailure("NewSlotId", "New slot is not available."));
                        }
                        
                        if (newSlot.AvailableBookings <= 0)
                        {
                            result.Errors.Add(new ValidationFailure("NewSlotId", "New slot has no available bookings."));
                        }
                        
                        // Check if new slot is for the same service
                        if (newSlot.ServiceId != booking.ServiceId)
                        {
                            result.Errors.Add(new ValidationFailure("NewSlotId", "New slot must be for the same service."));
                        }
                        
                        // Check if customer already has a booking for the new slot
                        var existingBooking = _context.Bookings
                            .Any(b => b.CustomerId == booking.CustomerId && 
                                      b.SlotId == request.NewSlotId && 
                                      b.Id != bookingId &&
                                      b.Status != "Cancelled");
                        if (existingBooking)
                        {
                            result.Errors.Add(new ValidationFailure("NewSlotId", "Customer already has a booking for the new slot."));
                        }
                    }
                }
            }
            
            return result;
        }

        /// <summary>
        /// Validates booking business rules
        /// </summary>
        /// <param name="booking">The booking to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the booking is null</exception>
        public async Task<ValidationResult> ValidateBookingBusinessRulesAsync(Booking booking)
        {
            if (booking == null)
            {
                _logger.LogWarning("ValidateBookingBusinessRulesAsync called with null booking");
                throw new ArgumentNullException(nameof(booking));
            }

            var result = new ValidationResult();
            
            // Validate booking status
            var validStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };
            if (!validStatuses.Contains(booking.Status))
            {
                result.Errors.Add(new ValidationFailure("Status", "Invalid booking status."));
            }
            
            // Validate booking date
            if (booking.BookingDate == default(DateTime))
            {
                result.Errors.Add(new ValidationFailure("BookingDate", "Booking date is required."));
            }
            
            // Validate notes length
            if (!string.IsNullOrEmpty(booking.Notes) && booking.Notes.Length > 1000)
            {
                result.Errors.Add(new ValidationFailure("Notes", "Notes must be less than 1000 characters."));
            }
            
            // Validate customer exists
            var customerExists = _context.Users.Any(u => u.Id == booking.CustomerId && u.TenantId == booking.TenantId);
            if (!customerExists)
            {
                result.Errors.Add(new ValidationFailure("CustomerId", "Customer not found."));
            }
            
            // Validate service exists
            var serviceExists = _context.Services.Any(s => s.Id == booking.ServiceId && s.TenantId == booking.TenantId);
            if (!serviceExists)
            {
                result.Errors.Add(new ValidationFailure("ServiceId", "Service not found."));
            }
            
            // Validate slot exists
            var slotExists = _context.Slots.Any(s => s.Id == booking.SlotId && s.TenantId == booking.TenantId);
            if (!slotExists)
            {
                result.Errors.Add(new ValidationFailure("SlotId", "Slot not found."));
            }
            
            return await Task.FromResult(result);
        }
    }
}