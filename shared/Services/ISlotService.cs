using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.Models;
using Shared.DTOs;

namespace Shared.Services
{
    public interface ISlotService
    {
        /// <summary>
        /// Creates a new slot
        /// </summary>
        /// <param name="request">Slot creation request</param>
        /// <param name="userId">ID of the user creating the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Created slot</returns>
        Task<Slot> CreateSlotAsync(CreateSlotRequest request, Guid userId, Guid tenantId);

        /// <summary>
        /// Gets a slot by ID
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="userId">ID of the user requesting the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Slot details</returns>
        Task<Slot> GetSlotByIdAsync(Guid slotId, Guid userId, Guid tenantId);

        /// <summary>
        /// Updates an existing slot
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="request">Slot update request</param>
        /// <param name="userId">ID of the user updating the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Updated slot</returns>
        Task<Slot> UpdateSlotAsync(Guid slotId, UpdateSlotRequest request, Guid userId, Guid tenantId);

        /// <summary>
        /// Deletes a slot
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="userId">ID of the user deleting the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if successful</returns>
        Task<bool> DeleteSlotAsync(Guid slotId, Guid userId, Guid tenantId);

        /// <summary>
        /// Gets all slots with optional filtering
        /// </summary>
        /// <param name="userId">ID of the user requesting slots</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <param name="serviceId">Optional service filter</param>
        /// <param name="startDate">Optional start date filter</param>
        /// <param name="endDate">Optional end date filter</param>
        /// <param name="isAvailable">Optional availability filter</param>
        /// <returns>List of slots</returns>
        Task<IEnumerable<Slot>> GetSlotsAsync(Guid userId, Guid tenantId, Guid? serviceId = null, DateTime? startDate = null, DateTime? endDate = null, bool? isAvailable = null);

        /// <summary>
        /// Creates recurring slots based on a pattern
        /// </summary>
        /// <param name="request">Recurring slot creation request</param>
        /// <param name="userId">ID of the user creating the slots</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>List of created slots</returns>
        Task<IEnumerable<Slot>> CreateRecurringSlotsAsync(CreateRecurringSlotsRequest request, Guid userId, Guid tenantId);

        /// <summary>
        /// Checks if a slot is available for booking
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if available, false otherwise</returns>
        Task<bool> CheckSlotAvailabilityAsync(Guid slotId, Guid tenantId);

        /// <summary>
        /// Blocks a slot from being booked
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="userId">ID of the user blocking the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if successful</returns>
        Task<bool> BlockSlotAsync(Guid slotId, Guid userId, Guid tenantId);
    }
}