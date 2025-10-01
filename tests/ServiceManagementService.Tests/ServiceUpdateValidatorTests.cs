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
using System;
using System.Security.Claims;

namespace ServiceManagementService.Tests
{
    public class ServiceUpdateValidatorTests : IDisposable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ServiceValidator _validator;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId; // Store the test tenant ID

        public ServiceUpdateValidatorTests()
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
        public async Task ValidateUpdateServiceRequestAsync_ValidRequest_ReturnsValidResult()
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

            var request = new UpdateServiceRequest
            {
                Name = "Updated Service",
                Description = "Updated Description",
                CategoryId = categoryId, // Use the valid categoryId
                Duration = 90,
                Price = 150.00m,
                Currency = "EUR",
                IsActive = false,
                IsFeatured = true,
                MaxBookingsPerDay = 10
            };

            // Act
            var result = await _validator.ValidateUpdateServiceRequestAsync(request, tenantId);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateUpdateServiceRequestAsync_InvalidDuration_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new UpdateServiceRequest
            {
                Duration = -10 // Invalid duration
            };

            // Act
            var result = await _validator.ValidateUpdateServiceRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Service duration must be greater than 0", result.Errors);
        }
    }
}