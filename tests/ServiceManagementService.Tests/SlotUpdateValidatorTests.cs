using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Shared.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Shared.DTOs;
using Microsoft.AspNetCore.Http;
using Shared.Validators;
using System.Security.Claims;

namespace ServiceManagementService.Tests
{
    public class SlotUpdateValidatorTests : IDisposable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly SlotValidator _validator;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;

        public SlotUpdateValidatorTests()
        {
            // Create a mock IHttpContextAccessor with a tenant ID claim
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            
            // Create a claims identity with a tenant ID claim
            var claims = new List<Claim>
            {
                new Claim("TenantId", Guid.NewGuid().ToString())
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
            
            _validator = new SlotValidator(_dbContext);
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }

        [Fact]
        public void ValidateUpdateSlotRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
            var request = new UpdateSlotRequest
            {
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 10,
                IsAvailable = false
            };

            // Act
            var result = _validator.ValidateUpdateSlotRequest(request);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public void ValidateUpdateSlotRequestAsync_StartAfterEnd_ReturnsInvalidResult()
        {
            // Arrange
            var request = new UpdateSlotRequest
            {
                StartDateTime = DateTime.UtcNow.AddHours(2), // Start after end
                EndDateTime = DateTime.UtcNow.AddHours(1)    // End before start
            };

            // Act
            var result = _validator.ValidateUpdateSlotRequest(request);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Start date/time must be before end date/time", result.Errors);
        }
    }
}