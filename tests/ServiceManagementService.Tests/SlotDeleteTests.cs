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
    public class SlotDeleteTests : IDisposable
    {
        private readonly Mock<ILogger<SlotService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<ISlotValidator> _validatorMock;
        private readonly SlotService _slotService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public SlotDeleteTests()
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
        public async Task DeleteSlotAsync_ExistingSlot_DeletesSlot()
        {
            // Arrange
            var providerId = Guid.NewGuid(); // This will be the userId for deleting slots
            var userId = providerId; // Ensure userId matches providerId for authorization
            var slotId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();

            // Add a provider user to the database - use the test tenant ID
            var provider = new User
            {
                Id = providerId,
                Email = "provider@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Provider",
                UserType = UserRole.Provider,
                TenantId = _testTenantId, // Use the consistent test tenant ID
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Users.Add(provider);

            // Add a service to the database - use the test tenant ID
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = providerId,
                TenantId = _testTenantId, // Use the consistent test tenant ID
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);

            // Add a slot to the database - use the test tenant ID
            var slot = new Slot
            {
                Id = slotId,
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                AvailableBookings = 5,
                IsAvailable = true,
                TenantId = _testTenantId, // Use the consistent test tenant ID
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Slots.Add(slot);
            await _dbContext.SaveChangesAsync();

            // Act - use the test tenant ID
            var result = await _slotService.DeleteSlotAsync(slotId, userId, _testTenantId);

            // Assert
            Assert.True(result);

            // Verify that the slot was deleted
            var deletedSlot = await _dbContext.Slots.FindAsync(slotId);
            Assert.Null(deletedSlot);

            // Verify that the event was published
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<SlotDeletedEvent>(), default), Times.Once);
        }

        [Fact]
        public async Task DeleteSlotAsync_SlotWithBookings_ThrowsInvalidOperationException()
        {
            // Arrange
            var providerId = Guid.NewGuid(); // This will be the userId for deleting slots
            var userId = providerId; // Ensure userId matches providerId for authorization
            var slotId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();
            var customerId = Guid.NewGuid();

            // Add a provider user to the database - use the test tenant ID
            var provider = new User
            {
                Id = providerId,
                Email = "provider@test.com",
                PasswordHash = "dummy_hash",
                PasswordSalt = "dummy_salt",
                FirstName = "Test",
                LastName = "Provider",
                UserType = UserRole.Provider,
                TenantId = _testTenantId, // Use the consistent test tenant ID
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Users.Add(provider);

            // Add a customer user to the database - use the test tenant ID
            var customer = new User
            {
                Id = customerId,
                Email = "customer@test.com",
                PasswordHash = "dummy_hash",
                PasswordSalt = "dummy_salt",
                FirstName = "Test",
                LastName = "Customer",
                UserType = UserRole.Customer,
                TenantId = _testTenantId, // Use the consistent test tenant ID
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Users.Add(customer);

            // Add a service to the database - use the test tenant ID
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = providerId,
                TenantId = _testTenantId, // Use the consistent test tenant ID
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);

            // Add a slot to the database - use the test tenant ID
            var slot = new Slot
            {
                Id = slotId,
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                AvailableBookings = 4, // One booking already exists
                IsAvailable = true,
                TenantId = _testTenantId, // Use the consistent test tenant ID
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Slots.Add(slot);

            // Add a booking to the database - use the test tenant ID
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                ServiceId = serviceId,
                SlotId = slotId,
                TenantId = _testTenantId, // Use the consistent test tenant ID
                Status = "Confirmed",
                BookingDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Bookings.Add(booking);
            await _dbContext.SaveChangesAsync();

            // Act & Assert - use the test tenant ID
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _slotService.DeleteSlotAsync(slotId, userId, _testTenantId));
        }
    }
}