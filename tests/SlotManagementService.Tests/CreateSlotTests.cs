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
    public class CreateSlotTests : IDisposable
    {
        private readonly Mock<ILogger<SlotService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<ISlotValidator> _validatorMock;
        private readonly SlotService _slotService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public CreateSlotTests()
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
        public async Task CreateSlotAsync_ValidRequest_CreatesSlot()
        {
            // Arrange
            var providerId = Guid.NewGuid();
            var userId = providerId;
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();

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

            var request = new CreateSlotRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            _validatorMock.Setup(v => v.ValidateCreateSlotRequestAsync(It.IsAny<CreateSlotRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            var result = await _slotService.CreateSlotAsync(request, userId, tenantId);

            Assert.NotNull(result);
            Assert.Equal(request.ServiceId, result.ServiceId);
            Assert.Equal(request.StartDateTime, result.StartDateTime);
            Assert.Equal(request.EndDateTime, result.EndDateTime);
            Assert.Equal(request.MaxBookings, result.MaxBookings);
            Assert.Equal(result.MaxBookings, result.AvailableBookings);
            Assert.Equal(request.IsAvailable, result.IsAvailable);
            Assert.Equal(request.IsRecurring, result.IsRecurring);
            Assert.Equal(tenantId, result.TenantId);

            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<SlotCreatedEvent>(), default), Times.Once);
        }

        [Fact]
        public async Task CreateSlotAsync_InvalidUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            var providerId = Guid.NewGuid(); // Add providerId for the service

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

            var request = new CreateSlotRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            _validatorMock.Setup(v => v.ValidateCreateSlotRequestAsync(It.IsAny<CreateSlotRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _slotService.CreateSlotAsync(request, userId, tenantId));
        }
    }
}