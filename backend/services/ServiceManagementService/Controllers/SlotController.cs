using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Shared.Events;
using Shared.Models;
using Shared.DTOs;
using MassTransit;
using Microsoft.Extensions.Logging;
using System.Linq;
using ServiceManagementService.Services;
using ServiceManagementService.Validators;

namespace ServiceManagementService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SlotController : ControllerBase
    {
        private readonly ILogger<SlotController> _logger;
        private readonly ISlotService _slotService;
        private readonly ISlotValidator _validator;

        public SlotController(
            ILogger<SlotController> logger, 
            ISlotService slotService,
            ISlotValidator validator)
        {
            _logger = logger;
            _slotService = slotService;
            _validator = validator;
        }

        /// <summary>
        /// Creates a new slot
        /// </summary>
        /// <param name="request">Slot creation request</param>
        /// <returns>Created slot</returns>
        [HttpPost]
        public async Task<IActionResult> CreateSlot([FromBody] CreateSlotRequest request)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var slot = await _slotService.CreateSlotAsync(request, userId, tenantId);
                
                _logger.LogInformation($"Slot created with ID: {slot.Id}");
                
                return Ok(new { SlotId = slot.Id, Message = "Slot created successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Service not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating slot");
                return StatusCode(500, new { Message = "An error occurred while creating the slot" });
            }
        }

        /// <summary>
        /// Gets a slot by ID
        /// </summary>
        /// <param name="id">Slot ID</param>
        /// <returns>Slot details</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSlot(Guid id)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var slot = await _slotService.GetSlotByIdAsync(id, userId, tenantId);
                
                return Ok(slot);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Slot not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving slot");
                return StatusCode(500, new { Message = "An error occurred while retrieving the slot" });
            }
        }

        /// <summary>
        /// Updates an existing slot
        /// </summary>
        /// <param name="id">Slot ID</param>
        /// <param name="request">Slot update request</param>
        /// <returns>Updated slot</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlot(Guid id, [FromBody] UpdateSlotRequest request)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var slot = await _slotService.UpdateSlotAsync(id, request, userId, tenantId);
                
                _logger.LogInformation($"Slot updated with ID: {slot.Id}");
                
                return Ok(new { SlotId = slot.Id, Message = "Slot updated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Slot not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating slot");
                return StatusCode(500, new { Message = "An error occurred while updating the slot" });
            }
        }

        /// <summary>
        /// Deletes a slot
        /// </summary>
        /// <param name="id">Slot ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlot(Guid id)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                await _slotService.DeleteSlotAsync(id, userId, tenantId);
                
                _logger.LogInformation($"Slot deleted with ID: {id}");
                
                return Ok(new { SlotId = id, Message = "Slot deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Slot not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting slot");
                return StatusCode(500, new { Message = "An error occurred while deleting the slot" });
            }
        }

        /// <summary>
        /// Lists slots with optional filtering
        /// </summary>
        /// <param name="serviceId">Optional service filter</param>
        /// <param name="startDate">Optional start date filter</param>
        /// <param name="endDate">Optional end date filter</param>
        /// <param name="isAvailable">Optional availability filter</param>
        /// <returns>List of slots</returns>
        [HttpGet]
        public async Task<IActionResult> GetSlots(
            [FromQuery] Guid? serviceId, 
            [FromQuery] DateTime? startDate, 
            [FromQuery] DateTime? endDate, 
            [FromQuery] bool? isAvailable)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var slots = await _slotService.GetSlotsAsync(userId, tenantId, serviceId, startDate, endDate, isAvailable);
                
                return Ok(slots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving slots");
                return StatusCode(500, new { Message = "An error occurred while retrieving slots" });
            }
        }

        /// <summary>
        /// Creates recurring slots
        /// </summary>
        /// <param name="request">Recurring slot creation request</param>
        /// <returns>List of created slots</returns>
        [HttpPost("recurring")]
        public async Task<IActionResult> CreateRecurringSlots([FromBody] CreateRecurringSlotsRequest request)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                var slots = await _slotService.CreateRecurringSlotsAsync(request, userId, tenantId);
                
                var slotList = slots.ToList();
                _logger.LogInformation($"Created {slotList.Count} recurring slots");
                
                return Ok(new { Count = slotList.Count, Message = "Recurring slots created successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Service not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating recurring slots");
                return StatusCode(500, new { Message = "An error occurred while creating recurring slots" });
            }
        }

        /// <summary>
        /// Checks if a slot is available for booking
        /// </summary>
        /// <param name="id">Slot ID</param>
        /// <returns>Availability status</returns>
        [HttpGet("{id}/availability")]
        public async Task<IActionResult> CheckSlotAvailability(Guid id)
        {
            try
            {
                // Get tenant ID from claims (simplified for this example)
                var tenantId = GetTenantIdFromClaims();

                var isAvailable = await _slotService.CheckSlotAvailabilityAsync(id, tenantId);
                
                return Ok(new { SlotId = id, IsAvailable = isAvailable });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Slot not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking slot availability");
                return StatusCode(500, new { Message = "An error occurred while checking slot availability" });
            }
        }

        /// <summary>
        /// Blocks a slot from being booked
        /// </summary>
        /// <param name="id">Slot ID</param>
        /// <returns>Success message</returns>
        [HttpPost("{id}/block")]
        public async Task<IActionResult> BlockSlot(Guid id)
        {
            try
            {
                // Get user and tenant IDs from claims (simplified for this example)
                var userId = GetUserIdFromClaims();
                var tenantId = GetTenantIdFromClaims();

                await _slotService.BlockSlotAsync(id, userId, tenantId);
                
                _logger.LogInformation($"Slot blocked with ID: {id}");
                
                return Ok(new { SlotId = id, Message = "Slot blocked successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Slot not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking slot");
                return StatusCode(500, new { Message = "An error occurred while blocking the slot" });
            }
        }

        #region Helper Methods

        /// <summary>
        /// Gets user ID from claims (simplified for this example)
        /// </summary>
        /// <returns>User ID</returns>
        private Guid GetUserIdFromClaims()
        {
            // In a real implementation, this would extract the user ID from the JWT claims
            // For this example, we'll return a dummy GUID
            return Guid.NewGuid();
        }

        /// <summary>
        /// Gets tenant ID from claims (simplified for this example)
        /// </summary>
        /// <returns>Tenant ID</returns>
        private Guid GetTenantIdFromClaims()
        {
            // In a real implementation, this would extract the tenant ID from the JWT claims
            // For this example, we'll return a dummy GUID
            return Guid.NewGuid();
        }

        #endregion
    }

}