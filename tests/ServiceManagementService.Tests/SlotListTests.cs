using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using ServiceManagementService.Services;
using ServiceManagementService.Validators;
using Shared.Data;
using Shared.Models;
using Shared.Events;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using System.Threading.Tasks;
using Shared.DTOs;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ServiceManagementService.Tests
{
    public class SlotListTests : IDisposable
    {
        private readonly Mock<ILogger<SlotService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<ISlotValidator> _validatorMock;
        private readonly SlotService _slotService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId; // Store the test tenant ID

        public SlotListTests()
        {
            // Create a test tenant ID that will be used consistently
            _testTenantId = Guid.NewGuid();
            
            // Create a mock IHttpContextAccessor with a tenant ID claim
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            
            // Create a claims identity with a tenant ID claim
            var claims = new List<Claim>
            {
                new Claim("TenantId", _testTenantId.ToString())
            };
            var claimsIdentity = new ClaimsIdentity(claims);
            mockHttpContext.User = new ClaimsPrincipal(claimsIdentity);
            
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);

            // Create DbContextOptions
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            // Create actual context with mocked IHttpContextAccessor
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
        public async Task GetSlotsAsync_ReturnsSlots()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            var providerId = Guid.NewGuid();

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

            // Add slots to the database
            var slot1 = new Slot
            {
                Id = Guid.NewGuid(),
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                AvailableBookings = 5,
                IsAvailable = true,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Slots.Add(slot1);

            var slot2 = new Slot
            {
                Id = Guid.NewGuid(),
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(3),
                EndDateTime = DateTime.UtcNow.AddHours(4),
                MaxBookings = 10,
                AvailableBookings = 10,
                IsAvailable = true,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Slots.Add(slot2);

            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _slotService.GetSlotsAsync(userId, tenantId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }
    }
}