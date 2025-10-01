using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.DTOs;

namespace Shared.Validators
{
    public interface ISlotValidator
    {
        /// <summary>
        /// Validates a slot creation request
        /// </summary>
        /// <param name="request">Slot creation request</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Validation result</returns>
        Task<ValidationResult> ValidateCreateSlotRequestAsync(CreateSlotRequest request, Guid tenantId);

        /// <summary>
        /// Validates a slot update request
        /// </summary>
        /// <param name="request">Slot update request</param>
        /// <returns>Validation result</returns>
        ValidationResult ValidateUpdateSlotRequest(UpdateSlotRequest request);

        /// <summary>
        /// Validates a recurring slot creation request
        /// </summary>
        /// <param name="request">Recurring slot creation request</param>
        /// <param name="tenantId">ID of the tenant</param>
        /// <returns>Validation result</returns>
        Task<ValidationResult> ValidateRecurringSlotRequestAsync(CreateRecurringSlotsRequest request, Guid tenantId);
    }
}