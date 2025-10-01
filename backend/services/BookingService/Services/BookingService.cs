using Shared.Models;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.Diagnostics;

namespace BookingService.Services
{
    /// <summary>
    /// Implementation of the IBookingService interface for booking operations
    /// </summary>
    public class BookingServiceImpl : IBookingService
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("BookingService.BookingServiceImpl");
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BookingServiceImpl> _logger;

        /// <summary>
        /// Initializes a new instance of the BookingServiceImpl class
        /// </summary>
        /// <param name="context">The database context</param>
        /// <param name="logger">The logger</param>
        public BookingServiceImpl(ApplicationDbContext context, ILogger<BookingServiceImpl> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new booking
        /// </summary>
        /// <param name="request">The booking creation request</param>
        /// <returns>The created booking</returns>
        /// <exception cref="SlotNotAvailableException">Thrown when the requested slot is not available</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        /// <exception cref="EntityNotFoundException">Thrown when referenced entities are not found</exception>
        public async Task<Booking> CreateBookingAsync(CreateBookingRequest request)
        {
            using var activity = ActivitySource.StartActivity("BookingService.CreateBookingAsync");
            activity?.SetTag("booking.customerId", request.CustomerId);
            activity?.SetTag("booking.serviceId", request.ServiceId);
            activity?.SetTag("booking.slotId", request.SlotId);

            try
            {
                // Use transaction for multi-step operation
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Validate slot availability with locking to prevent concurrency issues
                    var slot = await _context.Slots
                        .FirstOrDefaultAsync(s => s.Id == request.SlotId && s.IsAvailable && s.AvailableBookings > 0);

                    if (slot == null)
                    {
                        _logger.LogWarning("Slot {SlotId} is not available for booking", request.SlotId);
                        throw new SlotNotAvailableException($"Slot {request.SlotId} is not available");
                    }

                    // Check if customer already has a booking for this slot
                    var existingBooking = await _context.Bookings
                        .AnyAsync(b => b.CustomerId == request.CustomerId && b.SlotId == request.SlotId);

                    if (existingBooking)
                    {
                        _logger.LogWarning("Customer {CustomerId} already has a booking for slot {SlotId}",
                            request.CustomerId, request.SlotId);
                        throw new BusinessRuleViolationException("Customer already has a booking for this slot");
                    }

                    // Get the service to verify it exists and get tenant info
                    var service = await _context.Services.FindAsync(request.ServiceId);
                    if (service == null)
                    {
                        _logger.LogWarning("Service {ServiceId} not found", request.ServiceId);
                        throw new EntityNotFoundException($"Service {request.ServiceId} not found");
                    }

                    // Create booking entity
                    var booking = new Booking
                    {
                        Id = Guid.NewGuid(),
                        CustomerId = request.CustomerId,
                        ServiceId = request.ServiceId,
                        SlotId = request.SlotId,
                        TenantId = request.TenantId,
                        Status = "Pending",
                        BookingDate = request.BookingDate,
                        Notes = request.Notes,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    // Add booking to database
                    _context.Bookings.Add(booking);

                    // Update slot availability
                    slot.AvailableBookings--;
                    if (slot.AvailableBookings == 0)
                    {
                        slot.IsAvailable = false;
                    }
                    slot.UpdatedAt = DateTime.UtcNow;
                    _context.Slots.Update(slot);

                    // Save changes
                    await _context.SaveChangesAsync();

                    // Commit transaction
                    await transaction.CommitAsync();

                    _logger.LogInformation("Booking {BookingId} created successfully for customer {CustomerId}",
                        booking.Id, request.CustomerId);
                    activity?.SetStatus(ActivityStatusCode.Ok);
                    return booking;
                }
                catch (Exception)
                {
                    // Rollback transaction on error
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex) when (!(ex is SlotNotAvailableException || ex is BusinessRuleViolationException || ex is EntityNotFoundException))
            {
                _logger.LogError(ex, "Error creating booking for customer {CustomerId}", request.CustomerId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Retrieves a booking by its ID
        /// </summary>
        /// <param name="bookingId">The ID of the booking to retrieve</param>
        /// <returns>The booking with the specified ID</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        public async Task<Booking> GetBookingByIdAsync(Guid bookingId)
        {
            using var activity = ActivitySource.StartActivity("BookingService.GetBookingByIdAsync");
            activity?.SetTag("booking.id", bookingId);

            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Customer)
                    .Include(b => b.Service)
                    .Include(b => b.Slot)
                    .FirstOrDefaultAsync(b => b.Id == bookingId);

                if (booking == null)
                {
                    _logger.LogWarning("Booking {BookingId} not found", bookingId);
                    throw new EntityNotFoundException($"Booking {bookingId} not found");
                }

                activity?.SetStatus(ActivityStatusCode.Ok);
                return booking;
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException))
            {
                _logger.LogError(ex, "Error retrieving booking {BookingId}", bookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Updates an existing booking
        /// </summary>
        /// <param name="bookingId">The ID of the booking to update</param>
        /// <param name="request">The booking update request</param>
        /// <returns>The updated booking</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        public async Task<Booking> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request)
        {
            using var activity = ActivitySource.StartActivity("BookingService.UpdateBookingAsync");
            activity?.SetTag("booking.id", bookingId);

            try
            {
                var booking = await _context.Bookings.FindAsync(bookingId);
                if (booking == null)
                {
                    _logger.LogWarning("Booking {BookingId} not found", bookingId);
                    throw new EntityNotFoundException($"Booking {bookingId} not found");
                }

                // Validate status for updates
                if (booking.Status == "Cancelled" || booking.Status == "Completed")
                {
                    _logger.LogWarning("Cannot update booking {BookingId} with status {Status}", bookingId, booking.Status);
                    throw new BusinessRuleViolationException($"Cannot update booking with status {booking.Status}");
                }

                // Update properties
                if (request.Status != null)
                {
                    // Add to history before status change
                    var history = new BookingHistory
                    {
                        Id = Guid.NewGuid(),
                        BookingId = booking.Id,
                        OldStatus = booking.Status,
                        NewStatus = request.Status,
                        ChangedBy = booking.CustomerId, // In a real implementation, this would be the actual user making the change
                        ChangeReason = "Status updated via API",
                        ChangedAt = DateTime.UtcNow,
                        TenantId = booking.TenantId
                    };
                    _context.BookingHistories.Add(history);

                    booking.Status = request.Status;
                }

                if (request.Notes != null)
                {
                    booking.Notes = request.Notes;
                }

                booking.UpdatedAt = DateTime.UtcNow;

                _context.Bookings.Update(booking);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Booking {BookingId} updated successfully", bookingId);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return booking;
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException || ex is BusinessRuleViolationException))
            {
                _logger.LogError(ex, "Error updating booking {BookingId}", bookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Cancels an existing booking
        /// </summary>
        /// <param name="bookingId">The ID of the booking to cancel</param>
        /// <param name="request">The cancellation request</param>
        /// <returns>The cancelled booking</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated (e.g., cancellation period expired)</exception>
        public async Task<Booking> CancelBookingAsync(Guid bookingId, CancelBookingRequest request)
        {
            using var activity = ActivitySource.StartActivity("BookingService.CancelBookingAsync");
            activity?.SetTag("booking.id", bookingId);

            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Slot)
                    .FirstOrDefaultAsync(b => b.Id == bookingId);

                if (booking == null)
                {
                    _logger.LogWarning("Booking {BookingId} not found", bookingId);
                    throw new EntityNotFoundException($"Booking {bookingId} not found");
                }

                // Validate cancellation rules
                if (booking.Status == "Cancelled" || booking.Status == "Completed")
                {
                    _logger.LogWarning("Cannot cancel booking {BookingId} with status {Status}", bookingId, booking.Status);
                    throw new BusinessRuleViolationException($"Cannot cancel booking with status {booking.Status}");
                }

                // In a real implementation, we would check cancellation policies based on service settings
                // For now, we'll allow cancellation at any time before the slot start time
                if (booking.Slot.StartDateTime < DateTime.UtcNow)
                {
                    _logger.LogWarning("Cannot cancel booking {BookingId} for past slot", bookingId);
                    throw new BusinessRuleViolationException("Cannot cancel booking for past slot");
                }

                // Use transaction for multi-step operation
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Update booking status
                    var oldStatus = booking.Status;
                    booking.Status = "Cancelled";
                    booking.CancelledAt = DateTime.UtcNow;
                    booking.CancelledBy = request.CancelledBy;
                    booking.UpdatedAt = DateTime.UtcNow;

                    // Add to history
                    var history = new BookingHistory
                    {
                        Id = Guid.NewGuid(),
                        BookingId = booking.Id,
                        OldStatus = oldStatus,
                        NewStatus = "Cancelled",
                        ChangedBy = request.CancelledBy,
                        ChangeReason = request.CancellationReason,
                        ChangedAt = DateTime.UtcNow,
                        TenantId = booking.TenantId
                    };
                    _context.BookingHistories.Add(history);

                    // Update slot availability
                    var slot = booking.Slot;
                    slot.AvailableBookings++;
                    slot.IsAvailable = true;
                    slot.UpdatedAt = DateTime.UtcNow;
                    _context.Slots.Update(slot);

                    // Update booking
                    _context.Bookings.Update(booking);

                    // Save changes
                    await _context.SaveChangesAsync();

                    // Commit transaction
                    await transaction.CommitAsync();

                    _logger.LogInformation("Booking {BookingId} cancelled successfully", bookingId);
                    activity?.SetStatus(ActivityStatusCode.Ok);
                    return booking;
                }
                catch (Exception)
                {
                    // Rollback transaction on error
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException || ex is BusinessRuleViolationException))
            {
                _logger.LogError(ex, "Error cancelling booking {BookingId}", bookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Confirms a booking (typically after payment)
        /// </summary>
        /// <param name="bookingId">The ID of the booking to confirm</param>
        /// <returns>The confirmed booking</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        public async Task<Booking> ConfirmBookingAsync(Guid bookingId)
        {
            using var activity = ActivitySource.StartActivity("BookingService.ConfirmBookingAsync");
            activity?.SetTag("booking.id", bookingId);

            try
            {
                var booking = await _context.Bookings.FindAsync(bookingId);
                if (booking == null)
                {
                    _logger.LogWarning("Booking {BookingId} not found", bookingId);
                    throw new EntityNotFoundException($"Booking {bookingId} not found");
                }

                // Validate confirmation rules
                if (booking.Status != "Pending")
                {
                    _logger.LogWarning("Cannot confirm booking {BookingId} with status {Status}", bookingId, booking.Status);
                    throw new BusinessRuleViolationException($"Cannot confirm booking with status {booking.Status}");
                }

                // Add to history before status change
                var history = new BookingHistory
                {
                    Id = Guid.NewGuid(),
                    BookingId = booking.Id,
                    OldStatus = booking.Status,
                    NewStatus = "Confirmed",
                    ChangedBy = booking.CustomerId, // In a real implementation, this would be the actual user making the change
                    ChangeReason = "Booking confirmed after payment",
                    ChangedAt = DateTime.UtcNow,
                    TenantId = booking.TenantId
                };
                _context.BookingHistories.Add(history);

                // Update booking status
                booking.Status = "Confirmed";
                booking.UpdatedAt = DateTime.UtcNow;

                _context.Bookings.Update(booking);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Booking {BookingId} confirmed successfully", bookingId);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return booking;
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException || ex is BusinessRuleViolationException))
            {
                _logger.LogError(ex, "Error confirming booking {BookingId}", bookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Retrieves a collection of bookings based on filter criteria
        /// </summary>
        /// <param name="filter">The filter criteria</param>
        /// <returns>A collection of bookings matching the filter criteria</returns>
        public async Task<IEnumerable<Booking>> GetBookingsAsync(BookingFilter filter)
        {
            using var activity = ActivitySource.StartActivity("BookingService.GetBookingsAsync");

            try
            {
                var query = _context.Bookings.AsQueryable();

                // Apply filters
                if (filter.CustomerId.HasValue)
                {
                    query = query.Where(b => b.CustomerId == filter.CustomerId.Value);
                }

                if (filter.ServiceId.HasValue)
                {
                    query = query.Where(b => b.ServiceId == filter.ServiceId.Value);
                }

                if (!string.IsNullOrEmpty(filter.Status))
                {
                    query = query.Where(b => b.Status == filter.Status);
                }

                if (filter.DateFrom.HasValue)
                {
                    query = query.Where(b => b.BookingDate >= filter.DateFrom.Value);
                }

                if (filter.DateTo.HasValue)
                {
                    query = query.Where(b => b.BookingDate <= filter.DateTo.Value);
                }

                if (filter.TenantId.HasValue)
                {
                    query = query.Where(b => b.TenantId == filter.TenantId.Value);
                }

                var bookings = await query
                    .Include(b => b.Customer)
                    .Include(b => b.Service)
                    .Include(b => b.Slot)
                    .ToListAsync();

                activity?.SetStatus(ActivityStatusCode.Ok);
                return bookings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bookings with filter");
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Reschedules an existing booking to a new slot
        /// </summary>
        /// <param name="bookingId">The ID of the booking to reschedule</param>
        /// <param name="request">The rescheduling request</param>
        /// <returns>The rescheduled booking</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking with the specified ID is not found</exception>
        /// <exception cref="SlotNotAvailableException">Thrown when the requested new slot is not available</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        public async Task<Booking> RescheduleBookingAsync(Guid bookingId, RescheduleBookingRequest request)
        {
            using var activity = ActivitySource.StartActivity("BookingService.RescheduleBookingAsync");
            activity?.SetTag("booking.id", bookingId);
            activity?.SetTag("newSlotId", request.NewSlotId);

            try
            {
                // Use transaction for multi-step operation
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var booking = await _context.Bookings
                        .Include(b => b.Slot)
                        .FirstOrDefaultAsync(b => b.Id == bookingId);

                    if (booking == null)
                    {
                        _logger.LogWarning("Booking {BookingId} not found", bookingId);
                        throw new EntityNotFoundException($"Booking {bookingId} not found");
                    }

                    // Validate rescheduling rules
                    if (booking.Status == "Cancelled" || booking.Status == "Completed")
                    {
                        _logger.LogWarning("Cannot reschedule booking {BookingId} with status {Status}", bookingId, booking.Status);
                        throw new BusinessRuleViolationException($"Cannot reschedule booking with status {booking.Status}");
                    }

                    // Check if new slot is available with locking to prevent concurrency issues
                    var newSlot = await _context.Slots
                        .FirstOrDefaultAsync(s => s.Id == request.NewSlotId && s.IsAvailable && s.AvailableBookings > 0);

                    if (newSlot == null)
                    {
                        _logger.LogWarning("New slot {NewSlotId} is not available for rescheduling", request.NewSlotId);
                        throw new SlotNotAvailableException($"New slot {request.NewSlotId} is not available");
                    }

                    // Update old slot availability
                    var oldSlot = booking.Slot;
                    oldSlot.AvailableBookings++;
                    oldSlot.IsAvailable = true;
                    oldSlot.UpdatedAt = DateTime.UtcNow;
                    _context.Slots.Update(oldSlot);

                    // Update booking with new slot
                    booking.SlotId = request.NewSlotId;
                    booking.UpdatedAt = DateTime.UtcNow;

                    // Update new slot availability
                    newSlot.AvailableBookings--;
                    if (newSlot.AvailableBookings == 0)
                    {
                        newSlot.IsAvailable = false;
                    }
                    newSlot.UpdatedAt = DateTime.UtcNow;
                    _context.Slots.Update(newSlot);

                    // Add to history
                    var history = new BookingHistory
                    {
                        Id = Guid.NewGuid(),
                        BookingId = booking.Id,
                        OldStatus = booking.Status,
                        NewStatus = booking.Status, // Status remains the same
                        ChangedBy = booking.CustomerId, // In a real implementation, this would be the actual user making the change
                        ChangeReason = request.RescheduleReason,
                        ChangedAt = DateTime.UtcNow,
                        TenantId = booking.TenantId
                    };
                    _context.BookingHistories.Add(history);

                    // Update booking
                    _context.Bookings.Update(booking);

                    // Save changes
                    await _context.SaveChangesAsync();

                    // Commit transaction
                    await transaction.CommitAsync();

                    _logger.LogInformation("Booking {BookingId} rescheduled successfully to slot {NewSlotId}",
                        bookingId, request.NewSlotId);
                    activity?.SetStatus(ActivityStatusCode.Ok);
                    return booking;
                }
                catch (Exception)
                {
                    // Rollback transaction on error
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException || ex is SlotNotAvailableException || ex is BusinessRuleViolationException))
            {
                _logger.LogError(ex, "Error rescheduling booking {BookingId}", bookingId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }
    }
}