using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.Data;
using Shared.Models;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs;

namespace Shared.Validators
{
    public class SlotValidator : ISlotValidator
    {
        private readonly ApplicationDbContext _dbContext;

        public SlotValidator(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Validates a slot creation request
        /// </summary>
        /// <param name="request">Slot creation request</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Validation result</returns>
        public async Task<ValidationResult> ValidateCreateSlotRequestAsync(CreateSlotRequest request, Guid tenantId)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate required fields
            if (request.ServiceId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Service ID is required");
            }

            if (request.StartDateTime == DateTime.MinValue)
            {
                result.IsValid = false;
                result.Errors.Add("Start date/time is required");
            }

            if (request.EndDateTime == DateTime.MinValue)
            {
                result.IsValid = false;
                result.Errors.Add("End date/time is required");
            }

            // Validate that start time is before end time
            if (request.StartDateTime >= request.EndDateTime)
            {
                result.IsValid = false;
                result.Errors.Add("Start date/time must be before end date/time");
            }

            // Validate max bookings
            if (request.MaxBookings <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Max bookings must be greater than 0");
            }

            // Validate service exists and belongs to tenant
            if (request.ServiceId != Guid.Empty)
            {
                var service = await _dbContext.Services
                    .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantId);
                
                if (service == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid service ID");
                }
            }

            // Check for slot conflicts
            if (request.ServiceId != Guid.Empty && request.StartDateTime != DateTime.MinValue && request.EndDateTime != DateTime.MinValue)
            {
                var hasConflicts = await _dbContext.Slots
                    .AnyAsync(s => s.ServiceId == request.ServiceId && 
                                  s.TenantId == tenantId &&
                                  ((request.StartDateTime >= s.StartDateTime && request.StartDateTime < s.EndDateTime) ||
                                   (request.EndDateTime > s.StartDateTime && request.EndDateTime <= s.EndDateTime) ||
                                   (request.StartDateTime <= s.StartDateTime && request.EndDateTime >= s.EndDateTime)));
                
                if (hasConflicts)
                {
                    result.IsValid = false;
                    result.Errors.Add("Slot conflicts with existing slot for this service");
                }
            }

            return result;
        }

        /// <summary>
        /// Validates a slot update request
        /// </summary>
        /// <param name="request">Slot update request</param>
        /// <returns>Validation result</returns>
        public ValidationResult ValidateUpdateSlotRequest(UpdateSlotRequest request)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate fields if provided
            if (request.StartDateTime.HasValue && request.StartDateTime.Value == DateTime.MinValue)
            {
                result.IsValid = false;
                result.Errors.Add("Invalid start date/time");
            }

            if (request.EndDateTime.HasValue && request.EndDateTime.Value == DateTime.MinValue)
            {
                result.IsValid = false;
                result.Errors.Add("Invalid end date/time");
            }

            // Validate that start time is before end time if both are provided
            if (request.StartDateTime.HasValue && request.EndDateTime.HasValue)
            {
                if (request.StartDateTime.Value >= request.EndDateTime.Value)
                {
                    result.IsValid = false;
                    result.Errors.Add("Start date/time must be before end date/time");
                }
            }

            // Validate max bookings if provided
            if (request.MaxBookings.HasValue && request.MaxBookings.Value <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Max bookings must be greater than 0");
            }

            // Validate availability if provided
            if (request.IsAvailable.HasValue && !request.IsAvailable.Value)
            {
                // No specific validation needed for setting slot as unavailable
            }

            return result;
        }

        /// <summary>
        /// Validates a recurring slot creation request
        /// </summary>
        /// <param name="request">Recurring slot creation request</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Validation result</returns>
        public async Task<ValidationResult> ValidateRecurringSlotRequestAsync(CreateRecurringSlotsRequest request, Guid tenantId)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate required fields
            if (request.ServiceId == Guid.Empty)
            {
                result.IsValid = false;
                result.Errors.Add("Service ID is required");
            }

            if (request.StartDateTime == DateTime.MinValue)
            {
                result.IsValid = false;
                result.Errors.Add("Start date/time is required");
            }

            if (request.EndDateTime == DateTime.MinValue)
            {
                result.IsValid = false;
                result.Errors.Add("End date/time is required");
            }

            // Validate that start time is before end time
            if (request.StartDateTime >= request.EndDateTime)
            {
                result.IsValid = false;
                result.Errors.Add("Start date/time must be before end date/time");
            }

            // Validate max bookings
            if (request.MaxBookings <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Max bookings must be greater than 0");
            }

            // Validate interval
            if (request.Interval <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Interval must be greater than 0");
            }

            // Validate occurrences
            if (request.Occurrences <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Occurrences must be greater than 0");
            }

            // Validate service exists and belongs to tenant
            if (request.ServiceId != Guid.Empty)
            {
                var service = await _dbContext.Services
                    .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantId);
                
                if (service == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("Invalid service ID");
                }
            }

            // Validate end date if provided
            if (request.EndDate.HasValue && request.EndDate.Value < request.StartDateTime)
            {
                result.IsValid = false;
                result.Errors.Add("End date must be after start date");
            }

            return result;
        }
    }
}