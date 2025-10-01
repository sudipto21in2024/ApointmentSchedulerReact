using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Shared.Data;
using Shared.Models;
using UserService.Services;
using Shared.DTOs;
using Xunit;
using Microsoft.AspNetCore.Http;

namespace UserService.Tests.Services
{
    public class UserNotificationServiceTests : IDisposable
    {
        private readonly UserNotificationService _notificationService;
        private readonly ApplicationDbContext _dbContext;
        private readonly User _testUser;
        private readonly Guid _tenantId;

        public UserNotificationServiceTests()
        {
            _tenantId = Guid.NewGuid();

            _testUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "User",
                UserType = UserRole.Customer,
                TenantId = _tenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Setup in-memory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            SetupTenantClaims(_tenantId, mockHttpContextAccessor);

            _dbContext = new ApplicationDbContext(options, mockHttpContextAccessor.Object);
            _dbContext.Database.EnsureDeleted();
            _dbContext.Database.EnsureCreated();

            // Seed user
            _dbContext.Users.Add(_testUser);
            _dbContext.SaveChangesAsync().Wait();

            _notificationService = new UserNotificationService(_dbContext, Mock.Of<ILogger<UserNotificationService>>());
        }

        private void SetupTenantClaims(Guid tenantId, Mock<IHttpContextAccessor> mockHttpContextAccessor)
        {
            var mockHttpContext = new DefaultHttpContext();
            var claims = new System.Collections.Generic.List<System.Security.Claims.Claim>
            {
                new System.Security.Claims.Claim("TenantId", tenantId.ToString())
            };
            var claimsIdentity = new System.Security.Claims.ClaimsIdentity(claims);
            mockHttpContext.User = new System.Security.Claims.ClaimsPrincipal(claimsIdentity);
            mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);
        }

        [Fact]
        public async Task GetNotificationPreferencesAsync_ShouldReturnDefaultPreferences_WhenNoneExist()
        {
            // Act
            var result = await _notificationService.GetNotificationPreferencesAsync(_testUser.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(_testUser.Id, result.UserId);
            Assert.True(result.EmailEnabled);
            Assert.True(result.SmsEnabled);
            Assert.True(result.PushEnabled);
            Assert.Equal(_tenantId, result.TenantId);
        }

        [Fact]
        public async Task GetNotificationPreferencesAsync_ShouldReturnExistingPreferences_WhenTheyExist()
        {
            // Arrange
            var existingPreference = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                UserId = _testUser.Id,
                EmailEnabled = false,
                SmsEnabled = true,
                PushEnabled = false,
                PreferredTimezone = "UTC",
                TenantId = _tenantId
            };
            _dbContext.NotificationPreferences.Add(existingPreference);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _notificationService.GetNotificationPreferencesAsync(_testUser.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(existingPreference.Id, result.Id);
            Assert.False(result.EmailEnabled);
            Assert.True(result.SmsEnabled);
            Assert.False(result.PushEnabled);
            Assert.Equal("UTC", result.PreferredTimezone);
        }

        [Fact]
        public async Task UpdateNotificationPreferencesAsync_ShouldCreateNewPreferences_WhenNoneExist()
        {
            // Arrange
            var request = new UpdateNotificationPreferencesRequest
            {
                EmailEnabled = false,
                SmsEnabled = false,
                PushEnabled = true,
                PreferredTimezone = "EST"
            };

            // Act
            var result = await _notificationService.UpdateNotificationPreferencesAsync(_testUser.Id, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(_testUser.Id, result.UserId);
            Assert.False(result.EmailEnabled);
            Assert.False(result.SmsEnabled);
            Assert.True(result.PushEnabled);
            Assert.Equal("EST", result.PreferredTimezone);
            Assert.Equal(_tenantId, result.TenantId);
        }

        [Fact]
        public async Task UpdateNotificationPreferencesAsync_ShouldUpdateExistingPreferences_WhenTheyExist()
        {
            // Arrange
            var existingPreference = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                UserId = _testUser.Id,
                EmailEnabled = true,
                SmsEnabled = true,
                PushEnabled = true,
                PreferredTimezone = "UTC",
                TenantId = _tenantId
            };
            _dbContext.NotificationPreferences.Add(existingPreference);
            await _dbContext.SaveChangesAsync();
    
            var request = new UpdateNotificationPreferencesRequest
            {
                EmailEnabled = false,
                SmsEnabled = false,
                PushEnabled = true,
                PreferredTimezone = "PST"
            };
    
            // Act
            var result = await _notificationService.UpdateNotificationPreferencesAsync(_testUser.Id, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(existingPreference.Id, result.Id);
            Assert.False(result.EmailEnabled);
            Assert.False(result.SmsEnabled);
            Assert.True(result.PushEnabled);
            Assert.Equal("PST", result.PreferredTimezone);
        }

        [Fact]
        public async Task UpdateNotificationPreferencesAsync_ShouldThrowException_WhenUserDoesNotExist()
        {
            // Arrange
            var nonExistentUserId = Guid.NewGuid();
            var request = new UpdateNotificationPreferencesRequest
            {
                EmailEnabled = true,
                SmsEnabled = true,
                PushEnabled = true
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _notificationService.UpdateNotificationPreferencesAsync(nonExistentUserId, request));
        }

        public void Dispose()
        {
            _dbContext.Dispose();
        }
    }
}