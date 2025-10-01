using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using SlotManagementService.Services;
using SlotManagementService.Validators;
using Shared.Data;
using Shared.Models;
using Shared.Events;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using System;
using System.Collections.Generic;
using System.Linq;
using Shared.DTOs;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace SlotManagementService.Tests
{
    public class UpdateSlotTests : IDisposable
    {
        private readonly Mock<ILogger<SlotService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<ISlotValidator> _validatorMock;
        private readonly SlotService _slotService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public UpdateSlotTests()
        {
            _testTenantId = Guid.NewGuid();
            
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            
            var claims = new List<Claim>
            {
                new Claim("TenantId", _testTenantId.ToString())
            };
            var claimsIdentity = new ClaimsIdentity(claims);
            mockHttpContext.User = new ClaimsPrincipal(claimsIdentity);
            
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _dbContext = new ApplicationDbContext(options, _mockHttpContextAccessor.Object);
            _loggerMock = new Mock<ILogger<SlotService>>();
            _publishEndpointMock = new Mock<IPublishEndpoint>();
            _validatorMock = new Mock<ISlotValidator>();
            _slotService = new SlotService(_dbContext, _validatorMock.Object, _publishEndpointMock.Object);
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }

        [Fact]
        public async Task UpdateSlotAsync_ValidRequest_UpdatesSlot()
        {
            // Arrange
            var providerId = Guid.NewGuid();
            var userId = providerId; // Ensure userId matches providerId for authorization
            var tenantId = _testTenantId;
            var slotId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();

            // Add a provider user to the database
            var provider = new User
            {
                Id = providerId,
                Email = "provider@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Provider",
                UserType = UserRole.Provider,
                TenantId = tenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Users.Add(provider);
            await _dbContext.SaveChangesAsync(); // Ensure provider is saved

            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = providerId,
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);

            // Add a slot to the database
            var slot = new Slot
            {
                Id = slotId,
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                AvailableBookings = 5,
                IsAvailable = true,
                IsRecurring = false,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Slots.Add(slot);
            await _dbContext.SaveChangesAsync();

            var request = new UpdateSlotRequest
            {
                StartDateTime = DateTime.UtcNow.AddHours(3),
                EndDateTime = DateTime.UtcNow.AddHours(4),
                MaxBookings = 10,
                IsAvailable = false
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateUpdateSlotRequest(It.IsAny<UpdateSlotRequest>()))
                .Returns(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act
            var result = await _slotService.UpdateSlotAsync(slotId, request, userId, tenantId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(request.StartDateTime, result.StartDateTime);
            Assert.Equal(request.EndDateTime, result.EndDateTime);
            Assert.Equal(request.MaxBookings, result.MaxBookings);
            Assert.Equal(request.IsAvailable, result.IsAvailable);

            // Verify that the event was published
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<SlotUpdatedEvent>(), default), Times.Once);
        }

        [Fact]
        public async Task UpdateSlotAsync_UnauthorizedUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var providerId = Guid.NewGuid();
            var userId = Guid.NewGuid(); // This userId will be used for the unauthorized attempt
            while (userId == providerId) // Ensure userId is different from providerId
            {
                userId = Guid.NewGuid();
            }
            var tenantId = _testTenantId;
            var slotId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();

            // Add a provider user to the database
            var provider = new User
            {
                Id = providerId,
                Email = "provider@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Provider",
                UserType = UserRole.Provider,
                TenantId = tenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Users.Add(provider);

            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = providerId, // Different provider
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);

            // Add a slot to the database
            var slot = new Slot
            {
                Id = slotId,
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                AvailableBookings = 5,
                IsAvailable = true,
                IsRecurring = false,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Slots.Add(slot);
            await _dbContext.SaveChangesAsync();

            var request = new UpdateSlotRequest
            {
                StartDateTime = DateTime.UtcNow.AddHours(3),
                EndDateTime = DateTime.UtcNow.AddHours(4),
                MaxBookings = 10,
                IsAvailable = false
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateUpdateSlotRequest(It.IsAny<UpdateSlotRequest>()))
                .Returns(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _slotService.UpdateSlotAsync(slotId, request, userId, tenantId));
        }
    }
}