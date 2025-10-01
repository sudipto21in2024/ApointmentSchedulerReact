using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using System;
using System.Threading.Tasks;
using ConfigurationService.Services;
using Xunit;
using Microsoft.AspNetCore.Http;

namespace ConfigurationService.Tests
{
    public class SystemAdminGlobalSettingsServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<SystemAdminGlobalSettingsService>> _loggerMock;
        private readonly SystemAdminGlobalSettingsService _service;

        public SystemAdminGlobalSettingsServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _context = new ApplicationDbContext(options, httpContextAccessorMock.Object);
            _loggerMock = new Mock<ILogger<SystemAdminGlobalSettingsService>>();
            _service = new SystemAdminGlobalSettingsService(_context, _loggerMock.Object);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task GetGlobalSettingsAsync_NoExistingSettings_CreatesDefault()
        {
            // Act
            var result = await _service.GetGlobalSettingsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.False(result.MaintenanceMode);
            Assert.Equal("UTC", result.DefaultTimezone);
            Assert.Equal(100, result.MaxUsersPerTenant);
            Assert.Equal(1000, result.MaxAppointmentsPerTenant);

            var settingsInDb = await _context.GlobalSettings.FirstOrDefaultAsync();
            Assert.NotNull(settingsInDb);
            Assert.Equal(result.Id, settingsInDb.Id);
        }

        [Fact]
        public async Task GetGlobalSettingsAsync_ExistingSettings_ReturnsExisting()
        {
            // Arrange
            var existingSettings = new GlobalSettings
            {
                Id = Guid.NewGuid(),
                MaintenanceMode = true,
                DefaultTimezone = "EST",
                MaxUsersPerTenant = 50,
                MaxAppointmentsPerTenant = 500,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.GlobalSettings.Add(existingSettings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetGlobalSettingsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(existingSettings.Id, result.Id);
            Assert.True(result.MaintenanceMode);
            Assert.Equal("EST", result.DefaultTimezone);
            Assert.Equal(50, result.MaxUsersPerTenant);
            Assert.Equal(500, result.MaxAppointmentsPerTenant);
        }

        [Fact]
        public async Task UpdateGlobalSettingsAsync_NoExistingSettings_CreatesNew()
        {
            // Arrange
            var request = new UpdateGlobalSettingsRequest
            {
                MaintenanceMode = true,
                DefaultTimezone = "PST",
                MaxUsersPerTenant = 200,
                MaxAppointmentsPerTenant = 2000
            };
            var updatedBy = Guid.NewGuid();

            // Act
            var result = await _service.UpdateGlobalSettingsAsync(request, updatedBy);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.MaintenanceMode);
            Assert.Equal("PST", result.DefaultTimezone);
            Assert.Equal(200, result.MaxUsersPerTenant);
            Assert.Equal(2000, result.MaxAppointmentsPerTenant);
            Assert.Equal(updatedBy, result.UpdatedBy);

            var settingsInDb = await _context.GlobalSettings.FirstOrDefaultAsync();
            Assert.NotNull(settingsInDb);
            Assert.Equal(result.Id, settingsInDb.Id);
        }

        [Fact]
        public async Task UpdateGlobalSettingsAsync_ExistingSettings_UpdatesExisting()
        {
            // Arrange
            var existingSettings = new GlobalSettings
            {
                Id = Guid.NewGuid(),
                MaintenanceMode = false,
                DefaultTimezone = "UTC",
                MaxUsersPerTenant = 100,
                MaxAppointmentsPerTenant = 1000,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.GlobalSettings.Add(existingSettings);
            await _context.SaveChangesAsync();

            var request = new UpdateGlobalSettingsRequest
            {
                MaintenanceMode = true,
                DefaultTimezone = "EST",
                MaxUsersPerTenant = 150,
                MaxAppointmentsPerTenant = 1500
            };
            var updatedBy = Guid.NewGuid();

            // Act
            var result = await _service.UpdateGlobalSettingsAsync(request, updatedBy);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(existingSettings.Id, result.Id);
            Assert.True(result.MaintenanceMode);
            Assert.Equal("EST", result.DefaultTimezone);
            Assert.Equal(150, result.MaxUsersPerTenant);
            Assert.Equal(1500, result.MaxAppointmentsPerTenant);
            Assert.Equal(updatedBy, result.UpdatedBy);

            var updatedSettings = await _context.GlobalSettings.FindAsync(existingSettings.Id);
            Assert.NotNull(updatedSettings);
            Assert.True(updatedSettings.MaintenanceMode);
            Assert.Equal("EST", updatedSettings.DefaultTimezone);
        }
    }
}