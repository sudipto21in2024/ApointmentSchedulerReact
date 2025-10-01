using Xunit;
using System;
using System.Threading.Tasks;
using Shared.DTOs;
using NotificationService.Validators;

namespace NotificationService.Tests
{
    public class NotificationValidatorTests
    {
        private readonly NotificationValidator _validator;

        public NotificationValidatorTests()
        {
            _validator = new NotificationValidator();
        }

        [Fact]
        public async Task ValidateSendNotificationAsync_ThrowsArgumentNullException_WhenDtoIsNull()
        {
            // Arrange
            SendNotificationDto? notificationDto = null;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _validator.ValidateSendNotificationAsync(notificationDto));
        }

        [Fact]
        public async Task ValidateSendNotificationAsync_ThrowsArgumentException_WhenUserIdIsEmpty()
        {
            // Arrange
            var notificationDto = new SendNotificationDto
            {
                UserId = Guid.Empty,
                Title = "Title",
                Message = "Message",
                Type = "email"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _validator.ValidateSendNotificationAsync(notificationDto));
        }

        [Fact]
        public async Task ValidateSendNotificationAsync_ThrowsArgumentException_WhenTitleIsEmpty()
        {
            // Arrange
            var notificationDto = new SendNotificationDto
            {
                UserId = Guid.NewGuid(),
                Title = "",
                Message = "Message",
                Type = "email"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _validator.ValidateSendNotificationAsync(notificationDto));
        }

        [Fact]
        public async Task ValidateSendNotificationAsync_ThrowsArgumentException_WhenMessageIsEmpty()
        {
            // Arrange
            var notificationDto = new SendNotificationDto
            {
                UserId = Guid.NewGuid(),
                Title = "Title",
                Message = "",
                Type = "email"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _validator.ValidateSendNotificationAsync(notificationDto));
        }

        [Fact]
        public async Task ValidateSendNotificationAsync_ThrowsArgumentException_WhenTypeIsEmpty()
        {
            // Arrange
            var notificationDto = new SendNotificationDto
            {
                UserId = Guid.NewGuid(),
                Title = "Title",
                Message = "Message",
                Type = ""
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _validator.ValidateSendNotificationAsync(notificationDto));
        }

        [Fact]
        public async Task ValidateSendNotificationAsync_DoesNotThrowException_WhenDtoIsValid()
        {
            // Arrange
            var notificationDto = new SendNotificationDto
            {
                UserId = Guid.NewGuid(),
                Title = "Title",
                Message = "Message",
                Type = "email"
            };

            // Act & Assert
            await _validator.ValidateSendNotificationAsync(notificationDto); // No exception means success
        }

        [Fact]
        public async Task ValidateUpdateNotificationPreferencesAsync_ThrowsArgumentNullException_WhenDtoIsNull()
        {
            // Arrange
            NotificationPreferenceDto? preferencesDto = null;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _validator.ValidateUpdateNotificationPreferencesAsync(preferencesDto));
        }

        [Fact]
        public async Task ValidateUpdateNotificationPreferencesAsync_ThrowsArgumentException_WhenUserIdIsEmpty()
        {
            // Arrange
            var preferencesDto = new NotificationPreferenceDto
            {
                UserId = Guid.Empty,
                EmailEnabled = true,
                SmsEnabled = false,
                PushEnabled = true
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _validator.ValidateUpdateNotificationPreferencesAsync(preferencesDto));
        }

        [Fact]
        public async Task ValidateUpdateNotificationPreferencesAsync_DoesNotThrowException_WhenDtoIsValid()
        {
            // Arrange
            var preferencesDto = new NotificationPreferenceDto
            {
                UserId = Guid.NewGuid(),
                EmailEnabled = true,
                SmsEnabled = false,
                PushEnabled = true
            };

            // Act & Assert
            await _validator.ValidateUpdateNotificationPreferencesAsync(preferencesDto); // No exception means success
        }
    }
}