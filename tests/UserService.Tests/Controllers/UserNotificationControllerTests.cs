using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Contracts;
using Shared.Models;
using UserService.Controllers;
using Shared.DTOs;
using Xunit;

namespace UserService.Tests.Controllers
{
    public class UserNotificationControllerTests
    {
        private readonly Mock<IUserService> _mockUserService;
        private readonly Mock<ILogger<UserNotificationController>> _mockLogger;
        private readonly UserNotificationController _controller;
        private readonly Guid _testUserId;

        public UserNotificationControllerTests()
        {
            _mockUserService = new Mock<IUserService>();
            _mockLogger = new Mock<ILogger<UserNotificationController>>();
            _controller = new UserNotificationController(_mockUserService.Object, _mockLogger.Object);
            _testUserId = Guid.NewGuid();

            // Setup user identity
            var claims = new[] { new Claim("sub", _testUserId.ToString()) };
            var identity = new ClaimsIdentity(claims);
            var principal = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }

        [Fact]
        public async Task GetNotificationPreferences_ShouldReturnOk_WhenUserIsAuthorized()
        {
            // Arrange
            var preferences = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                UserId = _testUserId,
                EmailEnabled = true,
                SmsEnabled = false,
                PushEnabled = true,
                PreferredTimezone = "UTC"
            };

            _mockUserService.Setup(s => s.GetNotificationPreferencesAsync(_testUserId))
                .ReturnsAsync(preferences);

            // Act
            var result = await _controller.GetNotificationPreferences(_testUserId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            // Additional assertions can be made on the response structure
        }

        [Fact]
        public async Task GetNotificationPreferences_ShouldReturnForbid_WhenUserIsNotAuthorized()
        {
            // Arrange
            var otherUserId = Guid.NewGuid();

            // Act
            var result = await _controller.GetNotificationPreferences(otherUserId);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task GetNotificationPreferences_ShouldReturnNotFound_WhenPreferencesNotFound()
        {
            // Arrange
            _mockUserService.Setup(s => s.GetNotificationPreferencesAsync(_testUserId))
                .ReturnsAsync((NotificationPreference)null);

            // Act
            var result = await _controller.GetNotificationPreferences(_testUserId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task UpdateNotificationPreferences_ShouldReturnOk_WhenUserIsAuthorized()
        {
            // Arrange
            var request = new UpdateNotificationPreferencesRequest
            {
                EmailEnabled = false,
                SmsEnabled = true,
                PushEnabled = false,
                PreferredTimezone = "EST"
            };

            var updatedPreferences = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                UserId = _testUserId,
                EmailEnabled = false,
                SmsEnabled = true,
                PushEnabled = false,
                PreferredTimezone = "EST"
            };

            _mockUserService.Setup(s => s.UpdateNotificationPreferencesAsync(_testUserId, It.IsAny<NotificationPreference>()))
                .ReturnsAsync(updatedPreferences);

            // Act
            var result = await _controller.UpdateNotificationPreferences(_testUserId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
        }

        [Fact]
        public async Task UpdateNotificationPreferences_ShouldReturnForbid_WhenUserIsNotAuthorized()
        {
            // Arrange
            var otherUserId = Guid.NewGuid();
            var request = new UpdateNotificationPreferencesRequest
            {
                EmailEnabled = true,
                SmsEnabled = true,
                PushEnabled = true
            };

            // Act
            var result = await _controller.UpdateNotificationPreferences(otherUserId, request);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task UpdateNotificationPreferences_ShouldReturnBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var request = new UpdateNotificationPreferencesRequest
            {
                EmailEnabled = true,
                SmsEnabled = true,
                PushEnabled = true
            };

            _controller.ModelState.AddModelError("EmailEnabled", "Required");

            // Act
            var result = await _controller.UpdateNotificationPreferences(_testUserId, request);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}