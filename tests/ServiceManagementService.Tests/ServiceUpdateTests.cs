using System;
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
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Shared.DTOs;

namespace ServiceManagementService.Tests
{
    public class ServiceUpdateTests : IDisposable
    {
        private readonly Mock<ILogger<ServiceService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<IServiceValidator> _validatorMock;
        private readonly ServiceService _serviceService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId; // Store the test tenant ID

        public ServiceUpdateTests()
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
            _loggerMock = new Mock<ILogger<ServiceService>>();
            _publishEndpointMock = new Mock<IPublishEndpoint>();
            _validatorMock = new Mock<IServiceValidator>();
            _serviceService = new ServiceService(_dbContext, _validatorMock.Object, _publishEndpointMock.Object);
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }

        [Fact]
        public async Task UpdateServiceAsync_ValidRequest_UpdatesService()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            var categoryId = Guid.NewGuid();

            // Add a provider user to the database
            var provider = new User
            {
                Id = userId,
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

            // Add a category to the database
            var category = new ServiceCategory
            {
                Id = categoryId,
                Name = "Test Category",
                TenantId = tenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.ServiceCategories.Add(category);

            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = categoryId,
                ProviderId = userId,
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

            var request = new Shared.DTOs.UpdateServiceRequest
            {
                Name = "Updated Service",
                Description = "Updated Description",
                Duration = 90,
                Price = 150.00m,
                IsActive = false
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateUpdateServiceRequestAsync(It.IsAny<Shared.DTOs.UpdateServiceRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act
            var result = await _serviceService.UpdateServiceAsync(serviceId, request, userId, tenantId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Service", result.Name);
            Assert.Equal("Updated Description", result.Description);
            Assert.Equal(90, result.Duration);
            Assert.Equal(150.00m, result.Price);
            Assert.False(result.IsActive);

            // Verify that the event was published
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceUpdatedEvent>(), default), Times.Once);
        }

        [Fact]
        public async Task UpdateServiceAsync_UnauthorizedUser_ThrowsUnauthorizedAccessException()
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

            // Add a service to the database owned by a different provider
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
            await _dbContext.SaveChangesAsync();

            var request = new Shared.DTOs.UpdateServiceRequest
            {
                Name = "Updated Service"
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateUpdateServiceRequestAsync(It.IsAny<Shared.DTOs.UpdateServiceRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _serviceService.UpdateServiceAsync(serviceId, request, userId, tenantId));
        }
    }
}