using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Shared.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Shared.DTOs;
using Microsoft.AspNetCore.Http;
using ServiceManagementService.Validators;
using System;
using System.Security.Claims;

namespace ServiceManagementService.Tests
{
    public class SlotCreateValidatorTests : IDisposable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ServiceManagementService.Validators.SlotValidator _validator;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public SlotCreateValidatorTests()
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
            
            _validator = new ServiceManagementService.Validators.SlotValidator(_dbContext);
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
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
            await _dbContext.SaveChangesAsync();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = providerId, // Use the providerId here
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

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_MissingServiceId_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new CreateSlotRequest
            {
                ServiceId = Guid.Empty, // Missing service ID
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Service ID is required", result.Errors);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_InvalidServiceId_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var providerId = Guid.NewGuid(); // Add providerId
            
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
            await _dbContext.SaveChangesAsync();

            var request = new CreateSlotRequest
            {
                ServiceId = Guid.NewGuid(), // Non-existent service
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Invalid service ID", result.Errors);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_StartAfterEnd_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            var providerId = Guid.NewGuid(); // Add providerId

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
            await _dbContext.SaveChangesAsync();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = providerId, // Use the providerId here
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
                StartDateTime = DateTime.UtcNow.AddHours(2), // Start after end
                EndDateTime = DateTime.UtcNow.AddHours(1),   // End before start
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Start date/time must be before end date/time", result.Errors);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_SlotConflict_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            var providerId = Guid.NewGuid(); // Add providerId
            var existingSlotStart = DateTime.UtcNow.AddHours(1);
            var existingSlotEnd = DateTime.UtcNow.AddHours(2);
            
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
            await _dbContext.SaveChangesAsync();

            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = providerId, // Use the providerId here
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
            
            // Add an existing slot that conflicts
            var existingSlot = new Slot
            {
                Id = Guid.NewGuid(),
                ServiceId = serviceId,
                StartDateTime = existingSlotStart,
                EndDateTime = existingSlotEnd,
                MaxBookings = 5,
                AvailableBookings = 5,
                IsAvailable = true,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Slots.Add(existingSlot);
            await _dbContext.SaveChangesAsync();

            var request = new CreateSlotRequest
            {
                ServiceId = serviceId,
                StartDateTime = existingSlotStart.AddMinutes(30), // Conflicts with existing slot
                EndDateTime = existingSlotEnd.AddMinutes(30),     // Conflicts with existing slot
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Slot conflicts with existing slot for this service", result.Errors);
        }
    }
}