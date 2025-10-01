using Shared.DTOs;
using System;
using System.Threading.Tasks;

namespace ConfigurationService.Validators
{
    public class SubscriptionValidator : ISubscriptionValidator
    {
        public async Task ValidateCreateSubscriptionAsync(CreateSubscriptionDto dto)
        {
            if (dto.UserId == Guid.Empty)
            {
                throw new ArgumentException("User ID cannot be empty.", nameof(dto.UserId));
            }
            if (dto.PricingPlanId == Guid.Empty)
            {
                throw new ArgumentException("Pricing Plan ID cannot be empty.", nameof(dto.PricingPlanId));
            }
            // Additional validation logic can be added here, e.g., checking if UserId and PricingPlanId exist in the database.
            await Task.CompletedTask;
        }

        public async Task ValidateUpdateSubscriptionAsync(UpdateSubscriptionDto dto)
        {
            if (dto.PricingPlanId == Guid.Empty)
            {
                throw new ArgumentException("Pricing Plan ID cannot be empty.", nameof(dto.PricingPlanId));
            }
            // Additional validation logic can be added here.
            await Task.CompletedTask;
        }
    }
}