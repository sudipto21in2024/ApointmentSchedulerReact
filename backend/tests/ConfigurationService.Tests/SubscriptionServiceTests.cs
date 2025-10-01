using Xunit;
using Moq;
using System;
using System.Threading.Tasks;
using ConfigurationService.Services;
using Shared.DTOs;
using System.Collections.Generic;
using System.Linq;

namespace ConfigurationService.Tests
{
    public class SubscriptionServiceTests
    {
        private readonly SubscriptionService _subscriptionService;

        public SubscriptionServiceTests()
        {
            _subscriptionService = new SubscriptionService();
        }

        [Fact]
        public async Task GetPricingPlansAsync_ReturnsAllPricingPlans()
        {
            // Act
            var plans = await _subscriptionService.GetPricingPlansAsync();

            // Assert
            Assert.NotNull(plans);
            Assert.Equal(3, plans.Count()); // Assuming 3 dummy plans
        }

        [Fact]
        public async Task GetPricingPlanByIdAsync_ReturnsCorrectPlan()
        {
            // Arrange
            var allPlans = await _subscriptionService.GetPricingPlansAsync();
            var firstPlanId = allPlans.First().Id;

            // Act
            var plan = await _subscriptionService.GetPricingPlanByIdAsync(firstPlanId);

            // Assert
            Assert.NotNull(plan);
            Assert.Equal(firstPlanId, plan.Id);
        }

        [Fact]
        public async Task GetPricingPlanByIdAsync_ReturnsNullForInvalidId()
        {
            // Act
            var plan = await _subscriptionService.GetPricingPlanByIdAsync(Guid.NewGuid());

            // Assert
            Assert.Null(plan);
        }

        [Fact]
        public async Task CreateSubscriptionAsync_CreatesNewSubscription()
        {
            // Arrange
            var allPlans = await _subscriptionService.GetPricingPlansAsync();
            var basicPlanId = allPlans.First().Id;
            var createDto = new CreateSubscriptionDto { UserId = Guid.NewGuid(), PricingPlanId = basicPlanId };

            // Act
            var subscription = await _subscriptionService.CreateSubscriptionAsync(createDto);

            // Assert
            Assert.NotNull(subscription);
            Assert.Equal(createDto.UserId, subscription.UserId);
            Assert.Equal(basicPlanId, subscription.PricingPlan.Id);
            Assert.Equal("active", subscription.Status);
        }

        [Fact]
        public async Task CreateSubscriptionAsync_ThrowsExceptionForInvalidPricingPlan()
        {
            // Arrange
            var createDto = new CreateSubscriptionDto { UserId = Guid.NewGuid(), PricingPlanId = Guid.NewGuid() };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _subscriptionService.CreateSubscriptionAsync(createDto));
        }

        [Fact]
        public async Task ChangeSubscriptionPlanAsync_ChangesPlanSuccessfully()
        {
            // Arrange
            var allPlans = await _subscriptionService.GetPricingPlansAsync();
            var basicPlanId = allPlans.First().Id;
            var proPlanId = allPlans.Skip(1).First().Id;
            var createDto = new CreateSubscriptionDto { UserId = Guid.NewGuid(), PricingPlanId = basicPlanId };
            var initialSubscription = await _subscriptionService.CreateSubscriptionAsync(createDto);

            var updateDto = new UpdateSubscriptionDto { PricingPlanId = proPlanId };

            // Act
            var updatedSubscription = await _subscriptionService.ChangeSubscriptionPlanAsync(initialSubscription.Id, updateDto);

            // Assert
            Assert.NotNull(updatedSubscription);
            Assert.Equal(proPlanId, updatedSubscription.PricingPlan.Id);
        }

        [Fact]
        public async Task ChangeSubscriptionPlanAsync_ThrowsExceptionForInvalidSubscriptionId()
        {
            // Arrange
            var updateDto = new UpdateSubscriptionDto { PricingPlanId = Guid.NewGuid() };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _subscriptionService.ChangeSubscriptionPlanAsync(Guid.NewGuid(), updateDto));
        }

        [Fact]
        public async Task ChangeSubscriptionPlanAsync_ThrowsExceptionForInvalidNewPricingPlanId()
        {
            // Arrange
            var allPlans = await _subscriptionService.GetPricingPlansAsync();
            var basicPlanId = allPlans.First().Id;
            var createDto = new CreateSubscriptionDto { UserId = Guid.NewGuid(), PricingPlanId = basicPlanId };
            var initialSubscription = await _subscriptionService.CreateSubscriptionAsync(createDto);

            var updateDto = new UpdateSubscriptionDto { PricingPlanId = Guid.NewGuid() };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _subscriptionService.ChangeSubscriptionPlanAsync(initialSubscription.Id, updateDto));
        }

        [Fact]
        public async Task CancelSubscriptionAsync_SetsStatusToCancelled()
        {
            // Arrange
            var allPlans = await _subscriptionService.GetPricingPlansAsync();
            var basicPlanId = allPlans.First().Id;
            var createDto = new CreateSubscriptionDto { UserId = Guid.NewGuid(), PricingPlanId = basicPlanId };
            var subscription = await _subscriptionService.CreateSubscriptionAsync(createDto);

            // Act
            await _subscriptionService.CancelSubscriptionAsync(subscription.Id);
            var cancelledSubscription = await _subscriptionService.GetSubscriptionByIdAsync(subscription.Id);

            // Assert
            Assert.NotNull(cancelledSubscription);
            Assert.Equal("cancelled", cancelledSubscription.Status);
        }

        [Fact]
        public async Task CancelSubscriptionAsync_ThrowsExceptionForInvalidSubscriptionId()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _subscriptionService.CancelSubscriptionAsync(Guid.NewGuid()));
        }

        [Fact]
        public async Task GetSubscriptionUsageAsync_ReturnsUsageData()
        {
            // Arrange
            var allPlans = await _subscriptionService.GetPricingPlansAsync();
            var basicPlanId = allPlans.First().Id;
            var createDto = new CreateSubscriptionDto { UserId = Guid.NewGuid(), PricingPlanId = basicPlanId };
            var subscription = await _subscriptionService.CreateSubscriptionAsync(createDto);

            // Act
            var usage = await _subscriptionService.GetSubscriptionUsageAsync(subscription.Id);

            // Assert
            Assert.NotNull(usage);
            Assert.Equal(subscription.Id, usage.SubscriptionId);
            Assert.True(usage.MaxAppointments > 0);
        }

        [Fact]
        public async Task GetSubscriptionUsageAsync_ThrowsExceptionForInvalidSubscriptionId()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _subscriptionService.GetSubscriptionUsageAsync(Guid.NewGuid()));
        }
    }
}