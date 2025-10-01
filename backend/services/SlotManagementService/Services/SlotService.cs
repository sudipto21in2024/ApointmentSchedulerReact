using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shared.Data;
using Shared.Models;
using Shared.Events;
using Shared.DTOs;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Shared.Services;

namespace SlotManagementService.Services
{
    public class SlotService : Shared.Services.ISlotService, ISlotService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly Validators.ISlotValidator _validator;
        private readonly IPublishEndpoint _publishEndpoint;

        public SlotService(ApplicationDbContext dbContext, Validators.ISlotValidator validator, IPublishEndpoint publishEndpoint)
        {
            _dbContext = dbContext;
            _validator = validator;
            _publishEndpoint = publishEndpoint;
        }

        /// <summary>
        /// Creates a new slot
        /// </summary>
        /// <param name="request">Slot creation request</param>
        /// <param name="userId">ID of the user creating the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Created slot</returns>
        public async Task<Slot> CreateSlotAsync(CreateSlotRequest request, Guid userId, Guid tenantId)
        {
            // Validate the request
            var validationResult = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            // Check if user is a provider and owns the service
            var service = await _dbContext.Services
                .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantId);
            
            if (service == null)
            {
                throw new KeyNotFoundException("Service not found");
            }

            if (service.ProviderId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to create slots for this service");
            }

            // Create the slot
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
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.Slots.Add(slot);
            await _dbContext.SaveChangesAsync();

            // Publish SlotCreatedEvent
            var slotCreatedEvent = new SlotCreatedEvent
            {
                SlotId = slot.Id,
                ServiceId = slot.ServiceId,
                ProviderId = service.ProviderId,
                TenantId = slot.TenantId,
                StartDateTime = slot.StartDateTime,
                EndDateTime = slot.EndDateTime,
                MaxBookings = slot.MaxBookings,
                IsRecurring = slot.IsRecurring,
                CreatedAt = slot.CreatedAt
            };

            await _publishEndpoint.Publish(slotCreatedEvent);

            return slot;
        }

        /// <summary>
        /// Gets a slot by ID
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="userId">ID of the user requesting the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Slot details</returns>
        public async Task<Slot> GetSlotByIdAsync(Guid slotId, Guid userId, Guid tenantId)
        {
            var slot = await _dbContext.Slots
                .Include(s => s.Service)
                .ThenInclude(s => s.Provider)
                .FirstOrDefaultAsync(s => s.Id == slotId && s.TenantId == tenantId);

            if (slot == null)
            {
                throw new KeyNotFoundException("Slot not found");
            }

            // Check if user is authorized to access this slot
            // Providers can access their own slots, everyone can access available slots
            if (slot.Service.ProviderId != userId && !slot.IsAvailable)
            {
                throw new UnauthorizedAccessException("You are not authorized to access this slot");
            }

            return slot;
        }

        /// <summary>
        /// Updates an existing slot
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="request">Slot update request</param>
        /// <param name="userId">ID of the user updating the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Updated slot</returns>
        public async Task<Slot> UpdateSlotAsync(Guid slotId, UpdateSlotRequest request, Guid userId, Guid tenantId)
        {
            // Validate the request
            var validationResult = _validator.ValidateUpdateSlotRequest(request);
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            // Get the existing slot
            var slot = await _dbContext.Slots
                .Include(s => s.Service)
                .FirstOrDefaultAsync(s => s.Id == slotId && s.TenantId == tenantId);

            if (slot == null)
            {
                throw new KeyNotFoundException("Slot not found");
            }

            // Check if user is authorized to update this slot
            if (slot.Service.ProviderId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to update this slot");
            }

            // Update slot properties if provided
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
                // Update available bookings proportionally if max bookings changes
                if (request.MaxBookings.Value != slot.MaxBookings)
                {
                    var bookedCount = slot.MaxBookings - slot.AvailableBookings;
                    slot.AvailableBookings = Math.Max(0, request.MaxBookings.Value - bookedCount);
                }
                slot.MaxBookings = request.MaxBookings.Value;
            }

            if (request.IsAvailable.HasValue)
            {
                slot.IsAvailable = request.IsAvailable.Value;
            }

            slot.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            // Publish SlotUpdatedEvent
            var slotUpdatedEvent = new SlotUpdatedEvent
            {
                SlotId = slot.Id,
                ServiceId = slot.ServiceId,
                ProviderId = slot.Service.ProviderId,
                TenantId = slot.TenantId,
                StartDateTime = slot.StartDateTime,
                EndDateTime = slot.EndDateTime,
                MaxBookings = slot.MaxBookings,
                IsAvailable = slot.IsAvailable,
                UpdatedAt = slot.UpdatedAt
            };

            await _publishEndpoint.Publish(slotUpdatedEvent);

            return slot;
        }

        /// <summary>
        /// Deletes a slot
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="userId">ID of the user deleting the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if successful</returns>
        public async Task<bool> DeleteSlotAsync(Guid slotId, Guid userId, Guid tenantId)
        {
            var slot = await _dbContext.Slots
                .Include(s => s.Service)
                .FirstOrDefaultAsync(s => s.Id == slotId && s.TenantId == tenantId);

            if (slot == null)
            {
                throw new KeyNotFoundException("Slot not found");
            }

            // Check if user is authorized to delete this slot
            if (slot.Service.ProviderId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to delete this slot");
            }

            // Check if slot has existing bookings
            var hasBookings = await _dbContext.Bookings
                .AnyAsync(b => b.SlotId == slotId);

            if (hasBookings)
            {
                throw new InvalidOperationException("Cannot delete slot with existing bookings");
            }

            _dbContext.Slots.Remove(slot);
            await _dbContext.SaveChangesAsync();

            // Publish SlotDeletedEvent
            var slotDeletedEvent = new SlotDeletedEvent
            {
                SlotId = slot.Id,
                ServiceId = slot.ServiceId,
                ProviderId = slot.Service.ProviderId,
                TenantId = slot.TenantId,
                StartDateTime = slot.StartDateTime,
                EndDateTime = slot.EndDateTime,
                DeletedAt = DateTime.UtcNow
            };

            await _publishEndpoint.Publish(slotDeletedEvent);

            return true;
        }

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
        public async Task<IEnumerable<Slot>> GetSlotsAsync(Guid userId, Guid tenantId, Guid? serviceId = null, DateTime? startDate = null, DateTime? endDate = null, bool? isAvailable = null)
        {
            var query = _dbContext.Slots
                .Include(s => s.Service)
                .ThenInclude(s => s.Provider)
                .AsQueryable();

            // Apply tenant filter
            query = query.Where(s => s.TenantId == tenantId);

            // Apply service filter if provided
            if (serviceId.HasValue)
            {
                query = query.Where(s => s.ServiceId == serviceId.Value);
            }

            // Apply date range filter if provided
            if (startDate.HasValue)
            {
                query = query.Where(s => s.StartDateTime >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(s => s.EndDateTime <= endDate.Value);
            }

            // Apply availability filter if provided
            if (isAvailable.HasValue)
            {
                query = query.Where(s => s.IsAvailable == isAvailable.Value);
            }

            // If user is not a provider, only show available slots
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            if (user == null || user.UserType != UserRole.Provider)
            {
                query = query.Where(s => s.IsAvailable);
            }

            return await query.ToListAsync();
        }

        /// <summary>
        /// Creates recurring slots based on a pattern
        /// </summary>
        /// <param name="request">Recurring slot creation request</param>
        /// <param name="userId">ID of the user creating the slots</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>List of created slots</returns>
        public async Task<IEnumerable<Slot>> CreateRecurringSlotsAsync(CreateRecurringSlotsRequest request, Guid userId, Guid tenantId)
        {
            // Validate the request
            var validationResult = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);
            if (!validationResult.IsValid)
            {
                throw new ArgumentException(string.Join("; ", validationResult.Errors));
            }

            // Check if user is a provider and owns the service
            var service = await _dbContext.Services
                .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantId);
            
            if (service == null)
            {
                throw new KeyNotFoundException("Service not found");
            }

            if (service.ProviderId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to create slots for this service");
            }

            var slots = new List<Slot>();
            var currentDate = request.StartDateTime;
            var endDate = request.EndDate ?? currentDate.AddDays(365); // Default to 1 year if no end date
            var occurrences = 0;

            while (currentDate <= endDate && occurrences < request.Occurrences)
            {
                // Calculate end time for this occurrence
                var endTime = currentDate.Add(request.EndDateTime - request.StartDateTime);

                // Check for conflicts before creating slot
                var hasConflicts = await _dbContext.Slots
                    .AnyAsync(s => s.ServiceId == request.ServiceId &&
                                  s.TenantId == tenantId &&
                                  ((currentDate >= s.StartDateTime && currentDate < s.EndDateTime) ||
                                   (endTime > s.StartDateTime && endTime <= s.EndDateTime) ||
                                   (currentDate <= s.StartDateTime && endTime >= s.EndDateTime)));
                
                if (!hasConflicts)
                {
                    // Create the slot
                    var slot = new Slot
                    {
                        Id = Guid.NewGuid(),
                        ServiceId = request.ServiceId,
                        StartDateTime = currentDate,
                        EndDateTime = endTime,
                        MaxBookings = request.MaxBookings,
                        AvailableBookings = request.MaxBookings,
                        IsAvailable = true,
                        IsRecurring = true,
                        TenantId = tenantId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    slots.Add(slot);
                }

                // Move to next occurrence based on pattern
                switch (request.Pattern)
                {
                    case RecurrencePattern.Daily:
                        currentDate = currentDate.AddDays(request.Interval);
                        break;
                    case RecurrencePattern.Weekly:
                        currentDate = currentDate.AddDays(7 * request.Interval);
                        break;
                    case RecurrencePattern.Monthly:
                        currentDate = currentDate.AddMonths(request.Interval);
                        break;
                }

                occurrences++;
            }

            if (slots.Count > 0)
            {
                _dbContext.Slots.AddRange(slots);
                await _dbContext.SaveChangesAsync();

                // Publish events for each created slot
                foreach (var slot in slots)
                {
                    var slotCreatedEvent = new SlotCreatedEvent
                    {
                        SlotId = slot.Id,
                        ServiceId = slot.ServiceId,
                        ProviderId = service.ProviderId,
                        TenantId = slot.TenantId,
                        StartDateTime = slot.StartDateTime,
                        EndDateTime = slot.EndDateTime,
                        MaxBookings = slot.MaxBookings,
                        IsRecurring = slot.IsRecurring,
                        CreatedAt = slot.CreatedAt
                    };

                    await _publishEndpoint.Publish(slotCreatedEvent);
                }
            }

            return slots;
        }

        /// <summary>
        /// Checks if a slot is available for booking
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if available, false otherwise</returns>
        public async Task<bool> CheckSlotAvailabilityAsync(Guid slotId, Guid tenantId)
        {
            var slot = await _dbContext.Slots
                .FirstOrDefaultAsync(s => s.Id == slotId && s.TenantId == tenantId);

            if (slot == null)
            {
                throw new KeyNotFoundException("Slot not found");
            }

            return slot.IsAvailable && slot.AvailableBookings > 0;
        }

        /// <summary>
        /// Blocks a slot from being booked
        /// </summary>
        /// <param name="slotId">Slot ID</param>
        /// <param name="userId">ID of the user blocking the slot</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>True if successful</returns>
        public async Task<bool> BlockSlotAsync(Guid slotId, Guid userId, Guid tenantId)
        {
            var slot = await _dbContext.Slots
                .Include(s => s.Service)
                .FirstOrDefaultAsync(s => s.Id == slotId && s.TenantId == tenantId);

            if (slot == null)
            {
                throw new KeyNotFoundException("Slot not found");
            }

            // Check if user is authorized to block this slot
            if (slot.Service.ProviderId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to block this slot");
            }

            slot.IsAvailable = false;
            slot.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            // Publish SlotUpdatedEvent
            var slotUpdatedEvent = new SlotUpdatedEvent
            {
                SlotId = slot.Id,
                ServiceId = slot.ServiceId,
                ProviderId = slot.Service.ProviderId,
                TenantId = slot.TenantId,
                StartDateTime = slot.StartDateTime,
                EndDateTime = slot.EndDateTime,
                MaxBookings = slot.MaxBookings,
                IsAvailable = slot.IsAvailable,
                UpdatedAt = slot.UpdatedAt
            };

            await _publishEndpoint.Publish(slotUpdatedEvent);

            return true;
        }
    }
}