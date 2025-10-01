using Xunit;
using Moq;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using NotificationService.Services;
using Microsoft.AspNetCore.Http; // Required for IHttpContextAccessor
using Hangfire;
using Hangfire.Common;
using Hangfire.States;

namespace NotificationService.Tests
{
    public class NotificationServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly NotificationService.Services.NotificationService _notificationService;
        private readonly Mock<IBackgroundJobClient> _mockBackgroundJobClient;

        public NotificationServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options, new Mock<IHttpContextAccessor>().Object);
            _mockBackgroundJobClient = new Mock<IBackgroundJobClient>();
            _notificationService = new NotificationService.Services.NotificationService(_context, _mockBackgroundJobClient.Object);
        }

        [Fact]
        public async Task SendNotificationAsync_AddsNotificationToDatabase()
        {
            // Arrange
            var notificationDto = new SendNotificationDto
            {
                UserId = Guid.NewGuid(),
                Title = "Test Notification",
                Message = "This is a test message.",
                Type = "email"
            };

            // Act
            await _notificationService.SendNotificationAsync(notificationDto);

            // Assert
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Title == "Test Notification");
            Assert.NotNull(notification);
            Assert.Equal(notificationDto.UserId, notification.UserId);
            Assert.Equal(notificationDto.Message, notification.Message);
            Assert.Equal(notificationDto.Type, notification.Type);
            Assert.False(notification.IsRead);
            Assert.NotEqual(default(DateTime), notification.SentAt);
            Assert.NotEqual(default(DateTime), notification.CreatedAt);

            _mockBackgroundJobClient.Verify(x => x.Create(
                It.IsAny<Job>(),
                It.IsAny<EnqueuedState>()), Times.Once);
        }

        [Fact]
        public async Task GetNotificationPreferencesAsync_ReturnsDefaultPreferences_WhenNoneExist()
        {
            // Arrange
            var userId = Guid.NewGuid();

            // Act
            var preferences = await _notificationService.GetNotificationPreferencesAsync(userId);

            // Assert
            Assert.NotNull(preferences);
            Assert.Equal(userId, preferences.UserId);
            Assert.True(preferences.EmailEnabled);
            Assert.True(preferences.SmsEnabled);
            Assert.True(preferences.PushEnabled);
            Assert.Null(preferences.PreferredTimezone);
        }

        [Fact]
        public async Task GetNotificationPreferencesAsync_ReturnsExistingPreferences_WhenExist()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var existingPreferences = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EmailEnabled = false,
                SmsEnabled = true,
                PushEnabled = false,
                PreferredTimezone = "GMT+1"
            };
            _context.NotificationPreferences.Add(existingPreferences);
            await _context.SaveChangesAsync();

            // Act
            var preferences = await _notificationService.GetNotificationPreferencesAsync(userId);

            // Assert
            Assert.NotNull(preferences);
            Assert.Equal(userId, preferences.UserId);
            Assert.False(preferences.EmailEnabled);
            Assert.True(preferences.SmsEnabled);
            Assert.False(preferences.PushEnabled);
            Assert.Equal("GMT+1", preferences.PreferredTimezone);
        }

        [Fact]
        public async Task UpdateNotificationPreferencesAsync_CreatesNewPreferences_WhenNoneExist()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var preferencesDto = new NotificationPreferenceDto
            {
                UserId = userId,
                EmailEnabled = true,
                SmsEnabled = false,
                PushEnabled = true,
                PreferredTimezone = "PST"
            };

            // Act
            await _notificationService.UpdateNotificationPreferencesAsync(userId, preferencesDto);

            // Assert
            var savedPreferences = await _context.NotificationPreferences.FirstOrDefaultAsync(p => p.UserId == userId);
            Assert.NotNull(savedPreferences);
            Assert.Equal(preferencesDto.EmailEnabled, savedPreferences.EmailEnabled);
            Assert.Equal(preferencesDto.SmsEnabled, savedPreferences.SmsEnabled);
            Assert.Equal(preferencesDto.PushEnabled, savedPreferences.PushEnabled);
            Assert.Equal(preferencesDto.PreferredTimezone, savedPreferences.PreferredTimezone);
        }

        [Fact]
        public async Task UpdateNotificationPreferencesAsync_UpdatesExistingPreferences()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var existingPreferences = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EmailEnabled = true,
                SmsEnabled = true,
                PushEnabled = true,
                PreferredTimezone = "EST"
            };
            _context.NotificationPreferences.Add(existingPreferences);
            await _context.SaveChangesAsync();

            var preferencesDto = new NotificationPreferenceDto
            {
                UserId = userId,
                EmailEnabled = false,
                SmsEnabled = false,
                PushEnabled = false,
                PreferredTimezone = "CST"
            };

            // Act
            await _notificationService.UpdateNotificationPreferencesAsync(userId, preferencesDto);

            // Assert
            var updatedPreferences = await _context.NotificationPreferences.FirstOrDefaultAsync(p => p.UserId == userId);
            Assert.NotNull(updatedPreferences);
            Assert.Equal(preferencesDto.EmailEnabled, updatedPreferences.EmailEnabled);
            Assert.Equal(preferencesDto.SmsEnabled, updatedPreferences.SmsEnabled);
            Assert.Equal(preferencesDto.PushEnabled, updatedPreferences.PushEnabled);
            Assert.Equal(preferencesDto.PreferredTimezone, updatedPreferences.PreferredTimezone);
        }

        [Fact]
        public async Task GetNotificationHistoryAsync_ReturnsNotificationsForUser()
        {
            // Arrange
            var userId1 = Guid.NewGuid();
            var userId2 = Guid.NewGuid();

            _context.Notifications.Add(new Notification { Id = Guid.NewGuid(), UserId = userId1, Title = "Note 1", Message = "Msg 1", Type = "email", SentAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow, Status = "Sent" });
            _context.Notifications.Add(new Notification { Id = Guid.NewGuid(), UserId = userId1, Title = "Note 2", Message = "Msg 2", Type = "sms", SentAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow, Status = "Sent" });
            _context.Notifications.Add(new Notification { Id = Guid.NewGuid(), UserId = userId2, Title = "Note 3", Message = "Msg 3", Type = "push", SentAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow, Status = "Sent" });
            await _context.SaveChangesAsync();

            // Act
            var history = await _notificationService.GetNotificationHistoryAsync(userId1);

            // Assert
            Assert.NotNull(history);
            Assert.Equal(2, history.Length);
            Assert.Contains(history, n => n.Title == "Note 1");
            Assert.Contains(history, n => n.Title == "Note 2");
            Assert.DoesNotContain(history, n => n.Title == "Note 3");
        }
    }
}