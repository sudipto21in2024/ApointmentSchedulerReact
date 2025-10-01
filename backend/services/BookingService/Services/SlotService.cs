using Shared.Models;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Linq;

namespace BookingService.Services
{
    /// <summary>
    /// Implementation of the ISlotService interface for slot management operations
    /// </summary>
    public class SlotService : ISlotService
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("BookingService.SlotService");
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SlotService> _logger;

        /// <summary>
        /// Initializes a new instance of the SlotService class
        /// </summary>
        /// <param name="context">The database context</param>
        /// <param name="logger">The logger</param>
        public SlotService(ApplicationDbContext context, ILogger<SlotService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new slot
        /// </summary>
        /// <param name="request">The slot creation request</param>
        /// <returns>The created slot</returns>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        /// <exception cref="EntityNotFoundException">Thrown when referenced entities are not found</exception>
        public async Task<Slot> CreateSlotAsync(CreateSlotRequest request)
        {
            using var activity = ActivitySource.StartActivity("SlotService.CreateSlotAsync");
            activity?.SetTag("slot.serviceId", request.ServiceId);
            activity?.SetTag("slot.startDateTime", request.StartDateTime);
            activity?.SetTag("slot.endDateTime", request.EndDateTime);

            LoggingExtensions.AddTraceIdToLogContext();

            try
            {
                // Validate slot parameters
                if (request.EndDateTime <= request.StartDateTime)
                {
                    _logger.LogWarning("End date time must be after start date time");
                    throw new BusinessRuleViolationException("End date time must be after start date time");
                }

                if (request.MaxBookings <= 0)
                {
                    _logger.LogWarning("Max bookings must be greater than zero");
                    throw new BusinessRuleViolationException("Max bookings must be greater than zero");
                }

                // Check if service exists
                var service = await _context.Services.FindAsync(request.ServiceId);
                if (service == null)
                {
                    _logger.LogWarning("Service {ServiceId} not found", request.ServiceId);
                    throw new EntityNotFoundException($"Service {request.ServiceId} not found");
                }

                // Check for overlapping slots
                var overlappingSlots = await _context.Slots
                    .Where(s => s.ServiceId == request.ServiceId &&
                               s.StartDateTime < request.EndDateTime &&
                               s.EndDateTime > request.StartDateTime)
                    .AnyAsync();

                if (overlappingSlots)
                {
                    _logger.LogWarning("Overlapping slot detected for service {ServiceId}", request.ServiceId);
                    throw new BusinessRuleViolationException("Overlapping slot detected for this service");
                }

                // Create slot entity
                var slot = new Slot
                {
                    Id = Guid.NewGuid(),
                    ServiceId = request.ServiceId,
                    StartDateTime = request.StartDateTime,
                    EndDateTime = request.EndDateTime,
                    MaxBookings = request.MaxBookings,
                    AvailableBookings = request.MaxBookings,
                    IsAvailable = request.IsAvailable,
                    IsRecurring = request.IsRecurring,
                    TenantId = request.TenantId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Slots.Add(slot);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Slot {SlotId} created successfully for service {ServiceId}", slot.Id, request.ServiceId);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return slot;
            }
            catch (Exception ex) when (!(ex is BusinessRuleViolationException || ex is EntityNotFoundException))
            {
                _logger.LogError(ex, "Error creating slot for service {ServiceId}", request.ServiceId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Retrieves a slot by its ID
        /// </summary>
        /// <param name="slotId">The ID of the slot to retrieve</param>
        /// <returns>The slot with the specified ID</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        public async Task<Slot> GetSlotByIdAsync(Guid slotId)
        {
            using var activity = ActivitySource.StartActivity("SlotService.GetSlotByIdAsync");
            activity?.SetTag("slot.id", slotId);

            try
            {
                var slot = await _context.Slots
                    .Include(s => s.Service)
                    .FirstOrDefaultAsync(s => s.Id == slotId);

                if (slot == null)
                {
                    _logger.LogWarning("Slot {SlotId} not found", slotId);
                    throw new EntityNotFoundException($"Slot {slotId} not found");
                }

                activity?.SetStatus(ActivityStatusCode.Ok);
                return slot;
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException))
            {
                _logger.LogError(ex, "Error retrieving slot {SlotId}", slotId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Updates an existing slot
        /// </summary>
        /// <param name="slotId">The ID of the slot to update</param>
        /// <param name="request">The slot update request</param>
        /// <returns>The updated slot</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        public async Task<Slot> UpdateSlotAsync(Guid slotId, UpdateSlotRequest request)
        {
            using var activity = ActivitySource.StartActivity("SlotService.UpdateSlotAsync");
            activity?.SetTag("slot.id", slotId);

            try
            {
                var slot = await _context.Slots.FindAsync(slotId);
                if (slot == null)
                {
                    _logger.LogWarning("Slot {SlotId} not found", slotId);
                    throw new EntityNotFoundException($"Slot {slotId} not found");
                }

                // Validate parameters if provided
                if (request.EndDateTime.HasValue && request.StartDateTime.HasValue)
                {
                    if (request.EndDateTime.Value <= request.StartDateTime.Value)
                    {
                        _logger.LogWarning("End date time must be after start date time");
                        throw new BusinessRuleViolationException("End date time must be after start date time");
                    }
                }
                else if (request.EndDateTime.HasValue)
                {
                    if (request.EndDateTime.Value <= slot.StartDateTime)
                    {
                        _logger.LogWarning("End date time must be after start date time");
                        throw new BusinessRuleViolationException("End date time must be after start date time");
                    }
                }
                else if (request.StartDateTime.HasValue)
                {
                    if (slot.EndDateTime <= request.StartDateTime.Value)
                    {
                        _logger.LogWarning("End date time must be after start date time");
                        throw new BusinessRuleViolationException("End date time must be after start date time");
                    }
                }

                // Check for overlapping slots if date/time is being updated
                if (request.StartDateTime.HasValue || request.EndDateTime.HasValue)
                {
                    var newStartDateTime = request.StartDateTime ?? slot.StartDateTime;
                    var newEndDateTime = request.EndDateTime ?? slot.EndDateTime;

                    var overlappingSlots = await _context.Slots
                        .Where(s => s.ServiceId == slot.ServiceId &&
                                   s.Id != slotId &&
                                   s.StartDateTime < newEndDateTime &&
                                   s.EndDateTime > newStartDateTime)
                        .AnyAsync();

                    if (overlappingSlots)
                    {
                        _logger.LogWarning("Overlapping slot detected for service {ServiceId}", slot.ServiceId);
                        throw new BusinessRuleViolationException("Overlapping slot detected for this service");
                    }
                }

                // Update properties if provided
                if (request.StartDateTime.HasValue)
                {
                    slot.StartDateTime = request.StartDateTime.Value;
                }

                if (request.EndDateTime.HasValue)
                {
                    slot.EndDateTime = request.EndDateTime.Value;
                }

                if (request.MaxBookings.HasValue)
                {
                    if (request.MaxBookings.Value <= 0)
                    {
                        _logger.LogWarning("Max bookings must be greater than zero");
                        throw new BusinessRuleViolationException("Max bookings must be greater than zero");
                    }

                    // Adjust available bookings proportionally
                    var ratio = (double)request.MaxBookings.Value / slot.MaxBookings;
                    slot.AvailableBookings = Math.Max(0, (int)(slot.AvailableBookings * ratio));
                    slot.MaxBookings = request.MaxBookings.Value;
                }

                if (request.IsAvailable.HasValue)
                {
                    slot.IsAvailable = request.IsAvailable.Value;
                }

                if (request.IsRecurring.HasValue)
                {
                    slot.IsRecurring = request.IsRecurring.Value;
                }

                slot.UpdatedAt = DateTime.UtcNow;

                _context.Slots.Update(slot);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Slot {SlotId} updated successfully", slotId);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return slot;
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException || ex is BusinessRuleViolationException))
            {
                _logger.LogError(ex, "Error updating slot {SlotId}", slotId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Deletes a slot
        /// </summary>
        /// <param name="slotId">The ID of the slot to delete</param>
        /// <returns>True if the slot was deleted, false otherwise</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated (e.g., slot has bookings)</exception>
        public async Task<bool> DeleteSlotAsync(Guid slotId)
        {
            using var activity = ActivitySource.StartActivity("SlotService.DeleteSlotAsync");
            activity?.SetTag("slot.id", slotId);

            try
            {
                var slot = await _context.Slots
                    .Include(s => s.Bookings)
                    .FirstOrDefaultAsync(s => s.Id == slotId);

                if (slot == null)
                {
                    _logger.LogWarning("Slot {SlotId} not found", slotId);
                    throw new EntityNotFoundException($"Slot {slotId} not found");
                }

                // Check if slot has bookings
                if (slot.Bookings.Any())
                {
                    _logger.LogWarning("Cannot delete slot {SlotId} because it has existing bookings", slotId);
                    throw new BusinessRuleViolationException("Cannot delete slot because it has existing bookings");
                }

                _context.Slots.Remove(slot);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Slot {SlotId} deleted successfully", slotId);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return true;
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException || ex is BusinessRuleViolationException))
            {
                _logger.LogError(ex, "Error deleting slot {SlotId}", slotId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Checks if a slot is available for booking
        /// </summary>
        /// <param name="slotId">The ID of the slot to check</param>
        /// <returns>True if the slot is available, false otherwise</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        public async Task<bool> IsSlotAvailableAsync(Guid slotId)
        {
            using var activity = ActivitySource.StartActivity("SlotService.IsSlotAvailableAsync");
            activity?.SetTag("slot.id", slotId);

            try
            {
                var slot = await _context.Slots.FindAsync(slotId);
                if (slot == null)
                {
                    _logger.LogWarning("Slot {SlotId} not found", slotId);
                    throw new EntityNotFoundException($"Slot {slotId} not found");
                }

                var isAvailable = slot.IsAvailable && slot.AvailableBookings > 0 && slot.StartDateTime > DateTime.UtcNow;

                activity?.SetStatus(ActivityStatusCode.Ok);
                return isAvailable;
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException))
            {
                _logger.LogError(ex, "Error checking availability for slot {SlotId}", slotId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Retrieves available slots for a service within a date range
        /// </summary>
        /// <param name="serviceId">The ID of the service</param>
        /// <param name="startDate">The start date of the range</param>
        /// <param name="endDate">The end date of the range</param>
        /// <returns>A collection of available slots</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the service with the specified ID is not found</exception>
        public async Task<IEnumerable<Slot>> GetAvailableSlotsAsync(Guid serviceId, DateTime startDate, DateTime endDate)
        {
            using var activity = ActivitySource.StartActivity("SlotService.GetAvailableSlotsAsync");
            activity?.SetTag("service.id", serviceId);
            activity?.SetTag("date.startDate", startDate);
            activity?.SetTag("date.endDate", endDate);

            try
            {
                // Check if service exists
                var service = await _context.Services.FindAsync(serviceId);
                if (service == null)
                {
                    _logger.LogWarning("Service {ServiceId} not found", serviceId);
                    throw new EntityNotFoundException($"Service {serviceId} not found");
                }

                var slots = await _context.Slots
                    .Where(s => s.ServiceId == serviceId &&
                               s.StartDateTime >= startDate &&
                               s.EndDateTime <= endDate &&
                               s.IsAvailable &&
                               s.AvailableBookings > 0 &&
                               s.StartDateTime > DateTime.UtcNow)
                    .Include(s => s.Service)
                    .ToListAsync();

                activity?.SetStatus(ActivityStatusCode.Ok);
                return slots;
            }
            catch (Exception ex) when (!(ex is EntityNotFoundException))
            {
                _logger.LogError(ex, "Error retrieving available slots for service {ServiceId}", serviceId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        /// <summary>
        /// Updates the availability of a slot based on booking count
        /// </summary>
        /// <param name="slotId">The ID of the slot to update</param>
        /// <param name="bookingCount">The number of bookings to adjust availability by (positive to decrease, negative to increase)</param>
        /// <returns>The updated slot</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated (e.g., insufficient availability)</exception>
        public async Task<Slot> UpdateSlotAvailabilityAsync(Guid slotId, int bookingCount)
        {
            using var activity = ActivitySource.StartActivity("SlotService.UpdateSlotAvailabilityAsync");
            activity?.SetTag("slot.id", slotId);
            activity?.SetTag("booking.count", bookingCount);

            try
            {
                // Use a transaction for concurrency safety
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Lock the slot row for update to prevent concurrency issues
                    var slot = await _context.Slots
                        .FromSqlRaw("SELECT * FROM Slots WITH (UPDLOCK, ROWLOCK) WHERE Id = {0}", slotId)
                        .FirstOrDefaultAsync();

                    if (slot == null)
                    {
                        _logger.LogWarning("Slot {SlotId} not found", slotId);
                        throw new EntityNotFoundException($"Slot {slotId} not found");
                    }

                    // Check if we're trying to decrease availability beyond what's available
                    if (bookingCount > 0 && slot.AvailableBookings < bookingCount)
                    {
                        _logger.LogWarning("Insufficient availability for slot {SlotId}. Requested: {Requested}, Available: {Available}", 
                            slotId, bookingCount, slot.AvailableBookings);
                        throw new BusinessRuleViolationException("Insufficient slot availability");
                    }

                    // Update availability
                    slot.AvailableBookings -= bookingCount;
                    
                    // Update availability flag if needed
                    if (slot.AvailableBookings <= 0)
                    {
                        slot.IsAvailable = false;
                    }
                    else if (!slot.IsAvailable && slot.AvailableBookings > 0)
                    {
                        // If slot was previously unavailable but now has availability, make it available
                        slot.IsAvailable = true;
                    }

                    slot.UpdatedAt = DateTime.UtcNow;

                    _context.Slots.Update(slot);
                    await _context.SaveChangesAsync();

                    // Commit transaction
                    await transaction.CommitAsync();

                    _logger.LogInformation("Slot {SlotId} availability updated successfully. Booking count adjusted by {BookingCount}", 
                        slotId, bookingCount);
                    activity?.SetStatus(ActivityStatusCode.Ok);
                    return slot;
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
                _logger.LogError(ex, "Error updating slot {SlotId} availability", slotId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }
    }

    /// <summary>
    /// Extension methods for logging trace IDs
    /// </summary>
    public static class LoggingExtensions
    {
        /// <summary>
        /// Adds trace ID to log context
        /// </summary>
        public static void AddTraceIdToLogContext()
        {
            // Implementation would depend on your tracing setup
            // This is a placeholder implementation
        }
    }
}