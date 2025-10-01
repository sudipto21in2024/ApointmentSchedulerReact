using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using ServiceManagementService.Validators;
using Shared.Data;
using Shared.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Shared.DTOs;
using ServiceManagementService.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ServiceManagementService.Tests
{
    public class ServiceCreateValidatorTests : IDisposable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ServiceValidator _validator;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public ServiceCreateValidatorTests()
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
            
            _validator = new ServiceValidator(_dbContext);
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }

        [Fact]
        public async Task ValidateCreateServiceRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var categoryId = Guid.NewGuid();
            
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

            var request = new CreateServiceRequest
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

            // Act
            var result = await _validator.ValidateCreateServiceRequestAsync(request, tenantId);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateCreateServiceRequestAsync_MissingName_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new CreateServiceRequest
            {
                Name = "",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                IsFeatured = false,
                MaxBookingsPerDay = 5
            };

            // Act
            var result = await _validator.ValidateCreateServiceRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Service name is required", result.Errors);
        }

        [Fact]
        public async Task ValidateCreateServiceRequestAsync_InvalidCategoryId_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var categoryId = Guid.NewGuid(); // This category will be added to the DB
            
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

            var request = new CreateServiceRequest
            {
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(), // This is the non-existent category
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                IsFeatured = false,
                MaxBookingsPerDay = 5
            };

            // Act
            var result = await _validator.ValidateCreateServiceRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Invalid category ID", result.Errors);
        }

        [Fact]
        public async Task ValidateCreateServiceRequestAsync_DuplicateName_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var categoryId = Guid.NewGuid();
            
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
            
            // Add an existing service with the same name
            var existingService = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Existing Service",
                CategoryId = categoryId,
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 30,
                Price = 50.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(existingService);
            await _dbContext.SaveChangesAsync();

            var request = new CreateServiceRequest
            {
                Name = "Test Service", // Same name as existing service
                Description = "Test Description",
                CategoryId = categoryId, // Use the valid categoryId
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                IsFeatured = false,
                MaxBookingsPerDay = 5
            };

            // Act
            var result = await _validator.ValidateCreateServiceRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Service name must be unique within tenant", result.Errors);
        }
    }
}