using Shared.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingService.Services
{
    /// <summary>
    /// Interface for slot service operations
    /// </summary>
    public interface ISlotService
    {
        /// <summary>
        /// Creates a new slot
        /// </summary>
        /// <param name="request">The slot creation request</param>
        /// <returns>The created slot</returns>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        /// <exception cref="EntityNotFoundException">Thrown when referenced entities are not found</exception>
        Task<Slot> CreateSlotAsync(CreateSlotRequest request);

        /// <summary>
        /// Retrieves a slot by its ID
        /// </summary>
        /// <param name="slotId">The ID of the slot to retrieve</param>
        /// <returns>The slot with the specified ID</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        Task<Slot> GetSlotByIdAsync(Guid slotId);

        /// <summary>
        /// Updates an existing slot
        /// </summary>
        /// <param name="slotId">The ID of the slot to update</param>
        /// <param name="request">The slot update request</param>
        /// <returns>The updated slot</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        Task<Slot> UpdateSlotAsync(Guid slotId, UpdateSlotRequest request);

        /// <summary>
        /// Deletes a slot
        /// </summary>
        /// <param name="slotId">The ID of the slot to delete</param>
        /// <returns>True if the slot was deleted, false otherwise</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated (e.g., slot has bookings)</exception>
        Task<bool> DeleteSlotAsync(Guid slotId);

        /// <summary>
        /// Checks if a slot is available for booking
        /// </summary>
        /// <param name="slotId">The ID of the slot to check</param>
        /// <returns>True if the slot is available, false otherwise</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        Task<bool> IsSlotAvailableAsync(Guid slotId);

        /// <summary>
        /// Retrieves available slots for a service within a date range
        /// </summary>
        /// <param name="serviceId">The ID of the service</param>
        /// <param name="startDate">The start date of the range</param>
        /// <param name="endDate">The end date of the range</param>
        /// <returns>A collection of available slots</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the service with the specified ID is not found</exception>
        Task<IEnumerable<Slot>> GetAvailableSlotsAsync(Guid serviceId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Updates the availability of a slot based on booking count
        /// </summary>
        /// <param name="slotId">The ID of the slot to update</param>
        /// <param name="bookingCount">The number of bookings to adjust availability by (positive to decrease, negative to increase)</param>
        /// <returns>The updated slot</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the slot with the specified ID is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated (e.g., insufficient availability)</exception>
        Task<Slot> UpdateSlotAvailabilityAsync(Guid slotId, int bookingCount);
    }

    // Request models would typically be in separate files, but including them here for completeness

    /// <summary>
    /// Request model for creating a slot
    /// </summary>
    public class CreateSlotRequest
    {
        /// <summary>
        /// The ID of the service for which the slot is created
        /// </summary>
        public Guid ServiceId { get; set; }

        /// <summary>
        /// The start date and time of the slot
        /// </summary>
        public DateTime StartDateTime { get; set; }

        /// <summary>
        /// The end date and time of the slot
        /// </summary>
        public DateTime EndDateTime { get; set; }

        /// <summary>
        /// The maximum number of bookings allowed for this slot
        /// </summary>
        public int MaxBookings { get; set; } = 1;

        /// <summary>
        /// Indicates if the slot is available
        /// </summary>
        public bool IsAvailable { get; set; } = true;

        /// <summary>
        /// Indicates if the slot is recurring
        /// </summary>
        public bool IsRecurring { get; set; } = false;

        /// <summary>
        /// The ID of the tenant
        /// </summary>
        public Guid TenantId { get; set; }
    }

    /// <summary>
    /// Request model for updating a slot
    /// </summary>
    public class UpdateSlotRequest
    {
        /// <summary>
        /// The updated start date and time of the slot
        /// </summary>
        public DateTime? StartDateTime { get; set; }

        /// <summary>
        /// The updated end date and time of the slot
        /// </summary>
        public DateTime? EndDateTime { get; set; }

        /// <summary>
        /// The updated maximum number of bookings allowed for this slot
        /// </summary>
        public int? MaxBookings { get; set; }

        /// <summary>
        /// Indicates if the slot is available
        /// </summary>
        public bool? IsAvailable { get; set; }

        /// <summary>
        /// Indicates if the slot is recurring
        /// </summary>
        public bool? IsRecurring { get; set; }
    }

}