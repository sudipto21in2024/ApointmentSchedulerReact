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
    public class ServiceCreateTests : IDisposable
    {
        private readonly Mock<ILogger<ServiceService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<IServiceValidator> _validatorMock;
        private readonly ServiceService _serviceService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public ServiceCreateTests()
        {
            // Create a mock IHttpContextAccessor with a tenant ID claim
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            
            // Create a test tenant ID that will be used consistently
            _testTenantId = Guid.NewGuid();
            
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
        public async Task Test_Entity_Save_And_Retrieve()
        {
            // Arrange
            var tenantId = _testTenantId; // Use the consistent test tenant ID
            var userId = Guid.NewGuid();
            
            // Add a provider user to the database
            var provider = new User
            {
                Id = userId,
                Email = "provider@test.com",
                PasswordHash = "dummy_hash",
                PasswordSalt = "dummy_salt",
                FirstName = "Test",
                LastName = "Provider",
                UserType = UserRole.Provider,
                TenantId = tenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Users.Add(provider);
            await _dbContext.SaveChangesAsync();
            
            // Try to retrieve the user
            var retrievedUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            Assert.NotNull(retrievedUser);
            Assert.Equal(UserRole.Provider, retrievedUser.UserType);
        }
        
        [Fact]
        public async Task CreateServiceAsync_ValidRequest_CreatesService()
        {
            // Arrange
            var tenantId = _testTenantId; // Use the consistent test tenant ID
            var categoryId = Guid.NewGuid();

            // Add a provider user to the database
            var provider = new User
            {
                Id = Guid.NewGuid(), // Generate a new GUID for the provider's ID
                Email = "provider@test.com",
                PasswordHash = "dummy_hash",
                PasswordSalt = "dummy_salt",
                FirstName = "Test",
                LastName = "Provider",
                UserType = UserRole.Provider,
                TenantId = tenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Users.Add(provider);
            await _dbContext.SaveChangesAsync();

            var userId = provider.Id; // Now set userId to the provider's actual ID

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
            await _dbContext.SaveChangesAsync();

            var request = new Shared.DTOs.CreateServiceRequest
            {
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = categoryId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                IsFeatured = false,
                MaxBookingsPerDay = 5
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateCreateServiceRequestAsync(It.IsAny<Shared.DTOs.CreateServiceRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act
            var result = await _serviceService.CreateServiceAsync(request, userId, tenantId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
            Assert.Equal(request.Description, result.Description);
            Assert.Equal(request.CategoryId, result.CategoryId);
            Assert.Equal(userId, result.ProviderId);
            Assert.Equal(tenantId, result.TenantId);
            Assert.Equal(request.Duration, result.Duration);
            Assert.Equal(request.Price, result.Price);
            Assert.Equal(request.Currency, result.Currency);
            Assert.Equal(request.IsActive, result.IsActive);
            Assert.Equal(request.IsFeatured, result.IsFeatured);
            Assert.Equal(request.MaxBookingsPerDay, result.MaxBookingsPerDay);

            // Verify that the event was published
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceCreatedEvent>(), default), Times.Once);
        }

        [Fact]
        public async Task CreateServiceAsync_InvalidUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var tenantId = _testTenantId; // Use the consistent test tenant ID

            // Add a customer user to the database (not a provider)
            var customer = new User
            {
                Id = userId,
                Email = "customer@test.com",
                PasswordHash = "dummy_hash",
                PasswordSalt = "dummy_salt",
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

            var request = new Shared.DTOs.CreateServiceRequest
            {
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                IsFeatured = false,
                MaxBookingsPerDay = 5
            };

            // Setup validator to return valid result
            _validatorMock.Setup(v => v.ValidateCreateServiceRequestAsync(It.IsAny<Shared.DTOs.CreateServiceRequest>(), It.IsAny<Guid>()))
                .ReturnsAsync(new Shared.DTOs.ValidationResult { IsValid = true });

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _serviceService.CreateServiceAsync(request, userId, tenantId));
        }
    }
}