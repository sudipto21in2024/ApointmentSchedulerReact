using FluentValidation;
using FluentValidation.Results;
using BookingService.Services;
using Shared.Models;
using System;
using System.Threading.Tasks;

namespace BookingService.Validators
{
    /// <summary>
    /// Interface for booking validation operations
    /// </summary>
    public interface IBookingValidator
    {
        /// <summary>
        /// Validates a booking creation request
        /// </summary>
        /// <param name="request">The booking creation request to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the request is null</exception>
        /// <exception cref="FluentValidation.ValidationException">Thrown when validation fails</exception>
        Task<ValidationResult> ValidateCreateBookingAsync(CreateBookingRequest request);

        /// <summary>
        /// Validates a booking update request
        /// </summary>
        /// <param name="bookingId">The ID of the booking to update</param>
        /// <param name="request">The booking update request to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the request is null</exception>
        /// <exception cref="FluentValidation.ValidationException">Thrown when validation fails</exception>
        /// <exception cref="ArgumentException">Thrown when the bookingId is empty</exception>
        Task<ValidationResult> ValidateUpdateBookingAsync(Guid bookingId, UpdateBookingRequest request);

        /// <summary>
        /// Validates a booking cancellation request
        /// </summary>
        /// <param name="bookingId">The ID of the booking to cancel</param>
        /// <param name="request">The cancellation request to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the request is null</exception>
        /// <exception cref="FluentValidation.ValidationException">Thrown when validation fails</exception>
        /// <exception cref="ArgumentException">Thrown when the bookingId is empty</exception>
        Task<ValidationResult> ValidateCancelBookingAsync(Guid bookingId, CancelBookingRequest request);

        /// <summary>
        /// Validates a booking rescheduling request
        /// </summary>
        /// <param name="bookingId">The ID of the booking to reschedule</param>
        /// <param name="request">The rescheduling request to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the request is null</exception>
        /// <exception cref="FluentValidation.ValidationException">Thrown when validation fails</exception>
        /// <exception cref="ArgumentException">Thrown when the bookingId is empty</exception>
        Task<ValidationResult> ValidateRescheduleBookingAsync(Guid bookingId, RescheduleBookingRequest request);

        /// <summary>
        /// Validates booking business rules
        /// </summary>
        /// <param name="booking">The booking to validate</param>
        /// <returns>A ValidationResult containing validation results</returns>
        /// <exception cref="ArgumentNullException">Thrown when the booking is null</exception>
        /// <exception cref="FluentValidation.ValidationException">Thrown when validation fails</exception>
        Task<ValidationResult> ValidateBookingBusinessRulesAsync(Booking booking);
    }
}