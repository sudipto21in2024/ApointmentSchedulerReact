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
    public class SlotCreateTests : IDisposable
    {
        private readonly Mock<ILogger<SlotService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<ISlotValidator> _validatorMock;
        private readonly SlotService _slotService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId; // Store the test tenant ID

        public SlotCreateTests()
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
        public async Task CreateSlotAsync_ValidRequest_CreatesSlot()
        {
            // Arrange
            var providerId = Guid.NewGuid(); // This will be the userId for creating slots
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

            var request = new CreateSlotRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateCreateSlotRequestAsync(It.IsAny<CreateSlotRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act
            var result = await _slotService.CreateSlotAsync(request, userId, tenantId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(serviceId, result.ServiceId);
            Assert.Equal(request.StartDateTime, result.StartDateTime);
            Assert.Equal(request.EndDateTime, result.EndDateTime);
            Assert.Equal(request.MaxBookings, result.MaxBookings);
            Assert.Equal(request.MaxBookings, result.AvailableBookings); // Should be same as MaxBookings initially
            Assert.Equal(request.IsAvailable, result.IsAvailable);
            Assert.Equal(request.IsRecurring, result.IsRecurring);
            Assert.Equal(tenantId, result.TenantId);

            // Verify that the event was published
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<SlotCreatedEvent>(), default), Times.Once);
        }

        [Fact]
        public async Task CreateSlotAsync_InvalidUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var providerId = Guid.NewGuid(); // ID of the service provider
            var userId = Guid.NewGuid(); // This userId will be used for the unauthorized attempt
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

            // Add a customer user to the database (who is not the provider)
            var customer = new User
            {
                Id = userId, // This userId will be used for the unauthorized attempt
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

            // Add a service to the database owned by a different provider
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = providerId, // Owned by the provider
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

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateCreateSlotRequestAsync(It.IsAny<CreateSlotRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _slotService.CreateSlotAsync(request, userId, tenantId));
        }
    }
}