using Xunit;
using System;
using System.Threading.Tasks;
using ConfigurationService.Validators;
using Shared.DTOs;

namespace ConfigurationService.Tests
{
    public class SubscriptionValidatorTests
    {
        private readonly SubscriptionValidator _validator;

        public SubscriptionValidatorTests()
        {
            _validator = new SubscriptionValidator();
        }

        [Fact]
        public async Task ValidateCreateSubscriptionAsync_ValidDto_NoException()
        {
            // Arrange
            var dto = new CreateSubscriptionDto
            {
                UserId = Guid.NewGuid(),
                PricingPlanId = Guid.NewGuid()
            };

            // Act & Assert
            await _validator.ValidateCreateSubscriptionAsync(dto); // No exception means success
        }

        [Fact]
        public async Task ValidateCreateSubscriptionAsync_EmptyUserId_ThrowsArgumentException()
        {
            // Arrange
            var dto = new CreateSubscriptionDto
            {
                UserId = Guid.Empty,
                PricingPlanId = Guid.NewGuid()
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => _validator.ValidateCreateSubscriptionAsync(dto));
            Assert.Contains("User ID cannot be empty.", exception.Message);
        }

        [Fact]
        public async Task ValidateCreateSubscriptionAsync_EmptyPricingPlanId_ThrowsArgumentException()
        {
            // Arrange
            var dto = new CreateSubscriptionDto
            {
                UserId = Guid.NewGuid(),
                PricingPlanId = Guid.Empty
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => _validator.ValidateCreateSubscriptionAsync(dto));
            Assert.Contains("Pricing Plan ID cannot be empty.", exception.Message);
        }

        [Fact]
        public async Task ValidateUpdateSubscriptionAsync_ValidDto_NoException()
        {
            // Arrange
            var dto = new UpdateSubscriptionDto
            {
                PricingPlanId = Guid.NewGuid()
            };

            // Act & Assert
            await _validator.ValidateUpdateSubscriptionAsync(dto); // No exception means success
        }

        [Fact]
        public async Task ValidateUpdateSubscriptionAsync_EmptyPricingPlanId_ThrowsArgumentException()
        {
            // Arrange
            var dto = new UpdateSubscriptionDto
            {
                PricingPlanId = Guid.Empty
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => _validator.ValidateUpdateSubscriptionAsync(dto));
            Assert.Contains("Pricing Plan ID cannot be empty.", exception.Message);
        }
    }
}