using Shared.DTOs;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConfigurationService.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        // Placeholder for database context or repository
        // In a real application, this would interact with Entity Framework Core or a similar ORM
        private readonly List<PricingPlan> _pricingPlans;
        private readonly List<Subscription> _subscriptions;

        public SubscriptionService()
        {
            // Seed some dummy data for demonstration
            _pricingPlans = new List<PricingPlan>
            {
                new PricingPlan { Id = Guid.NewGuid(), Name = "Basic", Description = "Basic Plan", Price = 10.00m, Currency = "USD", Interval = "monthly", Features = new List<string> { "Feature A" }, MaxUsers = 1, MaxAppointments = 10, Status = PricingPlanStatus.Active, CreatedDate = DateTime.UtcNow },
                new PricingPlan { Id = Guid.NewGuid(), Name = "Pro", Description = "Pro Plan", Price = 25.00m, Currency = "USD", Interval = "monthly", Features = new List<string> { "Feature A", "Feature B" }, MaxUsers = 5, MaxAppointments = 50, Status = PricingPlanStatus.Active, CreatedDate = DateTime.UtcNow },
                new PricingPlan { Id = Guid.NewGuid(), Name = "Enterprise", Description = "Enterprise Plan", Price = 100.00m, Currency = "USD", Interval = "annually", Features = new List<string> { "Feature A", "Feature B", "Feature C" }, MaxUsers = 100, MaxAppointments = 1000, Status = PricingPlanStatus.Active, CreatedDate = DateTime.UtcNow }
            };

            _subscriptions = new List<Subscription>();
        }

        public async Task<IEnumerable<PricingPlanDto>> GetPricingPlansAsync()
        {
            return await Task.FromResult(_pricingPlans.Select(p => new PricingPlanDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Currency = p.Currency,
                Interval = p.Interval,
                Features = p.Features,
                MaxUsers = p.MaxUsers,
                MaxAppointments = p.MaxAppointments,
                Status = p.Status,
                CreatedDate = p.CreatedDate,
                UpdatedDate = p.UpdatedDate
            }));
        }

        public async Task<PricingPlanDto> GetPricingPlanByIdAsync(Guid id)
        {
            var plan = _pricingPlans.FirstOrDefault(p => p.Id == id);
            if (plan == null) return null!;

            return await Task.FromResult(new PricingPlanDto
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.Description,
                Price = plan.Price,
                Currency = plan.Currency,
                Interval = plan.Interval,
                Features = plan.Features,
                MaxUsers = plan.MaxUsers,
                MaxAppointments = plan.MaxAppointments,
                Status = plan.Status,
                CreatedDate = plan.CreatedDate,
                UpdatedDate = plan.UpdatedDate
            });
        }

        public async Task<SubscriptionDto> GetSubscriptionByIdAsync(Guid id)
        {
            var subscription = _subscriptions.FirstOrDefault(s => s.Id == id);
            if (subscription == null) return null!;

            var pricingPlanDto = await GetPricingPlanByIdAsync(subscription.PricingPlanId);

            return await Task.FromResult(new SubscriptionDto
            {
                Id = subscription.Id,
                UserId = subscription.UserId,
                PricingPlan = pricingPlanDto,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                Status = subscription.Status
            });
        }

        public async Task<SubscriptionDto> GetSubscriptionByUserIdAsync(Guid userId)
        {
            var subscription = _subscriptions.FirstOrDefault(s => s.UserId == userId);
            if (subscription == null) return null!;

            var pricingPlanDto = await GetPricingPlanByIdAsync(subscription.PricingPlanId);

            return await Task.FromResult(new SubscriptionDto
            {
                Id = subscription.Id,
                UserId = subscription.UserId,
                PricingPlan = pricingPlanDto,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                Status = subscription.Status
            });
        }

        public async Task<SubscriptionDto> CreateSubscriptionAsync(CreateSubscriptionDto createSubscriptionDto)
        {
            var pricingPlan = _pricingPlans.FirstOrDefault(p => p.Id == createSubscriptionDto.PricingPlanId);
            if (pricingPlan == null)
            {
                throw new ArgumentException("Invalid Pricing Plan ID.");
            }

            // In a real scenario, integrate with a payment gateway here.
            // For now, assume payment is successful.

            var newSubscription = new Subscription
            {
                Id = Guid.NewGuid(),
                UserId = createSubscriptionDto.UserId,
                PricingPlanId = createSubscriptionDto.PricingPlanId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1), // Example: 1 month subscription
                Status = "active",
                CreatedDate = DateTime.UtcNow
            };
            _subscriptions.Add(newSubscription);

            var pricingPlanDto = await GetPricingPlanByIdAsync(newSubscription.PricingPlanId);

            return await Task.FromResult(new SubscriptionDto
            {
                Id = newSubscription.Id,
                UserId = newSubscription.UserId,
                PricingPlan = pricingPlanDto,
                StartDate = newSubscription.StartDate,
                EndDate = newSubscription.EndDate,
                Status = newSubscription.Status
            });
        }

        public async Task<SubscriptionDto> ChangeSubscriptionPlanAsync(Guid subscriptionId, UpdateSubscriptionDto updateSubscriptionDto)
        {
            var subscription = _subscriptions.FirstOrDefault(s => s.Id == subscriptionId);
            if (subscription == null)
            {
                throw new ArgumentException("Subscription not found.");
            }

            var newPricingPlan = _pricingPlans.FirstOrDefault(p => p.Id == updateSubscriptionDto.PricingPlanId);
            if (newPricingPlan == null)
            {
                throw new ArgumentException("Invalid New Pricing Plan ID.");
            }

            // Handle prorated adjustments and payment changes in a real system
            subscription.PricingPlanId = newPricingPlan.Id;
            subscription.UpdatedDate = DateTime.UtcNow;

            var pricingPlanDto = await GetPricingPlanByIdAsync(subscription.PricingPlanId);

            return await Task.FromResult(new SubscriptionDto
            {
                Id = subscription.Id,
                UserId = subscription.UserId,
                PricingPlan = pricingPlanDto,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                Status = subscription.Status
            });
        }

        public async Task CancelSubscriptionAsync(Guid subscriptionId)
        {
            var subscription = _subscriptions.FirstOrDefault(s => s.Id == subscriptionId);
            if (subscription == null)
            {
                throw new ArgumentException("Subscription not found.");
            }

            subscription.Status = "cancelled";
            subscription.UpdatedDate = DateTime.UtcNow;
            await Task.CompletedTask;
        }

        public async Task<SubscriptionUsageDto> GetSubscriptionUsageAsync(Guid subscriptionId)
        {
            var subscription = _subscriptions.FirstOrDefault(s => s.Id == subscriptionId);
            if (subscription == null)
            {
                throw new ArgumentException("Subscription not found.");
            }

            var pricingPlan = _pricingPlans.FirstOrDefault(p => p.Id == subscription.PricingPlanId);
            if (pricingPlan == null)
            {
                throw new InvalidOperationException("Pricing plan not found for subscription.");
            }

            // In a real application, this would query actual usage data
            return await Task.FromResult(new SubscriptionUsageDto
            {
                SubscriptionId = subscription.Id,
                CurrentAppointments = 5, // Dummy data
                CurrentUsers = 1, // Dummy data
                MaxAppointments = pricingPlan.MaxAppointments,
                MaxUsers = pricingPlan.MaxUsers
            });
        }

        public async Task UpdateSubscriptionUsageAsync(Guid subscriptionId, int usedAppointments, int usedUsers)
        {
            // This method would typically update usage metrics in a database
            // For this placeholder, we'll just acknowledge the call.
            await Task.CompletedTask;
        }
    }
}