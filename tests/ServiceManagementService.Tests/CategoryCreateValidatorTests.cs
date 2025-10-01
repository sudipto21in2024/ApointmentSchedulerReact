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
    public class CategoryCreateValidatorTests : IDisposable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ServiceValidator _validator;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public CategoryCreateValidatorTests()
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
        public async Task ValidateCreateCategoryRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new CreateCategoryRequest
            {
                Name = "Test Category",
                Description = "Test Description",
                ParentCategoryId = null,
                IconUrl = "http://example.com/icon.png",
                SortOrder = 1,
                IsActive = true
            };

            // Act
            var result = await _validator.ValidateCreateCategoryRequestAsync(request, tenantId);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateCreateCategoryRequestAsync_MissingName_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new CreateCategoryRequest
            {
                Name = "", // Missing name
                Description = "Test Description",
                ParentCategoryId = null,
                IconUrl = "http://example.com/icon.png",
                SortOrder = 1,
                IsActive = true
            };

            // Act
            var result = await _validator.ValidateCreateCategoryRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Category name is required", result.Errors);
        }
    }
}