using Shared.DTOs;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ConfigurationService.Services
{
    public interface ISubscriptionService
    {
        Task<IEnumerable<PricingPlanDto>> GetPricingPlansAsync();
        Task<PricingPlanDto> GetPricingPlanByIdAsync(Guid id);
        Task<SubscriptionDto> GetSubscriptionByIdAsync(Guid id);
        Task<SubscriptionDto> GetSubscriptionByUserIdAsync(Guid userId);
        Task<SubscriptionDto> CreateSubscriptionAsync(CreateSubscriptionDto createSubscriptionDto);
        Task<SubscriptionDto> ChangeSubscriptionPlanAsync(Guid subscriptionId, UpdateSubscriptionDto updateSubscriptionDto);
        Task CancelSubscriptionAsync(Guid subscriptionId);
        Task<SubscriptionUsageDto> GetSubscriptionUsageAsync(Guid subscriptionId);
        Task UpdateSubscriptionUsageAsync(Guid subscriptionId, int usedAppointments, int usedUsers);
    }
}