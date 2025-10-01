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
    public class RecurringSlotTests : IDisposable
    {
        private readonly Mock<ILogger<SlotService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<ISlotValidator> _validatorMock;
        private readonly SlotService _slotService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public RecurringSlotTests()
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
        public async Task CreateRecurringSlotsAsync_ValidRequest_CreatesSlots()
        {
            // Arrange
            var providerId = Guid.NewGuid();
            var userId = providerId; // Ensure userId matches providerId for authorization
            var tenantId = _testTenantId;
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
            await _dbContext.SaveChangesAsync();

            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 3,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateRecurringSlotRequestAsync(It.IsAny<CreateRecurringSlotsRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act
            var result = await _slotService.CreateRecurringSlotsAsync(request, userId, tenantId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count());

            // Verify that the events were published
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<SlotCreatedEvent>(), default), Times.Exactly(3));
        }

        [Fact]
        public async Task CreateRecurringSlotsAsync_InvalidUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var providerId = Guid.NewGuid();
            var userId = Guid.NewGuid(); // This userId will be used for the unauthorized attempt
            while (userId == providerId) // Ensure userId is different from providerId
            {
                userId = Guid.NewGuid();
            }
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();

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
            await _dbContext.SaveChangesAsync();

            // Add a customer user to the database (not a provider)
            var customer = new User
            {
                Id = userId,
                Email = "customer@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Customer",
                UserType = UserRole.Customer,
                TenantId = tenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Users.Add(customer);
            await _dbContext.SaveChangesAsync();

            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 3,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateRecurringSlotRequestAsync(It.IsAny<CreateRecurringSlotsRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _slotService.CreateRecurringSlotsAsync(request, userId, tenantId));
        }
    }
}