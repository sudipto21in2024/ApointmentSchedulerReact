using Shared.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingService.Services
{
    /// <summary>
    /// Interface for booking service operations
    /// </summary>
    public interface IBookingService
    {
        /// <summary>
        /// Creates a new booking
        /// </summary>
        /// <param name="request">The booking creation request</param>
        /// <returns>The created booking</returns>
        /// <exception cref="SlotNotAvailableException">Thrown when the requested slot is not available</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        /// <exception cref="EntityNotFoundException">Thrown when referenced entities are not found</exception>
        Task<Booking> CreateBookingAsync(CreateBookingRequest request);

        /// <summary>
        /// Retrieves a booking by its ID
        /// </summary>
        /// <param name="bookingId">The ID of the booking to retrieve</param>
        /// <returns>The booking with the specified ID</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        Task<Booking> GetBookingByIdAsync(Guid bookingId);

        /// <summary>
        /// Updates an existing booking
        /// </summary>
        /// <param name="bookingId">The ID of the booking to update</param>
        /// <param name="request">The booking update request</param>
        /// <returns>The updated booking</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        Task<Booking> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request);

        /// <summary>
        /// Cancels an existing booking
        /// </summary>
        /// <param name="bookingId">The ID of the booking to cancel</param>
        /// <param name="request">The cancellation request</param>
        /// <returns>The cancelled booking</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated (e.g., cancellation period expired)</exception>
        Task<Booking> CancelBookingAsync(Guid bookingId, CancelBookingRequest request);

        /// <summary>
        /// Confirms a booking (typically after payment)
        /// </summary>
        /// <param name="bookingId">The ID of the booking to confirm</param>
        /// <returns>The confirmed booking</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        Task<Booking> ConfirmBookingAsync(Guid bookingId);

        /// <summary>
        /// Retrieves a collection of bookings based on filter criteria
        /// </summary>
        /// <param name="filter">The filter criteria</param>
        /// <returns>A collection of bookings matching the filter criteria</returns>
        Task<IEnumerable<Booking>> GetBookingsAsync(BookingFilter filter);

        /// <summary>
        /// Reschedules an existing booking to a new slot
        /// </summary>
        /// <param name="bookingId">The ID of the booking to reschedule</param>
        /// <param name="request">The rescheduling request</param>
        /// <returns>The rescheduled booking</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        /// <exception cref="SlotNotAvailableException">Thrown when the requested new slot is not available</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        Task<Booking> RescheduleBookingAsync(Guid bookingId, RescheduleBookingRequest request);
    }

    // Request and filter models would typically be in separate files, but including them here for completeness
    
    /// <summary>
    /// Request model for creating a booking
    /// </summary>
    public class CreateBookingRequest
    {
        /// <summary>
        /// The ID of the customer making the booking
        /// </summary>
        public Guid CustomerId { get; set; }

        /// <summary>
        /// The ID of the service being booked
        /// </summary>
        public Guid ServiceId { get; set; }

        /// <summary>
        /// The ID of the slot for the booking
        /// </summary>
        public Guid SlotId { get; set; }

        /// <summary>
        /// The ID of the tenant
        /// </summary>
        public Guid TenantId { get; set; }

        /// <summary>
        /// The date of the booking
        /// </summary>
        public DateTime BookingDate { get; set; }

        /// <summary>
        /// Optional notes for the booking
        /// </summary>
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Request model for updating a booking
    /// </summary>
    public class UpdateBookingRequest
    {
        /// <summary>
        /// The updated status of the booking
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// Updated notes for the booking
        /// </summary>
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Request model for cancelling a booking
    /// </summary>
    public class CancelBookingRequest
    {
        /// <summary>
        /// The reason for cancellation
        /// </summary>
        public string CancellationReason { get; set; } = string.Empty;

        /// <summary>
        /// The ID of the user who cancelled the booking
        /// </summary>
        public Guid CancelledBy { get; set; }
    }

    /// <summary>
    /// Filter model for retrieving bookings
    /// </summary>
    public class BookingFilter
    {
        /// <summary>
        /// Filter by customer ID
        /// </summary>
        public Guid? CustomerId { get; set; }

        /// <summary>
        /// Filter by service ID
        /// </summary>
        public Guid? ServiceId { get; set; }

        /// <summary>
        /// Filter by status
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// Filter by date range start
        /// </summary>
        public DateTime? DateFrom { get; set; }

        /// <summary>
        /// Filter by date range end
        /// </summary>
        public DateTime? DateTo { get; set; }

        /// <summary>
        /// The ID of the tenant
        /// </summary>
        public Guid? TenantId { get; set; }
    }

    /// <summary>
    /// Request model for rescheduling a booking
    /// </summary>
    public class RescheduleBookingRequest
    {
        /// <summary>
        /// The ID of the new slot for the booking
        /// </summary>
        public Guid NewSlotId { get; set; }

        /// <summary>
        /// The reason for rescheduling
        /// </summary>
        public string RescheduleReason { get; set; } = string.Empty;
    }

    /// <summary>
    /// Exception thrown when a business rule is violated
    /// </summary>
    public class BusinessRuleViolationException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the BusinessRuleViolationException class
        /// </summary>
        /// <param name="message">The exception message</param>
        public BusinessRuleViolationException(string message) : base(message) { }
    }

    /// <summary>
    /// Exception thrown when a slot is not available
    /// </summary>
    public class SlotNotAvailableException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the SlotNotAvailableException class
        /// </summary>
        /// <param name="message">The exception message</param>
        public SlotNotAvailableException(string message) : base(message) { }
    }

    /// <summary>
    /// Exception thrown when an entity is not found
    /// </summary>
    public class EntityNotFoundException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the EntityNotFoundException class
        /// </summary>
        /// <param name="message">The exception message</param>
        public EntityNotFoundException(string message) : base(message) { }
    }
}